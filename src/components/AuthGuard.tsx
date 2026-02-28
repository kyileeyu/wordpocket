import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '@/stores/authStore';

/** 인증된 사용자만 접근 가능한 라우트를 보호한다. */
export default function AuthGuard() {
  const { user, initialized } = useAuthStore();

  if (!initialized) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-bg-primary">
        <div className="text-text-secondary text-sm">로딩 중...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/welcome" replace />;
  }

  return <Outlet />;
}
