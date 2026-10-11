import { GoogleApiKeyPool } from "./api-key-pool";

const globalModelCooldowns = new Map<string, number>();

const serverWarn = (msg: string) => {
  if (typeof window === "undefined") console.warn(msg);
};

const serverLog = (msg: string) => {
  if (typeof window === "undefined") console.log(msg);
};

export function createRoutingFetch(
  modelSequence: string[],
  pool: GoogleApiKeyPool,
  label?: string,
) {
  return async (
    originalUrl: URL | RequestInfo,
    fetchOptionsInput?: RequestInit,
  ): Promise<Response> => {
    if (!pool.hasValidKeys) {
      throw new Error("No Gemini API keys configured in environment.");
    }

    const maxKeyAttempts = Math.max(1, pool.size);
    const triedKeys = new Set<string>();
    let lastResponse: Response | undefined;
    let lastError: unknown;
    const logLabel = label ? `:${label}` : "";

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
      const fetchOptions = { ...fetchOptionsInput, headers, keepalive: true };

      let keyFailedCompletely = true;

      for (const currentModel of modelSequence) {
        if (!isModelAvailable(apiKey, currentModel)) {
          continue;
        }

        const urlString = originalUrl.toString();
        const modifiedUrl = urlString.replace(
          /\/models\/([^:]+):/,
          `/models/${currentModel}:`,
        );

        try {
          const response = await fetch(modifiedUrl, fetchOptions);
          lastResponse = response;

          if (!response.ok) {
            if (response.status === 403 || response.status === 429) {
              pool.markRateLimited(apiKey, 90_000);
              serverWarn(
                `[Router${logLabel}] Cause: HTTP ${response.status} (Key Limit) | Switched: API Key | Cooldown: 90s for entire ${pool.label(apiKey)}`,
              );
              keyFailedCompletely = false;
              break;
            }

            markModelCooldown(apiKey, currentModel, 60_000);
            serverWarn(
              `[Router${logLabel}] Cause: HTTP ${response.status} | Switched: Model | Cooldown: 60s for ${currentModel} on ${pool.label(apiKey)}`,
            );

            try {
              await response.text();
            } catch {}

            continue;
          }

          keyFailedCompletely = false;
          serverLog(`[Model${logLabel}]: used ${currentModel} from ${pool.label(apiKey)}`);
          return response;
        } catch (error) {
          if (
            (error as Error)?.name === "AbortError" ||
            (error as Error)?.name === "TimeoutError"
          ) {
            throw error;
          }

          lastError = error;
          const errStr = error instanceof Error ? error.message : "Unknown Error";

          if (
            errStr.includes("403") ||
            errStr.includes("429") ||
            errStr.includes("Spend cap") ||
            errStr.includes("RESOURCE_EXHAUSTED")
          ) {
            pool.markRateLimited(apiKey, 90_000);
            serverWarn(
              `[Router${logLabel}] Cause: ${errStr} (Key Limit) | Switched: API Key | Cooldown: 90s for entire ${pool.label(apiKey)}`,
            );
            keyFailedCompletely = false;
            break;
          }

          markModelCooldown(apiKey, currentModel, 60_000);
          serverWarn(
            `[Router${logLabel}] Cause: ${errStr} | Switched: Model | Cooldown: 60s for ${currentModel} on ${pool.label(apiKey)}`,
          );
          continue;
        }
      }

      if (keyFailedCompletely) {
        pool.markRateLimited(apiKey, 90_000);
        serverWarn(
          `[Router${logLabel}] Cause: All models failed | Switched: API Key | Cooldown: 90s for entire ${pool.label(apiKey)}`,
        );
      }
    }

    if (lastResponse) return lastResponse;
    throw lastError || new Error("All models and API keys failed.");
  };
}
