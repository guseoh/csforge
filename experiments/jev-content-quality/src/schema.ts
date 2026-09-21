import type { CandidateRecord, ConceptGold, QuestionGold, RubricDefinition } from "./types.js";

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

function validateGold(row: CandidateRecord, errors: string[]): void {
  const gold = row.candidateGold as unknown as Record<string, unknown>;
  const expectedKeys = row.kind === "QUESTION" ? QUESTION_GOLD_KEYS : CONCEPT_GOLD_KEYS;
  for (const key of expectedKeys) {
    if (!hasOwn(gold, key)) {
      errors.push(`${row.caseId}: candidateGold.${key} is required`);
    }
  }

  if (row.kind === "QUESTION") {
    const questionGold = gold as unknown as QuestionGold;
    if (!["TOO_EASY", "APPROPRIATE", "TOO_HARD"].includes(questionGold.difficultyFit)) {
      errors.push(`${row.caseId}: invalid candidateGold.difficultyFit`);
    }
    if (questionGold.weakDistractor !== null && typeof questionGold.weakDistractor !== "boolean") {
      errors.push(`${row.caseId}: question weakDistractor must be boolean or null`);
    }
  } else {
    const conceptGold = gold as unknown as ConceptGold;
    for (const key of CONCEPT_GOLD_KEYS) {
      if (typeof conceptGold[key] !== "boolean") {
        errors.push(`${row.caseId}: concept candidateGold.${key} must be boolean`);
      }
    }
  }
}

export function validateDataset(rows: CandidateRecord[]): string[] {
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
    validateGold(row, errors);
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
    if (group.some((row) => row.contentKey !== first.contentKey || row.kind !== first.kind || row.area !== first.area)) {
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
