import { MarkdownContent } from './MarkdownContent'

export interface ChoiceWithRationale {
  choiceKey: string
  contentMarkdown: string
  rationaleMarkdown: string | null
}

export function ChoiceRationale({
  rationaleMarkdown,
  label,
}: {
  rationaleMarkdown: string | null
  label: string
}) {
  if (!rationaleMarkdown?.trim()) return null

  return (
    <div className="choice-rationale">
      <span>{label}</span>
      <MarkdownContent>{rationaleMarkdown}</MarkdownContent>
    </div>
  )
}

export function OtherChoiceRationales({
  choices,
  excludedChoiceKeys,
}: {
  choices: ChoiceWithRationale[]
  excludedChoiceKeys: string[]
}) {
  const excluded = new Set(excludedChoiceKeys)
  const otherChoices = choices.filter((choice) => !excluded.has(choice.choiceKey) && choice.rationaleMarkdown?.trim())

  if (otherChoices.length === 0) return null

  return (
    <details className="choice-rationale-disclosure">
      <summary>나머지 선택지 이유 보기 · {otherChoices.length}개</summary>
      <div className="other-choice-rationale-list">
        {otherChoices.map((choice) => (
          <article className="other-choice-rationale" key={choice.choiceKey}>
            <strong>선택지 {choice.choiceKey}</strong>
            <MarkdownContent>{choice.contentMarkdown}</MarkdownContent>
            <ChoiceRationale rationaleMarkdown={choice.rationaleMarkdown} label="이 선택지의 이유" />
          </article>
        ))}
      </div>
    </details>
  )
}
