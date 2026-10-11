
export interface GoogleApiKeyPoolOptions {
  cooldownMs?: number;
}

function parseKeyList(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/[\s,]+/)
    .map((k) => k.trim())
    .filter(Boolean);
}

export function loadGoogleApiKeysFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): string[] {
  const seen = new Set<string>();
  const keys: string[] = [];

  const add = (value: string | undefined) => {
    for (const key of parseKeyList(value)) {
      if (seen.has(key)) continue;
      seen.add(key);
      keys.push(key);
    }
  };

  add(env.GENERAL_GEMINI_API_KEYS);
  add(env.GEMINI_API_KEY);

  const numbered = Object.keys(env)
    .map((name) => {
      const match = /^GEMINI_API_KEY_(\d+)$/.exec(name);
      return match ? { name, n: Number(match[1]) } : null;
    })
    .filter((x): x is { name: string; n: number } => x !== null)
    .sort((a, b) => a.n - b.n);

  for (const { name } of numbered) {
    add(env[name]);
  }

  return keys;
}

export function hasConfiguredGoogleKeys(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return loadGoogleApiKeysFromEnv(env).length > 0;
}

export class GoogleApiKeyPool {
  private readonly keys: string[];
  private readonly cooldownMs: number;
  private readonly cooldownUntil = new Map<string, number>();
  private cursor = 0;

  constructor(keys: string[], options?: GoogleApiKeyPoolOptions) {
    const unique = [...new Set(keys.map((k) => k.trim()).filter(Boolean))];
    this.keys = unique.length > 0 ? unique : ["UNCONFIGURED_KEY"];
    this.cooldownMs =
      options?.cooldownMs ??
      Number(process.env.GEMINI_API_KEY_COOLDOWN_MS ?? 60_000);
  }

  get hasValidKeys(): boolean {
    return this.keys.length > 0 && this.keys[0] !== "UNCONFIGURED_KEY";
  }

  get size(): number {
    return this.keys.length;
  }

  label(apiKey: string): string {
    const idx = this.keys.indexOf(apiKey);
    return idx >= 0 ? `#${idx + 1}` : "#?";
  }

  private isAvailable(apiKey: string, now = Date.now()): boolean {
    const until = this.cooldownUntil.get(apiKey);
    return until == null || until <= now;
  }

  acquire(exclude?: ReadonlySet<string>): string {
    const now = Date.now();
    const n = this.keys.length;

    for (let i = 0; i < n; i++) {
      const idx = (this.cursor + i) % n;
      const key = this.keys[idx]!;
      if (exclude?.has(key)) continue;
      if (!this.isAvailable(key, now)) continue;
      this.cursor = idx; // Stick to this healthy key
      return key;
    }

    let best: string | null = null;
    let bestUntil = Infinity;
    for (const key of this.keys) {
      if (exclude?.has(key)) continue;
      const until = this.cooldownUntil.get(key) ?? 0;
      if (until < bestUntil) {
        bestUntil = until;
        best = key;
      }
    }

    if (best) {
      this.cooldownUntil.delete(best);
      this.cursor = this.keys.indexOf(best); // Stick to the best available key
      return best;
    }

    const fallback = this.keys[this.cursor % n]!;
    // Do not advance cursor so we stay sticky even on fallback
    return fallback;
  }

  markRateLimited(apiKey: string, cooldownMs = this.cooldownMs): void {
    this.cooldownUntil.set(apiKey, Date.now() + cooldownMs);
  }
}

let sharedPool: GoogleApiKeyPool | null = null;

export function getGoogleApiKeyPool(): GoogleApiKeyPool {
  if (!sharedPool) {
    sharedPool = new GoogleApiKeyPool(loadGoogleApiKeysFromEnv());
  }
  return sharedPool;
}

export function resetGoogleApiKeyPool(): void {
  sharedPool = null;
}
