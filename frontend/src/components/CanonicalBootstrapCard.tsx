import { Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { defaultLearningSearch } from '../lib/learning-search'
import { bootstrapCanonicalContent, getCanonicalBootstrapStatus } from '../lib/api'

interface CanonicalBootstrapCardProps {
  readyAction?: 'hide' | 'learning-link'
}

export function CanonicalBootstrapCard({ readyAction = 'hide' }: CanonicalBootstrapCardProps) {
  const queryClient = useQueryClient()
  const statusQuery = useQuery({ queryKey: ['canonical-bootstrap-status'], queryFn: getCanonicalBootstrapStatus })
  const bootstrapMutation = useMutation({
    mutationFn: bootstrapCanonicalContent,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['canonical-bootstrap-status'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      void queryClient.invalidateQueries({ queryKey: ['learning-areas'] })
      void queryClient.invalidateQueries({ queryKey: ['concepts'] })
      void queryClient.invalidateQueries({ queryKey: ['quiz-availability'] })
    },
  })

  if (statusQuery.isPending) {
    return <div className="canonical-bootstrap-card state-card" aria-busy="true"><strong>기본 학습 콘텐츠 상태 확인 중…</strong></div>
  }

  if (statusQuery.isError) {
    return <div className="canonical-bootstrap-card state-card error-state" role="alert"><strong>기본 학습 콘텐츠 상태를 확인하지 못했습니다.</strong><button className="secondary-button" type="button" onClick={() => void statusQuery.refetch()}>다시 시도</button></div>
  }

  if (bootstrapMutation.data?.success) {
    return <div className="canonical-bootstrap-card state-card"><strong>기본 학습 콘텐츠가 준비되었습니다.</strong><span>{bootstrapMutation.data.totals.created + bootstrapMutation.data.totals.updated}개를 저장했습니다. 이제 Learning에서 시작할 수 있습니다.</span><Link className="primary-button" to="/learning" search={defaultLearningSearch}>Learning 시작</Link></div>
  }

  if (bootstrapMutation.isError || bootstrapMutation.data?.success === false) {
    return <div className="canonical-bootstrap-card state-card error-state" role="alert"><strong>기본 학습 콘텐츠를 준비하지 못했습니다.</strong><span>완료된 batch는 유지됩니다. 다시 시도하면 남은 내용을 이어서 확인합니다.</span><button className="secondary-button" type="button" disabled={bootstrapMutation.isPending} onClick={() => bootstrapMutation.mutate()}>{bootstrapMutation.isPending ? '다시 준비 중…' : '다시 시도'}</button></div>
  }

  if (!statusQuery.data) return null
  if (statusQuery.data.state === 'READY') {
    return readyAction === 'learning-link' ? <Link className="primary-button" to="/learning" search={defaultLearningSearch}>Learning 시작</Link> : null
  }

  return <div className="canonical-bootstrap-card state-card"><strong>기본 학습 콘텐츠가 아직 준비되지 않았습니다.</strong><span>{statusQuery.data.state === 'PARTIAL' ? '일부 콘텐츠가 준비되어 있습니다. 계속 진행하세요.' : '처음 한 번만 실행하면 Concept와 Question을 사용할 수 있습니다.'}</span><button className="primary-button" type="button" disabled={bootstrapMutation.isPending} onClick={() => bootstrapMutation.mutate()}>{bootstrapMutation.isPending ? '기본 학습 콘텐츠 준비 중…' : '기본 학습 콘텐츠 준비'}</button></div>
}
