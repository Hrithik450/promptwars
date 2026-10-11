/**
 * Homoglyph replacement table mapping visually identical or confusable
 * Cyrillic and Greek Unicode characters to ASCII Latin counterparts.
 */
export const HOMOGLYPH_MAP: Record<string, string> = {
  // Cyrillic Uppercase
  "\u0410": "A", // Cyrillic Capital Letter A
  "\u0412": "B", // Cyrillic Capital Letter Ve
  "\u0415": "E", // Cyrillic Capital Letter Ie
  "\u041A": "K", // Cyrillic Capital Letter Ka
  "\u041C": "M", // Cyrillic Capital Letter Em
  "\u041D": "H", // Cyrillic Capital Letter En
  "\u041E": "O", // Cyrillic Capital Letter O
  "\u0420": "P", // Cyrillic Capital Letter Er
  "\u0421": "C", // Cyrillic Capital Letter Es
  "\u0422": "T", // Cyrillic Capital Letter Te
  "\u0423": "Y", // Cyrillic Capital Letter U
  "\u0425": "X", // Cyrillic Capital Letter Ha
  "\u0405": "S", // Cyrillic Capital Letter Dze
  "\u0406": "I", // Cyrillic Capital Letter Byelorussian-Ukrainian I
  "\u0408": "J", // Cyrillic Capital Letter Je

  // Cyrillic Lowercase
  "\u0430": "a", // Cyrillic Small Letter A
  "\u0435": "e", // Cyrillic Small Letter Ie
  "\u043E": "o", // Cyrillic Small Letter O
  "\u0440": "p", // Cyrillic Small Letter Er
  "\u0441": "c", // Cyrillic Small Letter Es
  "\u0443": "y", // Cyrillic Small Letter U
  "\u0445": "x", // Cyrillic Small Letter Ha
  "\u0455": "s", // Cyrillic Small Letter Dze
  "\u0456": "i", // Cyrillic Small Letter Byelorussian-Ukrainian I
  "\u0458": "j", // Cyrillic Small Letter Je
  "\u0442": "t", // Cyrillic Small Letter Te
  "\u043A": "k", // Cyrillic Small Letter Ka

  // Greek Uppercase
  "\u0391": "A", // Greek Capital Letter Alpha
  "\u0392": "B", // Greek Capital Letter Beta
  "\u0395": "E", // Greek Capital Letter Epsilon
  "\u0396": "Z", // Greek Capital Letter Zeta
  "\u0397": "H", // Greek Capital Letter Eta
  "\u0399": "I", // Greek Capital Letter Iota
  "\u039A": "K", // Greek Capital Letter Kappa
  "\u039C": "M", // Greek Capital Letter Mu
  "\u039D": "N", // Greek Capital Letter Nu
  "\u039F": "O", // Greek Capital Letter Omicron
  "\u03A1": "P", // Greek Capital Letter Rho
  "\u03A4": "T", // Greek Capital Letter Tau
  "\u03A5": "Y", // Greek Capital Letter Upsilon
  "\u03A7": "X", // Greek Capital Letter Chi

  // Greek Lowercase
  "\u03B1": "a", // Greek Small Letter Alpha
  "\u03B5": "e", // Greek Small Letter Epsilon
  "\u03B9": "i", // Greek Small Letter Iota
  "\u03BA": "k", // Greek Small Letter Kappa
  "\u03BF": "o", // Greek Small Letter Omicron
  "\u03C1": "p", // Greek Small Letter Rho
  "\u03C4": "t", // Greek Small Letter Tau
  "\u03C5": "u", // Greek Small Letter Upsilon
  "\u03C7": "x", // Greek Small Letter Chi
};

/**
 * Unicode zero-width and invisible formatting characters.
 */
export const ZERO_WIDTH_REGEX =
  /[\u200B\u200C\u200D\uFEFF\u200E\u200F\u202A-\u202E\u2060-\u2064\u2066-\u2069\u00AD\u034F\u180E]/g;

/**
 * Recognizable major scripts for mixed-script detection.
 */
export const SCRIPT_DEFINITIONS = [
  { name: "Latin", pattern: /\p{sc=Latin}/u },
  { name: "Cyrillic", pattern: /\p{sc=Cyrillic}/u },
  { name: "Greek", pattern: /\p{sc=Greek}/u },
  { name: "Arabic", pattern: /\p{sc=Arabic}/u },
  { name: "Devanagari", pattern: /\p{sc=Devanagari}/u },
  { name: "Han", pattern: /\p{sc=Han}/u },
  { name: "Hangul", pattern: /\p{sc=Hangul}/u },
  { name: "Hebrew", pattern: /\p{sc=Hebrew}/u },
] as const;
