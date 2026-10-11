export type NormalizerFlag =
  | "OBFUSCATION_DETECTED"
  | "BASE64_FOUND"
  | "MIXED_SCRIPT"
  | "ZERO_WIDTH_CHARS"
  | "NESTED_ENCODING"
  | "LEETSPEAK_DETECTED"
  | "HOMOGLYPH_REPLACED"
  | "HTML_ENTITY_DECODED"
  | "HEX_DECODED";

export interface NormalizedInput {
  original: string;
  normalized: string;
  lowered: string;
  flags: NormalizerFlag[];
  decodedPayloads: string[];
  metadata: {
    originalLength: number;
    normalizedLength: number;
    strippedZeroWidthCount: number;
    decodingLevels: number;
    detectedScripts: string[];
  };
}

export interface NormalizerOptions {
  maxDecodeDepth?: number;
  reverseLeetspeak?: boolean;
  normalizeHomoglyphs?: boolean;
  stripMarkdown?: boolean;
}
