export interface InterviewQuestion {
  question: string
  answerMarkdown: string
}

export interface InterviewSection {
  title: string
  questions: InterviewQuestion[]
}

export interface InterviewExtraction {
  bodyMarkdown: string
  interview: InterviewSection | null
}

const INTERVIEW_HEADING = /^###\s+면접에서 이렇게 나옵니다\s*$/
const QUESTION_HEADING = /^####\s+Q\.\s+(.+?)\s*$/
const MAJOR_SECTION_HEADING = /^#{1,3}\s+/

/**
 * Canonical Concept Markdown의 선택적 면접 회상 섹션을 안전한 구조로 분리한다.
 *
 * raw HTML을 허용하지 않고 `### 면접에서 이렇게 나옵니다`와 `#### Q. ...` 규약만 해석한다.
 * 규약이 불완전하면 원문을 숨기지 않고 그대로 본문에 남긴다.
 */
export function extractInterviewSection(markdown: string): InterviewExtraction {
  const normalized = markdown.replace(/\r\n?/g, '\n')
  const lines = normalized.split('\n')
  const sectionStart = lines.findIndex((line) => INTERVIEW_HEADING.test(line))

  if (sectionStart < 0) {
    return { bodyMarkdown: normalized, interview: null }
  }

  let sectionEnd = lines.length
  for (let index = sectionStart + 1; index < lines.length; index += 1) {
    if (MAJOR_SECTION_HEADING.test(lines[index])) {
      sectionEnd = index
      break
    }
  }

  const sectionLines = lines.slice(sectionStart + 1, sectionEnd)
  const questionStarts = sectionLines
    .map((line, index) => ({ match: line.match(QUESTION_HEADING), index }))
    .filter((entry): entry is { match: RegExpMatchArray; index: number } => entry.match !== null)

  if (questionStarts.length === 0) {
    return { bodyMarkdown: normalized, interview: null }
  }

  const questions: InterviewQuestion[] = questionStarts.map((entry, questionIndex) => {
    const nextStart = questionStarts[questionIndex + 1]?.index ?? sectionLines.length
    return {
      question: entry.match[1].trim(),
      answerMarkdown: sectionLines.slice(entry.index + 1, nextStart).join('\n').trim(),
    }
  })

  if (questions.some((question) => !question.answerMarkdown)) {
    return { bodyMarkdown: normalized, interview: null }
  }

  const bodyMarkdown = [
    ...lines.slice(0, sectionStart),
    ...lines.slice(sectionEnd),
  ].join('\n').replace(/\n{3,}/g, '\n\n').trim()

  return {
    bodyMarkdown,
    interview: {
      title: '면접에서 이렇게 나옵니다',
      questions,
    },
  }
}
