import type { DatasetManifest } from "./dataset.js";
import { FROZEN_HISTORICAL_HOLDOUT, FROZEN_WEAK_DISTRACTOR_HOLDOUT } from "./dataset.js";
import type { CandidateRecord, QuestionGold, RubricDefinition } from "./types.js";

const QUESTION_GOLD_KEYS = [
  "materialTechnicalError",
  "multipleDefensibleAnswers",
  "answerExplanationConflict",
  "linkedConceptMisalignment",
  "responseShapeMismatch",
  "weakDistractor",
  "difficultyFit",
] as const;

const CONCEPT_GOLD_KEYS = [
  "materialTechnicalError",
  "layerBoundaryConfusion",
  "learningObjectiveGap",
  "causalOrStateFlowGap",
] as const;

function hasOwn(object: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(object, key);
}

const QUESTION_V2_GOLD_KEYS = ["materialTechnicalError", "multipleDefensibleAnswers", "weakDistractor"] as const;
const CONCEPT_V2_GOLD_KEYS = ["materialTechnicalError"] as const;

const CRITERION_GOLD_KEYS: Record<string, string> = {
  material_technical_error: "materialTechnicalError",
  multiple_defensible_answers: "multipleDefensibleAnswers",
  weak_distractor: "weakDistractor",
};

function validateGold(row: CandidateRecord, manifest: DatasetManifest | undefined, errors: string[]): void {
  const gold = row.candidateGold as unknown as Record<string, unknown>;
  const isV2 = manifest?.rubricVersion === "csforge-content-quality-v2";
  const requestedGoldKeys = manifest?.requestedCriteria?.map((criterionId) => CRITERION_GOLD_KEYS[criterionId]).filter(Boolean);
  const expectedKeys: readonly string[] = requestedGoldKeys ?? (row.kind === "QUESTION"
    ? (isV2 ? QUESTION_V2_GOLD_KEYS : QUESTION_GOLD_KEYS)
    : (isV2 ? CONCEPT_V2_GOLD_KEYS : CONCEPT_GOLD_KEYS));
  for (const key of expectedKeys) {
    if (!hasOwn(gold, key)) {
      errors.push(`${row.caseId}: candidateGold.${key} is required`);
    }
  }
  for (const key of Object.keys(gold)) {
    if (!(expectedKeys as readonly string[]).includes(key)) {
      errors.push(`${row.caseId}: candidateGold.${key} is not allowed by ${manifest?.rubricVersion ?? "the dataset rubric"}`);
    }
  }

  if (row.kind === "QUESTION") {
    const questionGold = gold as unknown as QuestionGold;
    if (!isV2 && !["TOO_EASY", "APPROPRIATE", "TOO_HARD"].includes(questionGold.difficultyFit)) {
      errors.push(`${row.caseId}: invalid candidateGold.difficultyFit`);
    }
    if (questionGold.weakDistractor !== null && typeof questionGold.weakDistractor !== "boolean") {
      errors.push(`${row.caseId}: question weakDistractor must be boolean or null`);
    }
    const isMultipleChoice = row.content.questionType === "MULTIPLE_CHOICE";
    if (isMultipleChoice && typeof questionGold.weakDistractor !== "boolean") {
      errors.push(`${row.caseId}: MULTIPLE_CHOICE weakDistractor must be boolean`);
    }
    if (!isMultipleChoice && questionGold.weakDistractor !== null) {
      errors.push(`${row.caseId}: non-MULTIPLE_CHOICE weakDistractor must be null`);
    }
  } else {
    const conceptGold = gold as unknown as Record<string, unknown>;
    for (const key of expectedKeys) {
      if (typeof conceptGold[key] !== "boolean") {
        errors.push(`${row.caseId}: concept candidateGold.${key} must be boolean`);
      }
    }
  }
}

const SUPPORT_KEYS = {
  QUESTION: [
    "materialTechnicalError",
    "multipleDefensibleAnswers",
    "answerExplanationConflict",
    "linkedConceptMisalignment",
    "responseShapeMismatch",
    "weakDistractor",
  ],
  CONCEPT: [
    "materialTechnicalError",
    "layerBoundaryConfusion",
    "learningObjectiveGap",
    "causalOrStateFlowGap",
  ],
} as const;

export function validateManifest(
  manifest: DatasetManifest,
  rows: CandidateRecord[],
  phaseARows: CandidateRecord[] = [],
  phaseA1Rows: CandidateRecord[] = [],
): string[] {
  const errors: string[] = [];
  if (manifest.primaryInstructionLanguage !== "ko") errors.push("manifest primaryInstructionLanguage must be ko");
  const groups = new Map(rows.map((row) => [row.caseGroupId, row]));
  const languageGroups = manifest.languageExperimentCaseGroups ?? [];
  if (new Set(languageGroups).size !== languageGroups.length) errors.push("manifest languageExperimentCaseGroups must be unique");
  for (const groupId of languageGroups) {
    if (!groups.has(groupId)) errors.push(`manifest language experiment case group does not exist: ${groupId}`);
  }

  const requestedGoldKeys = manifest.requestedCriteria?.map((criterionId) => CRITERION_GOLD_KEYS[criterionId]).filter(Boolean);
  const supportKeys = requestedGoldKeys
    ? { QUESTION: requestedGoldKeys, CONCEPT: [] }
    : manifest.rubricVersion === "csforge-content-quality-v2"
      ? { QUESTION: QUESTION_V2_GOLD_KEYS, CONCEPT: CONCEPT_V2_GOLD_KEYS }
    : SUPPORT_KEYS;
  for (const kind of ["QUESTION", "CONCEPT"] as const) {
    const support = manifest.criterionSupport?.[kind === "QUESTION" ? "question" : "concept"];
    for (const key of supportKeys[kind]) {
      const entry = support?.[key];
      if (!entry) {
        errors.push(`manifest criterionSupport missing ${kind}.${key}`);
        continue;
      }
      const positiveSupport = rows.filter((row) => row.kind === kind && (row.candidateGold as unknown as Record<string, unknown>)[key] === true).length;
      if (entry.positiveSupport !== positiveSupport) {
        errors.push(`manifest criterionSupport ${kind}.${key}=${entry.positiveSupport}, actual=${positiveSupport}`);
      }
      const applicableRows = rows.filter((row) => row.kind === kind && typeof (row.candidateGold as unknown as Record<string, unknown>)[key] === "boolean");
      const negativeSupport = applicableRows.length - positiveSupport;
      if (entry.negativeSupport !== undefined && entry.negativeSupport !== negativeSupport) {
        errors.push(`manifest criterionSupport ${kind}.${key} negativeSupport=${entry.negativeSupport}, actual=${negativeSupport}`);
      }
      if (entry.applicableSupport !== undefined && entry.applicableSupport !== applicableRows.length) {
        errors.push(`manifest criterionSupport ${kind}.${key} applicableSupport=${entry.applicableSupport}, actual=${applicableRows.length}`);
      }
      if (positiveSupport === 0 && entry.recallEvaluable !== false) {
        errors.push(`manifest criterionSupport ${kind}.${key} must set recallEvaluable=false without positive support`);
      }
      if (positiveSupport > 0 && entry.recallEvaluable !== true) {
        errors.push(`manifest criterionSupport ${kind}.${key} must set recallEvaluable=true with positive support`);
      }
    }
  }

  if (manifest.rubricVersion !== "csforge-content-quality-v2") {
    const expectedDifficulty = ["TOO_EASY", "APPROPRIATE", "TOO_HARD"] as const;
    for (const difficulty of expectedDifficulty) {
      const actual = rows.filter((row) => row.kind === "QUESTION" && (row.candidateGold as QuestionGold).difficultyFit === difficulty).length;
      if (manifest.difficultyFitDistribution?.[difficulty] !== actual) {
        errors.push(`manifest difficultyFitDistribution ${difficulty}=${manifest.difficultyFitDistribution?.[difficulty]}, actual=${actual}`);
      }
    }
  }
  if (manifest.datasetKind === FROZEN_HISTORICAL_HOLDOUT) {
    const groupCount = new Set(rows.map((row) => row.caseGroupId)).size;
    if (manifest.holdoutPairCount !== 21 || groupCount !== 21 || rows.length !== 42) {
      errors.push(`frozen holdout must contain exactly 21 BEFORE/AFTER pairs; manifest=${manifest.holdoutPairCount}, groups=${groupCount}, rows=${rows.length}`);
    }
    const phaseAKeys = new Set(phaseARows.map((row) => row.contentKey));
    for (const contentKey of new Set(rows.map((row) => row.contentKey))) {
      if (phaseAKeys.has(contentKey)) errors.push(`frozen holdout overlaps Phase A contentKey: ${contentKey}`);
    }
    for (const row of rows.filter((candidate) => candidate.source.version === "AFTER")) {
      const goldValues = Object.values(row.candidateGold as unknown as Record<string, unknown>).filter((value) => value !== null);
      if (goldValues.some((value) => value !== false) || row.candidateGoldSeverity !== "NONE") {
        errors.push(`${row.caseId}: frozen holdout AFTER Gold must be false for every applicable V2 criterion with NONE severity`);
      }
    }
  }
  if (manifest.datasetKind === FROZEN_WEAK_DISTRACTOR_HOLDOUT) {
    const groupCount = new Set(rows.map((row) => row.caseGroupId)).size;
    if (manifest.holdoutPairCount !== 20 || groupCount !== 20 || rows.length !== 40) {
      errors.push(`frozen weak-distractor holdout must contain exactly 20 BEFORE/AFTER pairs; manifest=${manifest.holdoutPairCount}, groups=${groupCount}, rows=${rows.length}`);
    }
    if (manifest.rowCount !== 40 || manifest.caseGroupCount !== 20) {
      errors.push("frozen weak-distractor holdout manifest must declare rowCount=40 and caseGroupCount=20");
    }
    if (JSON.stringify(manifest.requestedCriteria) !== JSON.stringify(["weak_distractor"])) {
      errors.push("frozen weak-distractor holdout requestedCriteria must contain only weak_distractor");
    }
    if (rows.some((row) => row.kind !== "QUESTION" || row.content.questionType !== "MULTIPLE_CHOICE")) {
      errors.push("frozen weak-distractor holdout rows must all be MULTIPLE_CHOICE Questions");
    }
    const beforeRows = rows.filter((row) => row.source.version === "BEFORE");
    const afterRows = rows.filter((row) => row.source.version === "AFTER");
    const positiveBefore = beforeRows.filter((row) => (row.candidateGold as unknown as Record<string, unknown>).weakDistractor === true);
    if (positiveBefore.length !== 10) errors.push(`frozen weak-distractor holdout must have exactly 10 positive BEFORE rows; actual=${positiveBefore.length}`);
    for (const row of positiveBefore) {
      if (row.candidateGoldSeverity !== "P1") errors.push(`${row.caseId}: positive BEFORE severity must be P1`);
    }
    for (const row of beforeRows.filter((candidate) => !positiveBefore.includes(candidate))) {
      if ((row.candidateGold as unknown as Record<string, unknown>).weakDistractor !== false || row.candidateGoldSeverity !== "NONE") {
        errors.push(`${row.caseId}: negative BEFORE must be weakDistractor=false with NONE severity`);
      }
    }
    for (const row of afterRows) {
      if ((row.candidateGold as unknown as Record<string, unknown>).weakDistractor !== false || row.candidateGoldSeverity !== "NONE") {
        errors.push(`${row.caseId}: every AFTER must be weakDistractor=false with NONE severity`);
      }
    }
    const phaseAKeys = new Set(phaseARows.map((row) => row.contentKey));
    const phaseA1Keys = new Set(phaseA1Rows.map((row) => row.contentKey));
    for (const contentKey of new Set(rows.map((row) => row.contentKey))) {
      if (phaseAKeys.has(contentKey)) errors.push(`frozen weak-distractor holdout overlaps Phase A contentKey: ${contentKey}`);
      if (phaseA1Keys.has(contentKey)) errors.push(`frozen weak-distractor holdout overlaps Phase A.1 contentKey: ${contentKey}`);
    }
    const sourcePrs = [...new Set(rows.map((row) => row.source.sourcePr))].sort((a, b) => a - b);
    if (JSON.stringify(sourcePrs) !== JSON.stringify([20, 22, 25])) errors.push(`frozen weak-distractor holdout source PRs must be 20,22,25; actual=${sourcePrs.join(",")}`);
    const areaCount = new Set(rows.map((row) => row.area)).size;
    if (manifest.learningAreaCount !== 8 || areaCount !== 8) errors.push(`frozen weak-distractor holdout LearningArea count must be 8; manifest=${manifest.learningAreaCount}, actual=${areaCount}`);
  }
  return errors;
}

export function validateDataset(rows: CandidateRecord[], manifest?: DatasetManifest): string[] {
  const errors: string[] = [];
  const caseIds = new Set<string>();
  const groups = new Map<string, CandidateRecord[]>();

  for (const row of rows) {
    if (!row.caseId || caseIds.has(row.caseId)) {
      errors.push(`duplicate or missing caseId: ${row.caseId}`);
    }
    caseIds.add(row.caseId);
    if (!row.caseGroupId || !row.contentKey || !row.area) {
      errors.push(`${row.caseId}: caseGroupId, area, and contentKey are required`);
    }
    if (!row.source?.sourcePr || !row.source.beforeRef || !row.source.afterRef || !row.source.path) {
      errors.push(`${row.caseId}: source PR and before/after refs are required`);
    }
    for (const [name, ref] of Object.entries({ beforeRef: row.source?.beforeRef, afterRef: row.source?.afterRef, commit: row.source?.commit })) {
      if (!ref || !/^[0-9a-f]{40}$/i.test(ref)) errors.push(`${row.caseId}: source.${name} must be a full commit ref`);
    }
    if (row.source?.commit !== row.source?.afterRef) {
      errors.push(`${row.caseId}: source.commit must identify the reviewed after ref`);
    }
    if (row.source?.version !== (row.caseId.endsWith("-before") ? "BEFORE" : "AFTER")) {
      errors.push(`${row.caseId}: source.version does not match caseId`);
    }
    if (manifest && row.datasetVersion !== manifest.datasetVersion) {
      errors.push(`${row.caseId}: datasetVersion does not match manifest`);
    }
    validateGold(row, manifest, errors);
    const group = groups.get(row.caseGroupId) ?? [];
    group.push(row);
    groups.set(row.caseGroupId, group);
  }

  for (const [groupId, group] of groups) {
    if (group.length !== 2) {
      errors.push(`${groupId}: expected exactly one BEFORE and one AFTER row`);
      continue;
    }
    const versions = new Set(group.map((row) => row.source.version));
    if (versions.size !== 2 || !versions.has("BEFORE") || !versions.has("AFTER")) {
      errors.push(`${groupId}: paired versions must be BEFORE and AFTER`);
    }
    const [first] = group;
    if (group.some((row) => row.contentKey !== first.contentKey || row.kind !== first.kind || row.area !== first.area
      || row.source.sourcePr !== first.source.sourcePr || row.source.path !== first.source.path
      || row.source.beforeRef !== first.source.beforeRef || row.source.afterRef !== first.source.afterRef)) {
      errors.push(`${groupId}: pair metadata must remain identical`);
    }
  }
  return errors;
}

export function validateRubric(definitions: RubricDefinition[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const definition of definitions) {
    for (const [id, question] of Object.entries(definition.questions)) {
      const qualifiedId = `${definition.kind}:${definition.language}:${id}`;
      if (ids.has(qualifiedId)) {
        errors.push(`duplicate rubric question id: ${qualifiedId}`);
      }
      ids.add(qualifiedId);
      const text = JSON.stringify(question.instructions).toLowerCase();
      if (text.includes("human review") || text.includes("needsHumanReview") || text.includes("is this content good")) {
        errors.push(`${definition.kind}:${id}: composite review question is not allowed`);
      }
    }
  }
  return errors;
}
