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
import {
  decodeOneLevel,
  extractAndDecodeBase64,
  stripMarkdownFormatting,
  normalizeLeetspeak,
} from "./input.decoder.utils";

export class InputNormalizerService {
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

    const zeroWidthMatches = original.match(ZERO_WIDTH_REGEX);
    const strippedZeroWidthCount = zeroWidthMatches ? zeroWidthMatches.length : 0;
    if (strippedZeroWidthCount > 0) {
      flags.add("ZERO_WIDTH_CHARS");
      flags.add("OBFUSCATION_DETECTED");
    }
    let current = original.replace(ZERO_WIDTH_REGEX, "");

    current = current.normalize("NFKC");

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

    const detectedScripts = this.getDetectedScripts(original);
    if (detectedScripts.length > 1) {
      const hasLatin = detectedScripts.includes("Latin");
      const hasConfusable =
        detectedScripts.includes("Cyrillic") ||
        detectedScripts.includes("Greek");
      if ((hasLatin && hasConfusable) || detectedScripts.length >= 3) {
        flags.add("MIXED_SCRIPT");
        flags.add("OBFUSCATION_DETECTED");
      }
    }

    let decodingLevels = 0;
    for (let depth = 0; depth < maxDecodeDepth; depth++) {
      const decodedResult = decodeOneLevel(current);
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

    const inlineBase64 = extractAndDecodeBase64(current);
    if (inlineBase64.payloads.length > 0) {
      flags.add("BASE64_FOUND");
      flags.add("OBFUSCATION_DETECTED");
      decodedPayloads.push(...inlineBase64.payloads);
      current = inlineBase64.replaced;
    }

    if (stripMarkdown) {
      current = stripMarkdownFormatting(current);
    }

    if (reverseLeetspeak) {
      const leetResult = normalizeLeetspeak(current);
      if (leetResult.modified) {
        flags.add("LEETSPEAK_DETECTED");
        flags.add("OBFUSCATION_DETECTED");
        current = leetResult.text;
      }
    }

    current = current
      .replace(/[\r\n\t\f\v\u00A0\u3000]+/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();

    return {
      original,
      normalized: current,
      lowered: current.toLowerCase(),
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

  private static getDetectedScripts(text: string): string[] {
    const scripts: string[] = [];
    for (const def of SCRIPT_DEFINITIONS) {
      if (def.pattern.test(text)) {
        scripts.push(def.name);
      }
    }
    return scripts;
  }
}
