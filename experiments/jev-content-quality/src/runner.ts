import { randomUUID } from "node:crypto";
import type { CandidateRecord, EvaluationResult, InstructionLanguage, JevAnswer } from "./types.js";
import { buildRubric, CONCEPT_ATOMIC_IDS, QUESTION_ATOMIC_IDS, RUBRIC_VERSION } from "./rubric.js";
import { CONCEPT_NOUL_IDS, criterionPredictions, derivePolicy, QUESTION_NOUL_IDS, type PolicyThresholds } from "./policy.js";
import { TypeSafeDirectClient } from "./client.js";

export interface RunOptions {
  dataset: CandidateRecord[];
  client: TypeSafeDirectClient;
  requestedModel: string;
  datasetVersion: string;
  languageExperimentCaseGroups?: ReadonlySet<string>;
  languages?: readonly InstructionLanguage[];
  thresholds?: PolicyThresholds;
  repeatIndex?: number;
}

function answerProbabilities(answers: Record<string, JevAnswer>): Record<string, number | Record<string, number>> {
  const probabilities: Record<string, number | Record<string, number>> = {};
  for (const [id, answer] of Object.entries(answers)) {
    if (answer.type === "noul" && typeof answer.noul === "number") probabilities[id] = answer.noul;
    else if (answer.probabilities) probabilities[id] = answer.probabilities;
  }
  return probabilities;
}

export async function runBenchmark(options: RunOptions): Promise<EvaluationResult[]> {
  const results: EvaluationResult[] = [];
  const languages: readonly InstructionLanguage[] = options.languages ?? ["ko"];
  for (const candidate of options.dataset) {
    const selectedLanguages: readonly InstructionLanguage[] = options.languageExperimentCaseGroups?.has(candidate.caseGroupId) ? languages : ["ko"];
    for (const language of selectedLanguages) {
      const rubric = buildRubric(candidate.kind, language);
      const criterionIds = candidate.kind === "QUESTION" ? QUESTION_NOUL_IDS : CONCEPT_NOUL_IDS;
      const started = Date.now();
      try {
        const { response, latencyMs } = await options.client.evaluate(candidate.state, rubric.questions);
        const answers = response.answers ?? {};
        const policy = derivePolicy(answers, options.thresholds, criterionIds);
        results.push({
          runId: randomUUID(),
          repeatIndex: options.repeatIndex ?? 0,
          caseId: candidate.caseId,
          caseGroupId: candidate.caseGroupId,
          kind: candidate.kind,
          area: candidate.area,
          contentKey: candidate.contentKey,
          questionType: typeof candidate.content.questionType === "string" ? candidate.content.questionType : undefined,
          instructionLanguage: language,
          requestedModel: options.requestedModel,
          resolvedModel: response.model,
          rubricVersion: RUBRIC_VERSION,
          datasetVersion: options.datasetVersion,
          latencyMs,
          inputTokens: response.usage?.input_tokens,
          outputTokens: response.usage?.output_tokens,
          rawAnswers: answers,
          probabilities: answerProbabilities(answers),
          criterionPredictions: criterionPredictions(answers, options.thresholds, criterionIds),
          derivedPolicyResult: policy,
        });
      } catch (error) {
        const apiError = error as { timeout?: boolean; status?: number; message?: string };
        results.push({
          runId: randomUUID(),
          repeatIndex: options.repeatIndex ?? 0,
          caseId: candidate.caseId,
          caseGroupId: candidate.caseGroupId,
          kind: candidate.kind,
          area: candidate.area,
          contentKey: candidate.contentKey,
          questionType: typeof candidate.content.questionType === "string" ? candidate.content.questionType : undefined,
          instructionLanguage: language,
          requestedModel: options.requestedModel,
          rubricVersion: RUBRIC_VERSION,
          datasetVersion: options.datasetVersion,
          latencyMs: Date.now() - started,
          derivedPolicyResult: { decision: "UNCALIBRATED", triggeredCriteria: [], missingThresholds: [], note: "No policy decision is derived after an API error." },
          error: { kind: apiError.timeout ? "TIMEOUT" : "API_FAILURE", message: apiError.message ?? String(error), status: apiError.status },
        });
      }
    }
  }
  return results;
}
