/** Compare only valid release identities; local and offline builds must not report false drift. */
const shaPattern = /^[0-9a-f]{40}$/i

export function isReleaseMismatch(clientSha: string, response: unknown): boolean {
  if (!shaPattern.test(clientSha) || !response || typeof response !== 'object') return false
  const remoteSha = (response as { sourceSha?: unknown }).sourceSha
  return typeof remoteSha === 'string'
    && shaPattern.test(remoteSha)
    && remoteSha.toLowerCase() !== clientSha.toLowerCase()
}
