import { randomUUID } from "node:crypto";
import type { CandidateRecord, EvaluationResult, InstructionLanguage, JevAnswer } from "./types.js";
import { buildRubricForVersion, RUBRIC_VERSION } from "./rubric.js";
import { TypeSafeApiError, TypeSafeDirectClient } from "./client.js";

export interface RunOptions {
  dataset: CandidateRecord[];
  client: TypeSafeDirectClient;
  requestedModel: string;
  datasetVersion: string;
  datasetKind?: string;
  rubricVersion?: string;
  languageExperimentCaseGroups?: ReadonlySet<string>;
  languages?: readonly InstructionLanguage[];
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
      const questionType = typeof candidate.content.questionType === "string" ? candidate.content.questionType : undefined;
      const rubricVersion = options.rubricVersion ?? RUBRIC_VERSION;
      const rubric = buildRubricForVersion(rubricVersion, candidate.kind, language, questionType);
      const criterionIds = Object.entries(rubric.questions)
        .filter(([, question]) => question.type === "noul")
        .map(([id]) => id);
      const started = Date.now();
      try {
        const { response, latencyMs } = await options.client.evaluate(candidate.state, rubric.questions);
        const answers = response.answers ?? {};
        results.push({
          runId: randomUUID(),
          repeatIndex: options.repeatIndex ?? 0,
          caseId: candidate.caseId,
          caseGroupId: candidate.caseGroupId,
          kind: candidate.kind,
          area: candidate.area,
          contentKey: candidate.contentKey,
          questionType,
          instructionLanguage: language,
          requestedModel: options.requestedModel,
          resolvedModel: response.model,
          rubricVersion,
          datasetVersion: options.datasetVersion,
          datasetKind: options.datasetKind,
          latencyMs,
          inputTokens: response.usage?.input_tokens,
          outputTokens: response.usage?.output_tokens,
          rawAnswers: answers,
          probabilities: answerProbabilities(answers),
          derivedPolicyResult: {
            decision: "UNCALIBRATED",
            triggeredCriteria: [],
            missingThresholds: criterionIds,
            note: "Raw Jev evaluation only. Apply candidate thresholds offline before interpreting PASS/REVIEW.",
          },
        });
      } catch (error) {
        const apiError = error instanceof TypeSafeApiError
          ? error
          : new TypeSafeApiError(String(error));
        results.push({
          runId: randomUUID(),
          repeatIndex: options.repeatIndex ?? 0,
          caseId: candidate.caseId,
          caseGroupId: candidate.caseGroupId,
          kind: candidate.kind,
          area: candidate.area,
          contentKey: candidate.contentKey,
          questionType,
          instructionLanguage: language,
          requestedModel: options.requestedModel,
          rubricVersion,
          datasetVersion: options.datasetVersion,
          datasetKind: options.datasetKind,
          latencyMs: Date.now() - started,
          derivedPolicyResult: { decision: "UNCALIBRATED", triggeredCriteria: [], missingThresholds: [], note: "No policy decision is derived after an API error." },
          error: { kind: apiError.kind, message: apiError.message, status: apiError.status },
        });
      }
    }
  }
  return results;
}
