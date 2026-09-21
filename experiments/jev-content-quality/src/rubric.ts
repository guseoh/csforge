import type { CandidateKind, InstructionLanguage, RubricDefinition, RubricQuestion } from "./types.js";

export const RUBRIC_VERSION = "csforge-content-quality-v1";
export const QUESTION_ATOMIC_IDS = [
  "material_technical_error",
  "multiple_defensible_answers",
  "answer_explanation_conflict",
  "linked_concept_misalignment",
  "response_shape_mismatch",
  "weak_distractor",
  "difficulty_fit",
] as const;
export const CONCEPT_ATOMIC_IDS = [
  "material_technical_error",
  "layer_boundary_confusion",
  "learning_objective_gap",
  "causal_or_state_flow_gap",
] as const;

const noul = (instructions: string, yes: string, no: string): RubricQuestion => ({
  type: "noul",
  instructions,
  criteria: { true: yes, false: no },
});

export function buildRubric(kind: CandidateKind, language: InstructionLanguage, questionType?: string): RubricDefinition {
  const korean = language === "ko";
  const includeWeakDistractor = questionType === undefined || questionType === "MULTIPLE_CHOICE";
  const questions: Record<string, RubricQuestion> = kind === "QUESTION"
    ? korean
      ? {
          material_technical_error: noul("state의 Question에 학습자가 오해할 material technical error가 있는가?", "사실·계약·runtime 의미가 실질적으로 틀렸다.", "material technical error가 없다."),
          multiple_defensible_answers: noul("state의 Question이 주어진 조건에서 결정적인 조건을 빠뜨려 서로 양립할 수 없는 결론이나 root cause가 둘 이상 방어 가능해지는가? 단지 표현이나 reasoning path가 여러 개라는 뜻은 아니다.", "결정적인 조건의 누락 때문에 서로 양립할 수 없는 결론이나 root cause가 둘 이상 주어진 조건에서 방어 가능하다.", "결정적인 조건이 충분해 하나의 결론이나 root cause가 방어 가능하다."),
          answer_explanation_conflict: noul("state의 expected answer와 explanation이 실질적으로 서로 충돌하는가?", "정답과 해설이 함께 참일 수 없다.", "정답과 해설이 양립한다."),
          linked_concept_misalignment: noul("state에 제공된 linked Concept의 title/summary가 표현하는 학습 초점과 Question이 어긋나는가?", "질문이 제공된 linked Concept의 title/summary가 표현하는 핵심 초점을 평가하지 않는다.", "질문이 제공된 linked Concept의 title/summary가 표현하는 초점을 평가한다."),
          response_shape_mismatch: noul("state의 questionType이 요구하는 답변 형태와 prompt가 요구하는 답변 형태가 맞지 않는가?", "Question type과 요구 답변 형태가 맞지 않는다.", "Question type과 요구 답변 형태가 맞는다."),
          ...(includeWeakDistractor ? { weak_distractor: noul("state가 MULTIPLE_CHOICE라면 distractor가 지나치게 무관하거나 정답을 노출할 정도로 약한가?", "하나 이상의 distractor가 같은 주제의 plausible misconception이 아니다.", "distractor가 같은 주제의 plausible misconception이다.") } : {}),
          difficulty_fit: { type: "choice", instructions: "state의 Question이 요구하는 reasoning depth와 declared difficulty의 관계는 무엇인가?", criteria: { TOO_EASY: "required reasoning보다 declared difficulty가 낮다.", APPROPRIATE: "required reasoning과 declared difficulty가 맞는다.", TOO_HARD: "required reasoning보다 declared difficulty가 높다." } },
        }
      : {
          material_technical_error: noul("Does the Question state a material technical error that could mislead a learner?", "A fact, contract, or runtime meaning is materially wrong.", "There is no material technical error."),
          multiple_defensible_answers: noul("Does the Question omit a decisive condition such that materially incompatible conclusions or root causes are both defensible? This is not about different wording or reasoning paths.", "An omitted decisive condition makes materially incompatible conclusions or root causes defensible under the stated conditions.", "The decisive conditions are sufficient for one defensible conclusion or root cause."),
          answer_explanation_conflict: noul("Do the expected answer and explanation in the state materially conflict?", "The answer and explanation cannot both be correct.", "The answer and explanation are compatible."),
          linked_concept_misalignment: noul("Does the Question fail to assess the learning focus expressed by the linked Concept title and summary supplied in the state?", "The Question misses the core focus expressed by the supplied linked Concept title and summary.", "The Question assesses the focus expressed by the supplied linked Concept title and summary."),
          response_shape_mismatch: noul("Does the prompt demand a response shape that does not match the state's questionType?", "The question type and required answer shape do not match.", "The question type and required answer shape match."),
          ...(includeWeakDistractor ? { weak_distractor: noul("If the state is MULTIPLE_CHOICE, is any distractor irrelevant or so weak that it exposes the answer?", "At least one distractor is not a plausible misconception from the same topic.", "The distractors are plausible misconceptions from the same topic.") } : {}),
          difficulty_fit: { type: "choice", instructions: "How does the reasoning depth required by the Question in the state relate to its declared difficulty?", criteria: { TOO_EASY: "The declared difficulty is below the required reasoning.", APPROPRIATE: "The declared difficulty matches the required reasoning.", TOO_HARD: "The declared difficulty is above the required reasoning." } },
        }
    : korean
      ? {
          material_technical_error: noul("state의 Concept에 학습자를 오도할 material technical error가 있는가?", "사실·계약·runtime 의미가 실질적으로 틀렸다.", "material technical error가 없다."),
          layer_boundary_confusion: noul("state의 Concept가 specification, framework, runtime, DB, OS, network boundary를 잘못 섞는가?", "서로 다른 책임 계층의 보장을 잘못 섞는다.", "계층의 책임 경계를 올바르게 구분한다."),
          learning_objective_gap: noul("state의 Concept가 declared learning objective를 달성하는 데 중요한 설명을 빠뜨리는가?", "목표 달성에 필요한 핵심 설명이 빠졌다.", "목표 달성에 필요한 설명이 있다."),
          causal_or_state_flow_gap: noul("state의 Concept에 필요한 causal, state, execution flow가 빠져 오해를 만들 위험이 있는가?", "원인·상태 전이·실행 흐름의 누락이 오해를 만든다.", "필요한 원인·상태 전이·실행 흐름이 설명되어 있다."),
        }
      : {
          material_technical_error: noul("Does the Concept contain a material technical error that could mislead a learner?", "A fact, contract, or runtime meaning is materially wrong.", "There is no material technical error."),
          layer_boundary_confusion: noul("Does the Concept incorrectly mix specification, framework, runtime, database, operating-system, or network boundaries?", "It attributes a guarantee to the wrong responsibility layer.", "It distinguishes the responsibility layers correctly."),
          learning_objective_gap: noul("Does the Concept omit an important explanation needed to achieve its declared learning objective?", "A core explanation needed for the objective is missing.", "The explanation needed for the objective is present."),
          causal_or_state_flow_gap: noul("Does the Concept omit a causal, state, or execution flow in a way that risks misunderstanding?", "Missing cause, state transition, or execution flow creates a material misunderstanding risk.", "The needed cause, state transition, or execution flow is explained."),
        };

  return { version: RUBRIC_VERSION, kind, language, questions };
}
export function allRubricDefinitions(): RubricDefinition[] {
  return [
    buildRubric("QUESTION", "ko"),
    buildRubric("QUESTION", "en"),
    buildRubric("CONCEPT", "ko"),
    buildRubric("CONCEPT", "en"),
  ];
}
