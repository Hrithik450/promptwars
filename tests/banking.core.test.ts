import { BankingService } from "../src/lib/banking/banking.service";

interface TestReport {
  name: string;
  passed: boolean;
  error?: string;
}

export function runBankingCoreTests(): {
  passed: number;
  failed: number;
  reports: TestReport[];
} {
  const reports: TestReport[] = [];

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      reports.push({ name: testName, passed: true });
    } else {
      reports.push({
        name: testName,
        passed: false,
        error: detail || "Assertion failed",
      });
    }
  }

  // Reset accounts before test
  BankingService.reset();

  // --- 1. Initial Balances Check ---
  {
    const checking = BankingService.getBalance("checking");
    assert(checking.balance === 5000.0, "Checking account initial balance is $5,000.00");

    const savings = BankingService.getBalance("savings");
    assert(savings.balance === 12000.0, "Savings account initial balance is $12,000.00");

    const credit = BankingService.getBalance("credit");
    assert(credit.balance === -450.0, "Credit card initial balance is -$450.00");
  }

  // --- 2. Execute Valid Transfer ---
  {
    const tx = BankingService.executeTransfer(250.0, "bob", "Rent share", "checking");
    assert(tx.amount === 250.0, "Transfer execution records correct amount");
    assert(tx.newBalance === 4750.0, "Checking balance successfully deducted to $4,750.00");
    assert(tx.transactionId.startsWith("tx-"), "Generates unique transaction ID");

    const updatedChecking = BankingService.getBalance("checking");
    assert(updatedChecking.balance === 4750.0, "Subsequent balance check reflects deduction");
  }

  // --- 3. Transaction History Retrieval ---
  {
    const history = BankingService.getTransactions(3);
    assert(history.length === 3, "Retrieves specified number of recent transactions");
    assert(history[0].recipient === "bob", "Most recent transaction is at the top of the ledger");
    assert(history[0].amount === 250.0, "Ledger records correct amount");
  }

  // --- 4. Account Profile Information ---
  {
    const info = BankingService.getAccountInfo("checking");
    assert(info.holderName === "Alex Mercer", "Returns correct account holder name");
    assert(info.accountNumber === "****4821", "Returns masked account number for safety");
  }

  // --- 5. Insufficient Funds Handling ---
  {
    let threw = false;
    try {
      BankingService.executeTransfer(100000.0, "eve", "Overdraft attempt", "checking");
    } catch {
      threw = true;
    }
    assert(threw, "Throws error on attempted overdraft exceeding available balance");
  }

  const passed = reports.filter((r) => r.passed).length;
  const failed = reports.filter((r) => !r.passed).length;

  return { passed, failed, reports };
}
