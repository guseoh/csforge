export type CandidateKind = "QUESTION" | "CONCEPT";
export type CandidateSeverity = "P0" | "P1" | "P2" | "NONE";
export type DifficultyFit = "TOO_EASY" | "APPROPRIATE" | "TOO_HARD";
export type InstructionLanguage = "ko" | "en";
export type PolicyDecision = "PASS" | "REVIEW" | "UNCALIBRATED";
export type EvaluationErrorKind = "API_FAILURE" | "TIMEOUT" | "INVALID_RESPONSE";

export interface QuestionGold {
  materialTechnicalError: boolean;
  multipleDefensibleAnswers: boolean;
  answerExplanationConflict: boolean;
  linkedConceptMisalignment: boolean;
  responseShapeMismatch: boolean;
  weakDistractor: boolean | null;
  difficultyFit: DifficultyFit;
}

export interface ConceptGold {
  materialTechnicalError: boolean;
  layerBoundaryConfusion: boolean;
  learningObjectiveGap: boolean;
  causalOrStateFlowGap: boolean;
}

export type CandidateGold = QuestionGold | ConceptGold;

export interface SourceRef {
  sourcePr: number;
  repositoryRef: string;
  path: string;
  beforeRef: string;
  afterRef: string;
  commit: string;
  version: "BEFORE" | "AFTER";
}

export interface CandidateRecord {
  datasetVersion: string;
  caseId: string;
  caseGroupId: string;
  kind: CandidateKind;
  area: string;
  contentKey: string;
  source: SourceRef;
  content: Record<string, unknown>;
  state: Record<string, unknown>;
  candidateGoldSeverity: CandidateSeverity;
  candidateGold: CandidateGold;
  labelRationale: string;
}

export interface RubricQuestion {
  type: "noul" | "choice" | "score";
  instructions: string;
  criteria?: Record<string, string> | string[];
}

export interface RubricDefinition {
  version: string;
  kind: CandidateKind;
  language: InstructionLanguage;
  questions: Record<string, RubricQuestion>;
}

export interface JevAnswer {
  type: "noul" | "choice" | "score";
  noul?: number;
  choice?: string;
  probabilities?: Record<string, number>;
  confidence?: number;
  score?: number;
}

export interface JevResponse {
  model: string;
  answers: Record<string, JevAnswer>;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
}

export interface PolicyResult {
  decision: PolicyDecision;
  triggeredCriteria: string[];
  missingThresholds: string[];
  note?: string;
}

export interface EvaluationResult {
  runId: string;
  repeatIndex: number;
  caseId: string;
  caseGroupId: string;
  kind: CandidateKind;
  area: string;
  contentKey: string;
  questionType?: string;
  instructionLanguage: InstructionLanguage;
  requestedModel: string;
  resolvedModel?: string;
  rubricVersion: string;
  datasetVersion: string;
  latencyMs?: number;
  inputTokens?: number;
  outputTokens?: number;
  rawAnswers?: Record<string, JevAnswer>;
  probabilities?: Record<string, number | Record<string, number>>;
  criterionPredictions?: Record<string, boolean>;
  derivedPolicyResult: PolicyResult;
  error?: {
    kind: EvaluationErrorKind;
    message: string;
    status?: number;
  };
}
