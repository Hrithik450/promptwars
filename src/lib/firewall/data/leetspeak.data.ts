/**
 * Leetspeak character substitution map.
 */
export const LEET_CHAR_MAP: Record<string, string> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "8": "b",
  "@": "a",
  "$": "s",
  "!": "i",
};

/**
 * Common security keywords targeted by leetspeak obfuscation.
 */
export const TARGET_SECURITY_WORDS = [
  "ignore",
  "previous",
  "instructions",
  "instruction",
  "rules",
  "system",
  "transfer",
  "hacker",
  "bypass",
  "override",
  "admin",
  "password",
  "secret",
  "pretend",
  "jailbreak",
  "reveal",
  "execute",
  "eval",
  "accounts",
  "balance",
  "credit",
  "dollar",
  "dollars",
] as const;
