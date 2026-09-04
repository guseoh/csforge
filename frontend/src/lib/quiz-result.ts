/** Quiz 결과 화면에서 자기채점 후속 조치가 필요한지 판단한다. */
export function hasUnresolvedSelfCheck(selfCheckPending: number) {
  return selfCheckPending > 0
}
