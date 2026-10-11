import { generateText } from "ai";
import { defaultClassifierModel } from "../../gemini/google-provider";
import { hasConfiguredGoogleKeys } from "../../gemini/api-key-pool";
import { NormalizedInput } from "../types/normalizer.types";
import { PatternResult } from "../types/pattern.detector.types";
import {
  SemanticClassifierOptions,
  SemanticResult,
} from "../types/semantic.classifier.types";
import {
  CLASSIFIER_SYSTEM_PROMPT,
  mapThreatToSemantic,
  parseClassificationOutput,
  offlineSemanticEvaluate,
} from "./semantic.evaluator";

export class SemanticClassifierService {
  private static readonly cache = new Map<string, Omit<SemanticResult, "latencyMs">>();
  private static readonly MAX_CACHE = 1000;

  static async classify(
    normalizedInput: NormalizedInput,
    layer1Result?: PatternResult,
    options: SemanticClassifierOptions = {},
  ): Promise<SemanticResult> {
    const startTime = Date.now();
    const {
      timeoutMs = 8000,
      skipThreshold = 0.85,
      forceOffline = false,
    } = options;

    if (layer1Result && layer1Result.layer1RiskScore >= skipThreshold) {
      return {
        category: mapThreatToSemantic(layer1Result.highestThreatCategory),
        confidence: layer1Result.layer1RiskScore,
        reasoning: "Layer 2 bypassed: high-confidence Layer 1 threat signature detected (token budget optimization).",
        skipped: true,
        latencyMs: Date.now() - startTime,
      };
    }

    const cacheKey = normalizedInput.normalized;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return {
        ...cached,
        latencyMs: Date.now() - startTime,
      };
    }

    if (!forceOffline && hasConfiguredGoogleKeys()) {
      try {
        const response = await generateText({
          model: defaultClassifierModel,
          system: CLASSIFIER_SYSTEM_PROMPT,
          prompt: `User message:\n"""\n${cacheKey}\n"""`,
          temperature: 0,
          abortSignal: AbortSignal.timeout(timeoutMs),
        });

        const parsed = parseClassificationOutput(response.text);
        if (parsed) {
          if (this.cache.size >= this.MAX_CACHE) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) this.cache.delete(firstKey);
          }
          this.cache.set(cacheKey, parsed);
          return {
            ...parsed,
            latencyMs: Date.now() - startTime,
          };
        }
      } catch (error) {
        console.warn(
          "[SemanticClassifierService] LLM classification error or timeout, applying fail-closed fallback:",
          error instanceof Error ? error.message : String(error),
        );
      }
    }

    const fallbackResult = offlineSemanticEvaluate(
      normalizedInput,
      layer1Result,
    );

    return {
      ...fallbackResult,
      latencyMs: Date.now() - startTime,
    };
  }
}
