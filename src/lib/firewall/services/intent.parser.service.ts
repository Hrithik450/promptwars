import { NormalizedInput } from "../types/normalizer.types";
import { BankingAction, IntentParams } from "../types/intent.parser.types";

export class IntentParserService {
  private static readonly TRANSFER_INQUIRY_REGEX =
    /^(how\s+much\s+did\s+i|did\s+i\s+(send|transfer|pay))/i;
  private static readonly TRANSFER_VERB_REGEX =
    /\b(transfer|send|wire|pay)\b/i;
  private static readonly BALANCE_REGEX =
    /\b(balance|how\s+much\s+(money\s+)?(do\s+i\s+have|in)|check\s+balance)\b/i;
  private static readonly CHECKING_REGEX = /\bchecking\b/i;
  private static readonly SAVINGS_REGEX = /\bsavings\b/i;
  private static readonly CREDIT_REGEX = /\bcredit\b/i;
  private static readonly TX_HISTORY_REGEX =
    /\b(recent\s+transactions?|transactions?\s+history|last\s+\d+\s+transactions?|show\s+transactions?)\b/i;
  private static readonly TX_COUNT_REGEX =
    /\blast\s+(\d+)\s+transactions?\b/i;
  private static readonly ACCOUNT_INFO_REGEX =
    /\b(account\s+(info|information|details)|who\s+am\s+i)\b/i;
  private static readonly HELP_REGEX =
    /\b(help(\s+me)?|what\s+can\s+you\s+do|commands|support)\b/i;
  private static readonly MEMO_REGEX =
    /\b(?:memo|note|for)\s*:\s*(.+)$/i;
  private static readonly NUMERIC_AMOUNT_REGEX =
    /(?:(-?\s*\$\s*-?\d+(?:\.\d+)?)|(-?\d+(?:\.\d+)?)\s*(?:dollars?|usd))/i;
  private static readonly RECIPIENT_REGEX =
    /\bto\s+([^\s]+)(?:\s+(?:from|memo|for)|\s*$)/i;
  private static readonly FROM_CHECKING_REGEX = /\bfrom\s+checking\b/i;
  private static readonly FROM_SAVINGS_REGEX = /\bfrom\s+savings\b/i;
  private static readonly FROM_CREDIT_REGEX = /\bfrom\s+credit\b/i;
  private static readonly WORD_AMOUNT_REGEX =
    /\b(one|two|three|four|five|six|seven|eight|nine|ten|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand)\s+(?:dollars?|usd)\b/i;

  private static readonly WORD_NUMBERS: Record<string, number> = {
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

  static parse(normalizedInput: NormalizedInput): {
    action: BankingAction;
    params: IntentParams;
    confidence: number;
  } {
    const text = normalizedInput.normalized.trim();
    const lower = text.toLowerCase();

    const isTransferInquiry = this.TRANSFER_INQUIRY_REGEX.test(lower);
    if (!isTransferInquiry && this.TRANSFER_VERB_REGEX.test(lower)) {
      const transferParams = this.extractTransferParams(text);
      if (transferParams.amount !== undefined || transferParams.recipient) {
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
    }

    if (this.BALANCE_REGEX.test(lower)) {
      let accountType: string | undefined;
      if (this.CHECKING_REGEX.test(lower)) accountType = "checking";
      else if (this.SAVINGS_REGEX.test(lower)) accountType = "savings";
      else if (this.CREDIT_REGEX.test(lower)) accountType = "credit";

      return {
        action: "BALANCE_CHECK",
        params: { accountType },
        confidence: 0.95,
      };
    }

    if (this.TX_HISTORY_REGEX.test(lower)) {
      const countMatch = lower.match(this.TX_COUNT_REGEX);
      const count = countMatch ? parseInt(countMatch[1], 10) : 5;
      return {
        action: "TRANSACTION_HISTORY",
        params: { count },
        confidence: 0.95,
      };
    }

    if (this.ACCOUNT_INFO_REGEX.test(lower)) {
      return {
        action: "ACCOUNT_INFO",
        params: {},
        confidence: 0.95,
      };
    }

    if (this.HELP_REGEX.test(lower)) {
      return {
        action: "HELP",
        params: {},
        confidence: 0.9,
      };
    }

    return {
      action: "UNKNOWN",
      params: {},
      confidence: 0.2,
    };
  }

  private static extractTransferParams(text: string): IntentParams {
    const params: IntentParams = {
      currency: "USD",
    };

    const memoMatch = text.match(this.MEMO_REGEX);
    let workingText = text;
    if (memoMatch) {
      params.memo = memoMatch[1].trim();
      workingText = text.slice(0, memoMatch.index).trim();
    }

    const numericAmountMatch = workingText.match(this.NUMERIC_AMOUNT_REGEX);
    if (numericAmountMatch) {
      const rawNum = numericAmountMatch[1]
        ? numericAmountMatch[1].replace(/[$\s]/g, "")
        : numericAmountMatch[2];
      params.amount = parseFloat(rawNum);
    } else {
      const wordAmount = this.parseWordAmount(workingText);
      if (wordAmount !== undefined) {
        params.amount = wordAmount;
      }
    }

    const recipientMatch = workingText.match(this.RECIPIENT_REGEX);
    if (recipientMatch) {
      params.recipient = recipientMatch[1].trim();
    }

    if (this.FROM_CHECKING_REGEX.test(workingText)) {
      params.fromAccount = "checking";
    } else if (this.FROM_SAVINGS_REGEX.test(workingText)) {
      params.fromAccount = "savings";
    } else if (this.FROM_CREDIT_REGEX.test(workingText)) {
      params.fromAccount = "credit";
    }

    return params;
  }

  private static parseWordAmount(text: string): number | undefined {
    const match = text.match(this.WORD_AMOUNT_REGEX);
    if (match) {
      const word = match[1].toLowerCase();
      return this.WORD_NUMBERS[word];
    }
    return undefined;
  }
}
