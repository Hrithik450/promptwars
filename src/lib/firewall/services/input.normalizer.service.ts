import {
  NormalizedInput,
  NormalizerFlag,
  NormalizerOptions,
} from "../types/normalizer.types";
import {
  HOMOGLYPH_MAP,
  ZERO_WIDTH_REGEX,
  SCRIPT_DEFINITIONS,
} from "../data/homoglyphs.data";
import { LEET_CHAR_MAP, TARGET_SECURITY_WORDS } from "../data/leetspeak.data";

export class InputNormalizerService {
  /**
   * Primary entry point for Layer 0: Input Normalization.
   * Performs all 8 deterministic normalization operations.
   */
  static normalize(
    rawInput: string,
    options: NormalizerOptions = {},
  ): NormalizedInput {
    const {
      maxDecodeDepth = 3,
      reverseLeetspeak = true,
      normalizeHomoglyphs = true,
      stripMarkdown = true,
    } = options;

    const original = rawInput ?? "";
    const flags = new Set<NormalizerFlag>();
    const decodedPayloads: string[] = [];

    // --- 1. Strip Zero-Width Characters ---
    const zeroWidthMatches = original.match(ZERO_WIDTH_REGEX);
    const strippedZeroWidthCount = zeroWidthMatches ? zeroWidthMatches.length : 0;
    if (strippedZeroWidthCount > 0) {
      flags.add("ZERO_WIDTH_CHARS");
      flags.add("OBFUSCATION_DETECTED");
    }
    let current = original.replace(ZERO_WIDTH_REGEX, "");

    // --- 2. Unicode Normalization (NFKC) & Homoglyphs ---
    const nfkcNormalized = current.normalize("NFKC");
    current = nfkcNormalized;

    if (normalizeHomoglyphs) {
      let homoglyphsReplaced = 0;
      let homoglyphReplacedText = "";
      for (const char of current) {
        if (HOMOGLYPH_MAP[char]) {
          homoglyphReplacedText += HOMOGLYPH_MAP[char];
          homoglyphsReplaced++;
        } else {
          homoglyphReplacedText += char;
        }
      }
      if (homoglyphsReplaced > 0) {
        flags.add("HOMOGLYPH_REPLACED");
        flags.add("OBFUSCATION_DETECTED");
        current = homoglyphReplacedText;
      }
    }

    // --- 3. Detect Mixed Scripts ---
    const detectedScripts = this.getDetectedScripts(original);
    if (detectedScripts.length > 1) {
      // Check if it has a non-Latin script mixed with Latin or multiple distinct alphabets
      const hasLatin = detectedScripts.includes("Latin");
      const hasConfusable =
        detectedScripts.includes("Cyrillic") ||
        detectedScripts.includes("Greek");
      if ((hasLatin && hasConfusable) || detectedScripts.length >= 3) {
        flags.add("MIXED_SCRIPT");
        flags.add("OBFUSCATION_DETECTED");
      }
    }

    // --- 4. Multi-level Nested Decoding (Base64, URL, HTML, Hex) ---
    let decodingLevels = 0;
    for (let depth = 0; depth < maxDecodeDepth; depth++) {
      const decodedResult = this.decodeOneLevel(current);
      if (decodedResult.decoded !== current) {
        decodingLevels++;
        current = decodedResult.decoded;
        decodedResult.flags.forEach((f) => flags.add(f));
        if (decodedResult.payloads.length > 0) {
          decodedPayloads.push(...decodedResult.payloads);
        }
      } else {
        break;
      }
    }

    // Check for inline base64 segments that might be embedded
    const inlineBase64 = this.extractAndDecodeBase64(current);
    if (inlineBase64.payloads.length > 0) {
      flags.add("BASE64_FOUND");
      flags.add("OBFUSCATION_DETECTED");
      decodedPayloads.push(...inlineBase64.payloads);
      current = inlineBase64.replaced;
    }

    // --- 5. Markdown & Formatting Stripping ---
    if (stripMarkdown) {
      current = this.stripMarkdownFormatting(current);
    }

    // --- 6. L33tspeak Reversal Mapping ---
    if (reverseLeetspeak) {
      const leetResult = this.normalizeLeetspeak(current);
      if (leetResult.modified) {
        flags.add("LEETSPEAK_DETECTED");
        flags.add("OBFUSCATION_DETECTED");
        current = leetResult.text;
      }
    }

    // --- 7. Collapse Whitespace ---
    current = current
      .replace(/[\r\n\t\f\v\u00A0\u3000]+/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();

    // --- 8. Lowercase Copy ---
    const lowered = current.toLowerCase();

    return {
      original,
      normalized: current,
      lowered,
      flags: Array.from(flags),
      decodedPayloads,
      metadata: {
        originalLength: original.length,
        normalizedLength: current.length,
        strippedZeroWidthCount,
        decodingLevels,
        detectedScripts,
      },
    };
  }

  /**
   * Detects Unicode scripts present in the text.
   */
  private static getDetectedScripts(text: string): string[] {
    const scripts: string[] = [];
    for (const def of SCRIPT_DEFINITIONS) {
      if (def.pattern.test(text)) {
        scripts.push(def.name);
      }
    }
    return scripts;
  }

  /**
   * Attempts single pass of decoding URL entities, HTML entities, and Hex bytes.
   */
  private static decodeOneLevel(input: string): {
    decoded: string;
    flags: NormalizerFlag[];
    payloads: string[];
  } {
    const flags: NormalizerFlag[] = [];
    const payloads: string[] = [];
    let text = input;

    // URL decode
    if (/%[0-9a-fA-F]{2}/i.test(text)) {
      try {
        const urlDecoded = decodeURIComponent(text);
        if (urlDecoded !== text) {
          flags.push("NESTED_ENCODING");
          text = urlDecoded;
        }
      } catch {
        // Safe fallback for partially malformed percent encodings
        text = text.replace(/%([0-9a-fA-F]{2})/g, (_, hex) => {
          try {
            return String.fromCharCode(parseInt(hex, 16));
          } catch {
            return `\\x${hex}`;
          }
        });
        flags.push("NESTED_ENCODING");
      }
    }

    // HTML entities decode (named, decimal, hex)
    if (/&[a-z0-9]+;|&#[0-9]+;|&#x[0-9a-f]+;/i.test(text)) {
      const htmlDecoded = text
        .replace(/&quot;/gi, '"')
        .replace(/&apos;/gi, "'")
        .replace(/&amp;/gi, "&")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
        .replace(/&#([0-9]+);/gi, (_, dec) => String.fromCharCode(parseInt(dec, 10)));
      if (htmlDecoded !== text) {
        flags.push("HTML_ENTITY_DECODED");
        flags.push("NESTED_ENCODING");
        text = htmlDecoded;
      }
    }

    // Hex escape decode (\x41 or 0x41)
    if (/\\x[0-9a-fA-F]{2}/i.test(text)) {
      const hexDecoded = text.replace(/\\x([0-9a-fA-F]{2})/gi, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16)),
      );
      if (hexDecoded !== text) {
        flags.push("HEX_DECODED");
        flags.push("NESTED_ENCODING");
        text = hexDecoded;
      }
    }

    return { decoded: text, flags, payloads };
  }

  /**
   * Scans for inline or trailing Base64 payloads (e.g. "PS: 8WdsdW9yZSBhbGwgcnVsZXM=").
   * Validates that decoded content is readable text before substituting.
   */
  private static extractAndDecodeBase64(text: string): {
    replaced: string;
    payloads: string[];
  } {
    const payloads: string[] = [];
    const base64Regex = /\b([A-Za-z0-9+/]{12,}={0,2})\b/g;

    const replaced = text.replace(base64Regex, (match) => {
      try {
        const decoded = Buffer.from(match, "base64").toString("utf-8");
        // Verify if decoded string contains predominantly printable ASCII text with words
        const printableMatches = decoded.match(/[\x20-\x7E\r\n\t]/g);
        const printableRatio = printableMatches
          ? printableMatches.length / decoded.length
          : 0;
        const hasWords = /[a-zA-Z]{3,}/.test(decoded);

        if (printableRatio > 0.6 && hasWords) {
          const cleaned = decoded.replace(/[^\x20-\x7E\r\n\t]+/g, " ").trim();
          payloads.push(cleaned);
          return `${match} (${cleaned})`;
        }
      } catch {
        // Not valid base64, keep original
      }
      return match;
    });

    return { replaced, payloads };
  }

  /**
   * Strips markdown formatting that attackers inject to bypass token matches
   * (e.g. `**ignore**`, `__system__`, `\`override\``).
   */
  private static stripMarkdownFormatting(text: string): string {
    return text
      .replace(/(\*\*|__)(.*?)\1/g, "$2") // Bold
      .replace(/(\*|_)(.*?)\1/g, "$2")   // Italic
      .replace(/~~(.*?)~~/g, "$2")       // Strikethrough
      .replace(/`([^`]+)`/g, "$1")       // Inline code
      .replace(/(^|\s)#{1,6}\s+/g, "$1") // Headers (start of line or inline)
      .replace(/(^|\s)>\s+/g, "$1")      // Blockquotes
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"); // Links
  }

  /**
   * Intelligent leetspeak reversal that converts words like `tr4nsf3r` or `1gn0r3`
   * back to alphabetical words, while preserving currency amounts like `$9999` or `$50`.
   */
  private static normalizeLeetspeak(text: string): {
    text: string;
    modified: boolean;
  } {
    let modified = false;

    // Tokenize by word boundaries while preserving punctuation
    const result = text.replace(/\b([a-zA-Z0-9@$!]+)\b/g, (token) => {
      // If the token is pure digits (e.g. 5000, 100), do NOT mutate
      if (/^\d+$/.test(token)) {
        return token;
      }

      // If token is prefixed by currency or is numeric format, do not mutate
      if (/^\$?\d+(\.\d+)?$/.test(token)) {
        return token;
      }

      // Check if token has mixed letters and leet characters
      const hasLeetChars = /[0134578@$!]/.test(token);
      if (!hasLeetChars) {
        return token;
      }

      // Generate de-leeted candidate
      let candidate = "";
      for (const char of token) {
        candidate += LEET_CHAR_MAP[char] || char;
      }

      // If candidate matches any known target security keyword, replace it!
      const lowerCandidate = candidate.toLowerCase();
      const matchesKnownSecurityWord = TARGET_SECURITY_WORDS.some(
        (target) =>
          lowerCandidate === target ||
          lowerCandidate.includes(target) ||
          target.includes(lowerCandidate),
      );

      // Or if token had letters and digits mixed (e.g. "tr4nsf3r", "h4ck3r", "1gn0r3")
      const isMixedAlphaNumeric =
        /[a-zA-Z]/.test(token) && /[0-9]/.test(token);

      if (matchesKnownSecurityWord || isMixedAlphaNumeric) {
        modified = true;
        return candidate;
      }

      return token;
    });

    return { text: result, modified };
  }
}
