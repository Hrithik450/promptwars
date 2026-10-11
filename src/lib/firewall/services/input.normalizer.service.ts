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

const NON_ASCII_REGEX = /[^\x00-\x7F]/;
const ZERO_WIDTH_FAST_CHECK =
  /[\u200B\u200C\u200D\uFEFF\u200E\u200F\u202A-\u202E\u2060-\u2064\u2066-\u2069\u00AD\u034F\u180E]/;
const WHITESPACE_COLLAPSE_1 = /[\r\n\t\f\v\u00A0\u3000]+/g;
const WHITESPACE_COLLAPSE_2 = /\s{2,}/g;
const HOMOGLYPH_REGEX = new RegExp(
  "[" + Object.keys(HOMOGLYPH_MAP).join("") + "]",
  "g",
);

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

    let strippedZeroWidthCount = 0;
    let current = original;

    if (ZERO_WIDTH_FAST_CHECK.test(original)) {
      const zeroWidthMatches = original.match(ZERO_WIDTH_REGEX);
      strippedZeroWidthCount = zeroWidthMatches ? zeroWidthMatches.length : 0;
      if (strippedZeroWidthCount > 0) {
        flags.add("ZERO_WIDTH_CHARS");
        flags.add("OBFUSCATION_DETECTED");
        current = original.replace(ZERO_WIDTH_REGEX, "");
      }
    }

    if (NON_ASCII_REGEX.test(current)) {
      current = current.normalize("NFKC");
    }

    if (normalizeHomoglyphs && NON_ASCII_REGEX.test(current)) {
      let homoglyphsReplaced = 0;
      current = current.replace(HOMOGLYPH_REGEX, (char) => {
        homoglyphsReplaced++;
        return HOMOGLYPH_MAP[char] || char;
      });
      if (homoglyphsReplaced > 0) {
        flags.add("HOMOGLYPH_REPLACED");
        flags.add("OBFUSCATION_DETECTED");
      }
    }

    const detectedScripts = NON_ASCII_REGEX.test(original)
      ? this.getDetectedScripts(original)
      : /[a-zA-Z]/.test(original)
        ? ["Latin"]
        : [];

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
      .replace(WHITESPACE_COLLAPSE_1, " ")
      .replace(WHITESPACE_COLLAPSE_2, " ")
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
