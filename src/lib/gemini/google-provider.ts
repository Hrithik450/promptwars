import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
  getGoogleApiKeyPool,
  GoogleApiKeyPool,
  loadGoogleApiKeysFromEnv,
} from "./api-key-pool";
import { createRoutingFetch } from "./routing-fetch";

export interface RoutingProviderOptions {
  models: string[];
  apiKeys?: string[];
  label?: string;
}

export function createRoutingGoogleProvider(options: RoutingProviderOptions) {
  const providerPool = options.apiKeys
    ? new GoogleApiKeyPool(options.apiKeys)
    : getGoogleApiKeyPool();

  return createGoogleGenerativeAI({
    apiKey: "ROTATING_KEY",
    fetch: createRoutingFetch(options.models, providerPool, options.label),
  });
}

const allKeys = loadGoogleApiKeysFromEnv();

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
export const defaultAgentModel = agentProvider("gemini-3.5-flash");

export const titleProvider = createRoutingGoogleProvider({
  models: ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite"],
  apiKeys: allKeys,
  label: "titleGeneration",
});
export const defaultTitleModel = titleProvider("gemini-3.5-flash");

export const classifierProvider = createRoutingGoogleProvider({
  models: [
    "gemini-2.5-flash",
    "gemini-3.5-flash",
    "gemini-3.6-flash",
    "gemini-3.7-flash",
  ],
  apiKeys: allKeys,
  label: "threatClassifier",
});
export const defaultClassifierModel = classifierProvider("gemini-3.5-flash");
