import { useCallback, useRef } from 'react'

/** 같은 생성 요청의 재시도에는 같은 서버 키를 유지한다. */
export function useIdempotencyKey() {
  const currentRequest = useRef<{ signature: string; key: string } | null>(null)

  const requestIdFor = useCallback((signature: unknown) => {
    const serializedSignature = JSON.stringify(signature) ?? String(signature)
    if (currentRequest.current?.signature !== serializedSignature) {
      currentRequest.current = { signature: serializedSignature, key: crypto.randomUUID() }
    }
    return currentRequest.current.key
  }, [])

  const clear = useCallback(() => {
    currentRequest.current = null
  }, [])

  return { requestIdFor, clear }
}
