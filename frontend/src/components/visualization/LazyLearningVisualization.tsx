import { Suspense, lazy } from 'react'

const LearningVisualizationImpl = lazy(() =>
  import('./LearningVisualization').then((module) => ({ default: module.LearningVisualization })),
)

/** 프로덕션 번들에서 시각화 카탈로그를 지연 로딩하여 퀴즈·오답노트 등의 초기 번들 크기를 줄인다. */
export function LearningVisualization({ source }: { source: string }) {
  return (
    <Suspense fallback={<div className="diagram-fallback" role="status">학습 도식을 불러오는 중…</div>}>
      <LearningVisualizationImpl source={source} />
    </Suspense>
  )
}
