import type { WrongAnswerAnalysisStatus } from './api'

export function wrongAnswerAnalysisPollingInterval(status: WrongAnswerAnalysisStatus | undefined): number | false {
  return status === 'PENDING' || status === 'PROCESSING' ? 2000 : false
}
