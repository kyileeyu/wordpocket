import { useNavigate } from "react-router"
import { Label } from "@/components/ui/label"
import { SettingsRow } from "@/components/forms"
import { useAuthStore } from "@/stores/authStore"

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuthStore()

  const handleSignOut = async () => {
    await signOut()
    navigate("/welcome", { replace: true })
  }

  return (
    <div>
      {/* Header */}
      <div className="px-5 pt-3">
        <h1 className="font-display text-[20px] font-medium text-text-primary mb-1">설정</h1>
        <p className="text-[11px] text-text-secondary mb-1">{user?.email ?? ""}</p>
      </div>

      {/* Learning Section */}
      <div className="px-5 mt-4">
        <Label>학습</Label>
        <SettingsRow label="하루 새 카드 수" description="기본 20장" value={20} />
        <SettingsRow label="역방향 카드 자동 생성" toggle toggleOn />
        <SettingsRow label="리치 임계값" description="Again 반복 시 알림" value={5} />
        <SettingsRow label="최대 복습 간격" description="이 이상 간격이 벌어지지 않음" value={365} />
      </div>

      {/* Notification Section */}
      <div className="px-5 mt-4">
        <Label>알림</Label>
        <SettingsRow label="일일 복습 리마인더" value="09:00" />
      </div>

      {/* Account Section */}
      <div className="px-5 mt-4">
        <Label>계정</Label>
        <SettingsRow label="비밀번호 변경" chevron />
        <SettingsRow label="로그아웃" danger noBorder onPress={handleSignOut} />
      </div>
    </div>
  )
}
