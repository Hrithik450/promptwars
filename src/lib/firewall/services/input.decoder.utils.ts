import { NormalizerFlag } from "../types/normalizer.types";
import { LEET_CHAR_MAP, TARGET_SECURITY_WORDS } from "../data/leetspeak.data";

const URL_HEX_REGEX = /%[0-9a-fA-F]{2}/i;
const HTML_ENT_REGEX = /&[a-z0-9]+;|&#[0-9]+;|&#x[0-9a-f]+;/i;
const HEX_ESC_REGEX = /\\x[0-9a-fA-F]{2}/i;
const PERCENT_HEX_GLOBAL = /%([0-9a-fA-F]{2})/g;
const HEX_ESCAPE_GLOBAL = /\\x([0-9a-fA-F]{2})/gi;
const BASE64_CANDIDATE_REGEX = /[A-Za-z0-9+/]{12,}/;
const BASE64_GLOBAL_REGEX = /\b([A-Za-z0-9+/]{12,}={0,2})\b/g;
const MARKDOWN_TRIGGER_REGEX = /[*_~`#>\[]/;
const LEET_TRIGGER_REGEX = /[0134578@$!]/;
const TOKEN_BOUND_REGEX = /\b([a-zA-Z0-9@$!]+)\b/g;
const TARGET_SECURITY_SET = new Set<string>(TARGET_SECURITY_WORDS);

const MD_BOLD = /(\*\*|__)(.*?)\1/g;
const MD_ITALIC = /(\*|_)(.*?)\1/g;
const MD_STRIKE = /~~(.*?)~~/g;
const MD_CODE = /`([^`]+)`/g;
const MD_HEADER = /(^|\s)#{1,6}\s+/g;
const MD_QUOTE = /(^|\s)>\s+/g;
const MD_LINK = /\[([^\]]+)\]\([^)]+\)/g;

export function decodeOneLevel(input: string): {
  decoded: string;
  flags: NormalizerFlag[];
  payloads: string[];
} {
  const flags: NormalizerFlag[] = [];
  const payloads: string[] = [];
  let text = input;

  if (!text.includes("%") && !text.includes("&") && !text.includes("\\")) {
    return { decoded: text, flags, payloads };
  }

  if (URL_HEX_REGEX.test(text)) {
    try {
      const urlDecoded = decodeURIComponent(text);
      if (urlDecoded !== text) {
        flags.push("NESTED_ENCODING");
        text = urlDecoded;
      }
    } catch {
      text = text.replace(PERCENT_HEX_GLOBAL, (_, hex) => {
        try {
          return String.fromCharCode(parseInt(hex, 16));
        } catch {
          return `\\x${hex}`;
        }
      });
      flags.push("NESTED_ENCODING");
    }
  }

  if (HTML_ENT_REGEX.test(text)) {
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

  if (HEX_ESC_REGEX.test(text)) {
    const hexDecoded = text.replace(HEX_ESCAPE_GLOBAL, (_, hex) =>
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

export function extractAndDecodeBase64(text: string): {
  replaced: string;
  payloads: string[];
} {
  if (text.length < 12 || !BASE64_CANDIDATE_REGEX.test(text)) {
    return { replaced: text, payloads: [] };
  }

  const payloads: string[] = [];
  const replaced = text.replace(BASE64_GLOBAL_REGEX, (match) => {
    try {
      const decoded = Buffer.from(match, "base64").toString("utf-8");
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
    }
    return match;
  });

  return { replaced, payloads };
}

export function stripMarkdownFormatting(text: string): string {
  if (!MARKDOWN_TRIGGER_REGEX.test(text)) {
    return text;
  }

  return text
    .replace(MD_BOLD, "$2")
    .replace(MD_ITALIC, "$2")
    .replace(MD_STRIKE, "$2")
    .replace(MD_CODE, "$1")
    .replace(MD_HEADER, "$1")
    .replace(MD_QUOTE, "$1")
    .replace(MD_LINK, "$1");
}

export function normalizeLeetspeak(text: string): {
  text: string;
  modified: boolean;
} {
  if (!LEET_TRIGGER_REGEX.test(text)) {
    return { text, modified: false };
  }

  let modified = false;

  const result = text.replace(TOKEN_BOUND_REGEX, (token) => {
    if (/^\d+$/.test(token) || /^\$?\d+(\.\d+)?$/.test(token)) {
      return token;
    }

    if (!LEET_TRIGGER_REGEX.test(token)) {
      return token;
    }

    let candidate = "";
    for (const char of token) {
      candidate += LEET_CHAR_MAP[char] || char;
    }

    const lowerCandidate = candidate.toLowerCase();
    const matchesKnownSecurityWord =
      TARGET_SECURITY_SET.has(lowerCandidate) ||
      TARGET_SECURITY_WORDS.some(
        (target) =>
          lowerCandidate.includes(target) ||
          target.includes(lowerCandidate),
      );

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
