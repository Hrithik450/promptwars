import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
  getGoogleApiKeyPool,
  GoogleApiKeyPool,
  loadGoogleApiKeysFromEnv,
} from "./api-key-pool";

export interface RoutingProviderOptions {
  /** The sequence of models to try in order */
  models: string[];

  /** Optional list of API keys. If provided, creates an isolated pool for this provider. */
  apiKeys?: string[];
  /** Optional label for logging (e.g. "titleGeneration") */
  label?: string;
}

// A global map to share model cooldowns across all provider instances
// so a rate-limited model isn't accidentally hit by a different provider.
const globalModelCooldowns = new Map<string, number>();

const serverLog = (msg: string) => {
  if (typeof window === "undefined") console.log(msg);
};

const serverWarn = (msg: string) => {
  if (typeof window === "undefined") console.warn(msg);
};

/**
 * Creates a unified routing provider that strictly follows the provided model sequence
 * and integrates with the API key pool for rate limiting and rotation.
 */
export function createRoutingGoogleProvider(options: RoutingProviderOptions) {
  const modelSequence = options.models;
  const providerPool = options.apiKeys
    ? new GoogleApiKeyPool(options.apiKeys)
    : getGoogleApiKeyPool();

  return createGoogleGenerativeAI({
    apiKey: "ROTATING_KEY",
    fetch: async (originalUrl, fetchOptionsInput) => {
      const pool = providerPool;
      const maxKeyAttempts = Math.max(1, pool.size);
      const triedKeys = new Set<string>();
      let lastResponse: Response | undefined;
      let lastError: unknown;
      const logLabel = options.label ? `:${options.label}` : "";

      const isModelAvailable = (apiKey: string, model: string) => {
        const until = globalModelCooldowns.get(`${apiKey}::${model}`);
        return until == null || Date.now() >= until;
      };

      const markModelCooldown = (apiKey: string, model: string, ms: number) => {
        globalModelCooldowns.set(`${apiKey}::${model}`, Date.now() + ms);
      };

      for (let keyAttempt = 0; keyAttempt < maxKeyAttempts; keyAttempt++) {
        const apiKey = pool.acquire(triedKeys);
        triedKeys.add(apiKey);

        const headers = new Headers(fetchOptionsInput?.headers);
        headers.set("x-goog-api-key", apiKey);
        const fetchOptions = { ...fetchOptionsInput, headers };

        let keyFailedCompletely = true;

        for (const currentModel of modelSequence) {
          if (!isModelAvailable(apiKey, currentModel)) {
            continue; // skip this model on this key if it's cooling down
          }

          // Force the URL to use the model defined by our sequence
          const urlString = originalUrl.toString();
          const modifiedUrl = urlString.replace(
            /\/models\/([^:]+):/,
            `/models/${currentModel}:`,
          );

          try {
            const response = await fetch(modifiedUrl, fetchOptions);
            lastResponse = response;

            if (!response.ok) {
              markModelCooldown(apiKey, currentModel, 60_000);
              serverWarn(
                `[Router${logLabel}] Cause: HTTP ${response.status} | Switched: Model | Cooldown: 60s for ${currentModel} on ${pool.label(apiKey)}`,
              );

              try {
                await response.text();
              } catch {}

              continue; // move to next model in sequence
            }

            // Success!
            keyFailedCompletely = false;
            serverLog(
              `[Model${logLabel}]: used ${currentModel} from ${pool.label(apiKey)}`,
            );
            return response;
          } catch (error) {
            // IMPORTANT: If the user simply aborted/cancelled the request, do not penalize the model.
            if ((error as Error)?.name === "AbortError") {
              throw error;
            }

            lastError = error;
            markModelCooldown(apiKey, currentModel, 60_000);
            const errStr =
              error instanceof Error ? error.message : "Unknown Error";
            serverWarn(
              `[Router${logLabel}] Cause: ${errStr} | Switched: Model | Cooldown: 60s for ${currentModel} on ${pool.label(apiKey)}`,
            );
            continue; // move to next model in sequence
          }
        }

        if (keyFailedCompletely) {
          // All models threw an error or were skipped. Cool down the entire API key for 90s.
          pool.markRateLimited(apiKey, 90_000);
          serverWarn(
            `[Router${logLabel}] Cause: All models failed | Switched: API Key | Cooldown: 90s for entire ${pool.label(apiKey)}`,
          );
        }
      }

      if (lastResponse) return lastResponse;
      throw lastError || new Error("All models and API keys failed.");
    },
  });
}

const allKeys = loadGoogleApiKeysFromEnv();

// 1. Agent Orchestrator Routing
export const agentProvider = createRoutingGoogleProvider({
  models: [
    "gemini-2.5-flash",
    "gemini-3.5-flash",
    "gemini-3.6-flash",
    "gemini-3.7-flash",
    "gemini-3.8-flash",
  ],
  apiKeys: allKeys,
  label: "textGeneration",
});
export const defaultAgentModel = agentProvider("gemini-2.5-flash");

// 2. Thread Title Generation Routing
export const titleProvider = createRoutingGoogleProvider({
  models: ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite"],
  apiKeys: allKeys,
  label: "titleGeneration",
});
export const defaultTitleModel = titleProvider("gemini-3.5-flash-lite");
