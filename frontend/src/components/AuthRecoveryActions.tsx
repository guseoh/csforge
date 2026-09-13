import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { logout } from '../lib/auth-api'

/** 허용되지 않은 cloud 계정의 세션을 정리하고 다시 로그인할 수 있게 한다. */
export function AuthRecoveryActions() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear()
      void navigate({ to: '/login', replace: true })
    },
  })

  return (
    <div className="auth-actions">
      <button
        className="secondary-button"
        type="button"
        disabled={logoutMutation.isPending}
        onClick={() => logoutMutation.mutate()}
      >
        {logoutMutation.isPending ? '로그아웃 중…' : '현재 계정에서 로그아웃하고 다시 로그인'}
      </button>
      {logoutMutation.isError && <p className="auth-error">로그아웃하지 못했습니다. 잠시 후 다시 시도해 주세요.</p>}
    </div>
  )
}
