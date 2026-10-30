import type { EvaluationErrorKind, JevResponse, RubricQuestion } from "./types.js";

export const DEFAULT_MODEL = "jev-1.13.0";
export const SYSTEM_ONE_URL = "https://api.typesafe.ai/v1/systemone";

export class TypeSafeApiError extends Error {
  readonly timeout: boolean;

  constructor(
    message: string,
    readonly status?: number,
    readonly kind: EvaluationErrorKind = "API_FAILURE",
  ) {
    super(message);
    this.name = "TypeSafeApiError";
    this.timeout = kind === "TIMEOUT";
  }
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function invalidResponse(message: string): never {
  throw new TypeSafeApiError(`Invalid TypeSafe response: ${message}`, undefined, "INVALID_RESPONSE");
}

function validateProbability(value: unknown, path: string): void {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 1) {
    invalidResponse(`${path} must be a finite number in [0, 1]`);
  }
}

function validateChoiceAnswer(answer: Record<string, unknown>, question: RubricQuestion, id: string): void {
  if (typeof answer.choice !== "string") invalidResponse(`answers.${id}.choice is required`);
  const criteria = question.criteria;
  if (!criteria || Array.isArray(criteria) || !isRecord(criteria)) invalidResponse(`questions.${id} has no choice criteria`);
  const optionKeys = Object.keys(criteria);
  if (!optionKeys.includes(answer.choice)) invalidResponse(`answers.${id}.choice is not one of the requested options`);

  if (!isRecord(answer.probabilities)) invalidResponse(`answers.${id}.probabilities is required`);
  const probabilityKeys = Object.keys(answer.probabilities);
  if (probabilityKeys.length !== optionKeys.length || probabilityKeys.some((key) => !optionKeys.includes(key))) {
    invalidResponse(`answers.${id}.probabilities must contain exactly the requested option keys`);
  }
  let sum = 0;
  for (const key of optionKeys) {
    const probability = answer.probabilities[key];
    validateProbability(probability, `answers.${id}.probabilities.${key}`);
    sum += probability as number;
  }
  if (Math.abs(sum - 1) > 1e-6) invalidResponse(`answers.${id}.probabilities must sum to 1`);
  validateProbability(answer.confidence, `answers.${id}.confidence`);
}

export function validateJevResponse(value: unknown, questions: Record<string, RubricQuestion>): JevResponse {
  if (!isRecord(value)) invalidResponse("response must be an object");
  if (typeof value.model !== "string" || value.model.trim().length === 0) invalidResponse("model must be a non-empty string");
  if (!isRecord(value.answers)) invalidResponse("answers must be an object");

  const requestedIds = Object.keys(questions);
  const returnedIds = Object.keys(value.answers);
  const missingIds = requestedIds.filter((id) => !returnedIds.includes(id));
  if (missingIds.length > 0) invalidResponse(`answers is missing requested ids: ${missingIds.join(", ")}`);
  const extraIds = returnedIds.filter((id) => !requestedIds.includes(id));
  if (extraIds.length > 0) invalidResponse(`answers contains unexpected ids: ${extraIds.join(", ")}`);

  for (const id of requestedIds) {
    const answer = value.answers[id];
    if (!isRecord(answer)) invalidResponse(`answers.${id} must be an object`);
    const question = questions[id];
    if (answer.type !== question.type) invalidResponse(`answers.${id}.type must be ${question.type}`);
    if (question.type === "noul") {
      validateProbability(answer.noul, `answers.${id}.noul`);
    } else if (question.type === "choice") {
      validateChoiceAnswer(answer, question, id);
    } else if (typeof answer.score !== "number" || !Number.isFinite(answer.score)) {
      invalidResponse(`answers.${id}.score must be a finite number`);
    }
  }

  if (value.usage !== undefined) {
    if (!isRecord(value.usage)) invalidResponse("usage must be an object");
    for (const key of ["input_tokens", "output_tokens"] as const) {
      if (value.usage[key] !== undefined && (typeof value.usage[key] !== "number" || !Number.isInteger(value.usage[key]) || value.usage[key] < 0)) {
        invalidResponse(`usage.${key} must be a non-negative integer`);
      }
    }
  }

  return value as unknown as JevResponse;
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
        let body: unknown;
        try {
          body = await response.json();
        } catch (error) {
          if (response.ok) throw new TypeSafeApiError(`TypeSafe API returned non-JSON success body: ${String(error)}`, undefined, "INVALID_RESPONSE");
          throw error;
        }
        if (response.ok) {
          return { response: validateJevResponse(body, questions), latencyMs: Math.round(performance.now() - startedAt) };
        }
        if ((response.status === 429 || response.status === 529) && attempt < this.maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
          continue;
        }
        throw new TypeSafeApiError(`TypeSafe API request failed with HTTP ${response.status}: ${JSON.stringify(body)}`, response.status);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          throw new TypeSafeApiError(`TypeSafe API request timed out after ${this.timeoutMs}ms`, undefined, "TIMEOUT");
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
