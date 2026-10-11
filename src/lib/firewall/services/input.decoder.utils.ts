import { NormalizerFlag } from "../types/normalizer.types";
import { LEET_CHAR_MAP, TARGET_SECURITY_WORDS } from "../data/leetspeak.data";

export function decodeOneLevel(input: string): {
  decoded: string;
  flags: NormalizerFlag[];
  payloads: string[];
} {
  const flags: NormalizerFlag[] = [];
  const payloads: string[] = [];
  let text = input;

  if (/%[0-9a-fA-F]{2}/i.test(text)) {
    try {
      const urlDecoded = decodeURIComponent(text);
      if (urlDecoded !== text) {
        flags.push("NESTED_ENCODING");
        text = urlDecoded;
      }
    } catch {
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

export function extractAndDecodeBase64(text: string): {
  replaced: string;
  payloads: string[];
} {
  const payloads: string[] = [];
  const base64Regex = /\b([A-Za-z0-9+/]{12,}={0,2})\b/g;

  const replaced = text.replace(base64Regex, (match) => {
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
      // Ignore invalid base64
    }
    return match;
  });

  return { replaced, payloads };
}

export function stripMarkdownFormatting(text: string): string {
  return text
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/~~(.*?)~~/g, "$2")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/(^|\s)#{1,6}\s+/g, "$1")
    .replace(/(^|\s)>\s+/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

export function normalizeLeetspeak(text: string): {
  text: string;
  modified: boolean;
} {
  let modified = false;

  const result = text.replace(/\b([a-zA-Z0-9@$!]+)\b/g, (token) => {
    if (/^\d+$/.test(token) || /^\$?\d+(\.\d+)?$/.test(token)) {
      return token;
    }

    if (!/[0134578@$!]/.test(token)) {
      return token;
    }

    let candidate = "";
    for (const char of token) {
      candidate += LEET_CHAR_MAP[char] || char;
    }

    const lowerCandidate = candidate.toLowerCase();
    const matchesKnownSecurityWord = TARGET_SECURITY_WORDS.some(
      (target) =>
        lowerCandidate === target ||
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
