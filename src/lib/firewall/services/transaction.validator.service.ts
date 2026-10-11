import { InputNormalizerService } from "./input.normalizer.service";
import { PatternDetectorService } from "./pattern.detector.service";
import {
  BankingAction,
  IntentParams,
  IntentResult,
  ValidationError,
} from "../types/intent.parser.types";

export class TransactionValidatorService {
  public static readonly MAX_SINGLE_TRANSFER = 10000;
  public static readonly DEFAULT_AUTHENTICATED_USER = "alex_mercer";

  /**
   * Validates parsed intent and parameters against hard business rules
   * and scans the transfer memo field independently.
   */
  static validate(
    action: BankingAction,
    params: IntentParams,
    intentConfidence: number,
    authenticatedUser: string = this.DEFAULT_AUTHENTICATED_USER,
  ): IntentResult {
    const validationErrors: ValidationError[] = [];

    // --- Rule 3C: Ambiguous Intent Gate ---
    if (action === "UNKNOWN" || intentConfidence < 0.5) {
      validationErrors.push({
        rule: "AMBIGUOUS_INTENT",
        message: "The request could not be mapped to an authorized banking action.",
        severity: "BLOCK",
      });
      return {
        action,
        params,
        validationErrors,
        intentConfidence,
        isApproved: false,
        rejectionReason: "AMBIGUOUS_INTENT: Unrecognized transaction or inquiry.",
      };
    }

    // --- Validation Rules for TRANSFER ---
    if (action === "TRANSFER") {
      const { amount, recipient, memo } = params;

      // 1. Missing amount
      if (amount === undefined || isNaN(amount)) {
        validationErrors.push({
          rule: "INVALID_AMOUNT",
          message: "Transfer amount is missing or invalid.",
          severity: "BLOCK",
        });
      } else {
        // 2. Non-positive amount
        if (amount <= 0) {
          validationErrors.push({
            rule: "INVALID_AMOUNT",
            message: `Amount must be greater than zero. Received: ${amount}`,
            severity: "BLOCK",
          });
        }

        // 3. Amount ceiling ($10,000 hardcoded limit)
        if (amount > this.MAX_SINGLE_TRANSFER) {
          validationErrors.push({
            rule: "EXCEEDS_TRANSACTION_LIMIT",
            message: `Transfer amount $${amount.toFixed(2)} exceeds single transaction ceiling of $${this.MAX_SINGLE_TRANSFER.toFixed(2)}.`,
            severity: "BLOCK",
          });
        }

        // 4. Amount precision (max 2 decimal places)
        const amountStr = amount.toString();
        const decimalParts = amountStr.split(".");
        if (decimalParts.length > 1 && decimalParts[1].length > 2) {
          validationErrors.push({
            rule: "INVALID_AMOUNT_PRECISION",
            message: `Amount has ${decimalParts[1].length} decimal places. Maximum allowed precision is 2.`,
            severity: "BLOCK",
          });
        }
      }

      // 5. Missing recipient
      if (!recipient || recipient.trim().length === 0) {
        validationErrors.push({
          rule: "MISSING_RECIPIENT",
          message: "Recipient is required for transfers.",
          severity: "BLOCK",
        });
      } else {
        const cleanRecipient = recipient.trim();

        // 6. Recipient format (alphanumeric, dots, underscores, hyphens, 3-30 chars)
        const isValidFormat =
          /^[a-zA-Z0-9_\.-]{3,30}$/.test(cleanRecipient);
        if (!isValidFormat) {
          validationErrors.push({
            rule: "INVALID_RECIPIENT",
            message: `Recipient identifier '${cleanRecipient}' is invalid. Must be alphanumeric (3-30 chars).`,
            severity: "BLOCK",
          });
        }

        // 7. Self-transfer check
        if (cleanRecipient.toLowerCase() === authenticatedUser.toLowerCase()) {
          validationErrors.push({
            rule: "SELF_TRANSFER",
            message: "Self-transfer detected. Permitted with audit notation.",
            severity: "FLAG",
          });
        }
      }

      // 8. CRITICAL: Memo scanning through Layers 0 & 1
      if (memo && memo.trim().length > 0) {
        const memoNormalized = InputNormalizerService.normalize(memo);
        const memoDetection = PatternDetectorService.detect(memoNormalized);

        if (
          memoDetection.matches.length > 0 ||
          memoNormalized.flags.includes("OBFUSCATION_DETECTED") ||
          memoDetection.layer1RiskScore >= 0.5
        ) {
          const reason =
            memoDetection.matches.length > 0
              ? memoDetection.matches[0].description
              : "Obfuscated payload detected in memo";

          validationErrors.push({
            rule: "MALICIOUS_MEMO",
            message: `Malicious pattern detected in memo field: ${reason}`,
            severity: "BLOCK",
          });
        }
      }
    }

    // Determine approval status
    const hasBlockingError = validationErrors.some(
      (err) => err.severity === "BLOCK",
    );
    const isApproved = !hasBlockingError;
    const rejectionReason = hasBlockingError
      ? validationErrors.find((e) => e.severity === "BLOCK")?.message
      : undefined;

    return {
      action,
      params,
      validationErrors,
      intentConfidence,
      isApproved,
      rejectionReason,
    };
  }
}
