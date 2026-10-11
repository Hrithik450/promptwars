export interface ThreadMessageRecord {
  id: string;
  thread_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

export interface ThreadMessageResponse {
  success: boolean;
  data?: ThreadMessageRecord;
  error?: string;
}

export interface ThreadMessagesResponse {
  success: boolean;
  data?: ThreadMessageRecord[];
  error?: string;
}

/**
 * Service managing thread conversation history.
 * Ensures rolling 20-message user context for AI agent interactions.
 */
export class ThreadMessageService {
  private static memoryStore: Map<string, ThreadMessageRecord[]> = new Map();

  static async createMessage(data: {
    thread_id: string;
    role: "user" | "assistant" | "system";
    content: string;
  }): Promise<ThreadMessageResponse> {
    try {
      const record: ThreadMessageRecord = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        thread_id: data.thread_id,
        role: data.role,
        content: data.content,
        created_at: new Date().toISOString(),
      };

      const list = this.memoryStore.get(data.thread_id) || [];
      list.push(record);
      // Keep last 50 messages in thread buffer
      if (list.length > 50) {
        list.shift();
      }
      this.memoryStore.set(data.thread_id, list);

      return {
        success: true,
        data: record,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to record thread message",
      };
    }
  }

  static async getMessagesByThreadId(
    threadId: string,
  ): Promise<ThreadMessagesResponse> {
    try {
      const list = this.memoryStore.get(threadId) || [];
      return {
        success: true,
        data: [...list],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch thread messages",
      };
    }
  }

  static clear(threadId?: string): void {
    if (threadId) {
      this.memoryStore.delete(threadId);
    } else {
      this.memoryStore.clear();
    }
  }
}
