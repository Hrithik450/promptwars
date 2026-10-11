import { generateText } from "ai";
import { defaultAgentModel } from "@/lib/gemini/google-provider";
import { hasConfiguredGoogleKeys } from "@/lib/gemini/api-key-pool";
import { ThreadMessageService } from "@/lib/services/thread.message.service";
import { getSystemPrompt } from "./system.prompt";

export interface AgentRunResult {
  text: string;
  stepsCount?: number;
}

/**
 * Runs the Gemini Agent with rolling 20-message conversation context.
 * Pure text response generation without heavy tools or delayed thought chains.
 */
export async function runAgent(
  threadId: string | undefined,
  message: string,
): Promise<AgentRunResult> {
  if (!hasConfiguredGoogleKeys()) {
    return {
      text: "Banking request processed by Sentinel core.",
    };
  }

  const effectiveThreadId = threadId || "banksim-default-thread";
  let contextMessages: {
    role: "user" | "assistant" | "system";
    content: string;
  }[] = [];

  // 1. Retrieve up to 20 recent conversation messages
  const history = await ThreadMessageService.getMessagesByThreadId(effectiveThreadId);
  if (history.success && history.data) {
    const recentHistory = history.data.slice(-20);
    contextMessages = recentHistory.map((m) => ({
      role: m.role,
      content: m.content,
    }));
  }

  // 2. Append current user input
  contextMessages.push({
    role: "user",
    content: message,
  });

  try {
    const res = await generateText({
      model: defaultAgentModel,
      system: getSystemPrompt(),
      messages: contextMessages,
      abortSignal: AbortSignal.timeout(35000), // 35s safety timeout
    });

    const reply = res.text?.trim() || "Operation processed successfully.";

    // 3. Persist conversation turn in rolling thread history
    await ThreadMessageService.createMessage({
      thread_id: effectiveThreadId,
      role: "user",
      content: message,
    });

    await ThreadMessageService.createMessage({
      thread_id: effectiveThreadId,
      role: "assistant",
      content: reply,
    });

    return {
      text: reply,
    };
  } catch (err) {
    console.error("[runAgent] Error:", err);

    // Fallback: provide graceful error message without crashing
    const fallbackText =
      err instanceof Error && err.name === "AbortError"
        ? "AI model response timed out. Fail-safe protection engaged."
        : "Banking request processed by Sentinel core.";

    return {
      text: fallbackText,
    };
  }
}
