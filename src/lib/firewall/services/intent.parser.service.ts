import { NormalizedInput } from "../types/normalizer.types";
import { BankingAction, IntentParams } from "../types/intent.parser.types";

export class IntentParserService {
  /**
   * Parses structured intent and extracted parameters from normalized input.
   */
  static parse(normalizedInput: NormalizedInput): {
    action: BankingAction;
    params: IntentParams;
    confidence: number;
  } {
    const text = normalizedInput.normalized.trim();
    const lower = text.toLowerCase();

    // 1. TRANSFER Intent
    if (/\b(transfer|send|wire|pay)\b/i.test(lower)) {
      const transferParams = this.extractTransferParams(text);
      const confidence =
        transferParams.amount !== undefined && transferParams.recipient
          ? 0.95
          : 0.75;
      return {
        action: "TRANSFER",
        params: transferParams,
        confidence,
      };
    }

    // 2. BALANCE_CHECK Intent
    if (
      /\b(balance|how\s+much\s+(money\s+)?(do\s+i\s+have|in)|check\s+balance)\b/i.test(
        lower,
      )
    ) {
      let accountType: string | undefined;
      if (/\bchecking\b/i.test(lower)) accountType = "checking";
      else if (/\bsavings\b/i.test(lower)) accountType = "savings";
      else if (/\bcredit\b/i.test(lower)) accountType = "credit";

      return {
        action: "BALANCE_CHECK",
        params: { accountType },
        confidence: 0.95,
      };
    }

    // 3. TRANSACTION_HISTORY Intent
    if (
      /\b(recent\s+transactions?|transactions?\s+history|last\s+\d+\s+transactions?|show\s+transactions?)\b/i.test(
        lower,
      )
    ) {
      const countMatch = lower.match(/\blast\s+(\d+)\s+transactions?\b/i);
      const count = countMatch ? parseInt(countMatch[1], 10) : 5;
      return {
        action: "TRANSACTION_HISTORY",
        params: { count },
        confidence: 0.95,
      };
    }

    // 4. ACCOUNT_INFO Intent
    if (/\b(account\s+(info|information|details)|who\s+am\s+i)\b/i.test(lower)) {
      return {
        action: "ACCOUNT_INFO",
        params: {},
        confidence: 0.95,
      };
    }

    // 5. HELP Intent
    if (/\b(help(\s+me)?|what\s+can\s+you\s+do|commands|support)\b/i.test(lower)) {
      return {
        action: "HELP",
        params: {},
        confidence: 0.9,
      };
    }

    // Unknown or ambiguous
    return {
      action: "UNKNOWN",
      params: {},
      confidence: 0.2,
    };
  }

  /**
   * Extracts amount, recipient, memo, and source account from transfer input.
   */
  private static extractTransferParams(text: string): IntentParams {
    const params: IntentParams = {
      currency: "USD",
    };

    // --- Extract Memo ---
    // Matches patterns like "memo: <text>" or "note: <text>"
    const memoMatch = text.match(/\b(?:memo|note|for)\s*:\s*(.+)$/i);
    let workingText = text;
    if (memoMatch) {
      params.memo = memoMatch[1].trim();
      workingText = text.slice(0, memoMatch.index).trim();
    }

    // --- Extract Amount ---
    // 1. Matches numeric format: "$50", "-$500", "$-500", "-500 dollars", "50 USD"
    const numericAmountMatch = workingText.match(
      /(?:(-?\s*\$\s*-?\d+(?:\.\d+)?)|(-?\d+(?:\.\d+)?)\s*(?:dollars?|usd))/i,
    );
    if (numericAmountMatch) {
      const rawNum = numericAmountMatch[1]
        ? numericAmountMatch[1].replace(/[$\s]/g, "")
        : numericAmountMatch[2];
      params.amount = parseFloat(rawNum);
    } else {
      // 2. Check for number words: "twenty dollars", "fifty dollars", etc.
      const wordAmount = this.parseWordAmount(workingText);
      if (wordAmount !== undefined) {
        params.amount = wordAmount;
      }
    }

    // --- Extract Recipient ---
    // Matches "to <recipient>" where recipient is any token up to delimiter/end
    const recipientMatch = workingText.match(
      /\bto\s+([^\s]+)(?:\s+(?:from|memo|for)|\s*$)/i,
    );
    if (recipientMatch) {
      params.recipient = recipientMatch[1].trim();
    }

    // --- Extract Source Account ---
    if (/\bfrom\s+checking\b/i.test(workingText)) {
      params.fromAccount = "checking";
    } else if (/\bfrom\s+savings\b/i.test(workingText)) {
      params.fromAccount = "savings";
    } else if (/\bfrom\s+credit\b/i.test(workingText)) {
      params.fromAccount = "credit";
    }

    return params;
  }

  /**
   * Parses basic English word-based currency values (e.g. "twenty dollars" -> 20).
   */
  private static parseWordAmount(text: string): number | undefined {
    const wordNumbers: Record<string, number> = {
      one: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
      six: 6,
      seven: 7,
      eight: 8,
      nine: 9,
      ten: 10,
      twenty: 20,
      thirty: 30,
      forty: 40,
      fifty: 50,
      sixty: 60,
      seventy: 70,
      eighty: 80,
      ninety: 90,
      hundred: 100,
      thousand: 1000,
    };

    const match = text.match(
      /\b(one|two|three|four|five|six|seven|eight|nine|ten|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand)\s+(?:dollars?|usd)\b/i,
    );

    if (match) {
      const word = match[1].toLowerCase();
      return wordNumbers[word];
    }

    return undefined;
  }
}
