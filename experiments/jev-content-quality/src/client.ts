import type { JevResponse, RubricQuestion } from "./types.js";

export const DEFAULT_MODEL = "jev-1.13.0";
export const SYSTEM_ONE_URL = "https://api.typesafe.ai/v1/systemone";

export class TypeSafeApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly timeout = false,
  ) {
    super(message);
    this.name = "TypeSafeApiError";
  }
}

export class TypeSafeDirectClient {
  constructor(
    private readonly apiKey: string,
    private readonly model = DEFAULT_MODEL,
    private readonly timeoutMs = 30_000,
    private readonly maxRetries = 2,
  ) {}

  async evaluate(state: Record<string, unknown>, questions: Record<string, RubricQuestion>): Promise<{ response: JevResponse; latencyMs: number }> {
    const startedAt = performance.now();
    for (let attempt = 0; attempt <= this.maxRetries; attempt += 1) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);
      try {
        const response = await fetch(SYSTEM_ONE_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ state, model: this.model, questions }),
          signal: controller.signal,
        });
        const body = (await response.json()) as unknown;
        if (response.ok) {
          return { response: body as JevResponse, latencyMs: Math.round(performance.now() - startedAt) };
        }
        if ((response.status === 429 || response.status === 529) && attempt < this.maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
          continue;
        }
        throw new TypeSafeApiError(`TypeSafe API request failed with HTTP ${response.status}: ${JSON.stringify(body)}`, response.status);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          throw new TypeSafeApiError(`TypeSafe API request timed out after ${this.timeoutMs}ms`, undefined, true);
        }
        if (error instanceof TypeSafeApiError) {
          throw error;
        }
        throw new TypeSafeApiError(`TypeSafe API request failed: ${String(error)}`);
      } finally {
        clearTimeout(timer);
      }
    }
    throw new TypeSafeApiError("TypeSafe API retry loop ended unexpectedly");
  }
}
