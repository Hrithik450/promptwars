import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ path: ".env", quiet: true });

import { runNormalizerTests } from "./normalizer.test";
import { runPatternDetectorTests } from "./pattern.detector.test";
import { runSemanticClassifierTests } from "./semantic.classifier.test";
import { runIntentParserTests } from "./intent.parser.test";
import { runPolicyEngineTests } from "./policy.engine.test";
import { runBankingCoreTests } from "./banking.core.test";
import { runPipelineTests } from "./pipeline.test";
import { runAsyncApiEndpointTests } from "./api.endpoints.test";
import { runMultiLanguageTests } from "./multilingual.test";

interface TestGroupResult {
  name: string;
  passed: number;
  failed: number;
  reports: { name: string; passed: boolean; error?: string }[];
}

async function runAllSuites() {
  const startTime = Date.now();
  console.log("===============================================================");
  console.log("     AI FIREWALL COMPREHENSIVE PIPELINE TEST SUITE (L0 - L5)   ");
  console.log("===============================================================\n");

  const suites: TestGroupResult[] = [
    { name: "Layer 0: Input Normalizer Unit Tests", ...runNormalizerTests() },
    { name: "Layer 1: Pattern Detector Unit Tests", ...runPatternDetectorTests() },
    { name: "Layer 2: Semantic Classifier Unit Tests", ...(await runSemanticClassifierTests()) },
    { name: "Layer 3: Intent Parser & Transaction Validator", ...runIntentParserTests() },
    { name: "Layer 4: Policy Engine Unit Tests", ...runPolicyEngineTests() },
    { name: "Mock Banking Core Service Tests", ...runBankingCoreTests() },
    { name: "End-to-End Firewall Pipeline Integration", ...(await runPipelineTests()) },
    { name: "API Endpoints & Audit Store Tests", ...(await runAsyncApiEndpointTests()) },
    { name: "Multi-Language Attack Detection Tests", ...(await runMultiLanguageTests()) },
  ];

  let totalPassed = 0;
  let totalFailed = 0;

  for (const suite of suites) {
    console.log(`\n▶ [SUITE] ${suite.name}`);
    console.log(`  Passed: ${suite.passed} | Failed: ${suite.failed}`);
    console.log("  -------------------------------------------------------------");

    for (const report of suite.reports) {
      if (report.passed) {
        console.log(`   ✔ PASS: ${report.name}`);
      } else {
        console.error(`   ✖ FAIL: ${report.name}`);
        if (report.error) {
          console.error(`     ↳ Details: ${report.error}`);
        }
      }
    }

    totalPassed += suite.passed;
    totalFailed += suite.failed;
  }

  const duration = Date.now() - startTime;
  console.log("\n===============================================================");
  console.log(`                      FINAL TEST SUMMARY                       `);
  console.log("===============================================================");
  console.log(`  Total Tests Run : ${totalPassed + totalFailed}`);
  console.log(`  Total Passed    : ${totalPassed}`);
  console.log(`  Total Failed    : ${totalFailed}`);
  console.log(`  Duration        : ${duration}ms`);
  console.log("===============================================================");

  if (totalFailed > 0) {
    console.error(`\n❌ TEST SUITE FAILED with ${totalFailed} failure(s).\n`);
    process.exit(1);
  } else {
    console.log("\n✅ ALL TESTS COMPLETED SUCCESSFULLY WITH 0 FAILURES.\n");
    process.exit(0);
  }
}

runAllSuites();
