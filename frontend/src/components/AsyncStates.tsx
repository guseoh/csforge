export function PageSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="skeleton-stack" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, index) => (
        <div className="skeleton-block" key={index} />
      ))}
    </div>
  )
}

export function ErrorState({ message = '데이터를 불러오지 못했습니다.', onRetry }: { message?: string; onRetry: () => void }) {
  return (
    <div className="state-card error-state" role="alert">
      <strong>{message}</strong>
      <button className="secondary-button" type="button" onClick={onRetry}>
        다시 시도
      </button>
    </div>
  )
}

export function EmptyState({ message }: { message: string }) {
  return <div className="state-card">{message}</div>
}
