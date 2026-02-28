import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '@/stores/authStore';

/** 이미 로그인된 사용자는 대시보드로 리다이렉트한다. */
export default function GuestGuard() {
  const { user, initialized } = useAuthStore();

  if (!initialized) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-canvas">
        <div className="text-sepia text-sm">로딩 중...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
