import { useState } from "react"
import { useNavigate } from "react-router"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SettingsRow } from "@/components/forms"
import { useAuthStore } from "@/stores/authStore"
import { useUserSettings, useUpdateUserSettings } from "@/hooks/useUserSettings"
import PageContent from "@/components/layouts/PageContent"

type EditField = "new_cards_per_day" | "leech_threshold" | "max_interval"

const FIELD_CONFIG: Record<EditField, { label: string; min: number; max: number }> = {
  new_cards_per_day: { label: "하루 새 카드 수", min: 1, max: 9999 },
  leech_threshold: { label: "리치 임계값", min: 2, max: 99 },
  max_interval: { label: "최대 복습 간격", min: 1, max: 3650 },
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuthStore()
  const { data: settings } = useUserSettings()
  const updateSettings = useUpdateUserSettings()

  const [editField, setEditField] = useState<EditField | null>(null)
  const [editValue, setEditValue] = useState("")

  const openEdit = (field: EditField) => {
    setEditField(field)
    setEditValue(String(settings?.[field] ?? ""))
  }

  const handleSave = () => {
    if (!editField) return
    const config = FIELD_CONFIG[editField]
    const num = parseInt(editValue, 10)
    if (isNaN(num) || num < config.min || num > config.max) return
    updateSettings.mutate({ [editField]: num })
    setEditField(null)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate("/welcome", { replace: true })
  }

  return (
    <PageContent>
      {/* Header */}
      <div>
        <h1 className="typo-display-xl text-text-primary mb-1">설정</h1>
        <p className="typo-caption text-text-secondary mb-1">{user?.email ?? ""}</p>
      </div>

      {/* Learning Section */}
      <div>
        <Label>학습</Label>
        <SettingsRow
          label="하루 새 카드 수"
          value={settings?.new_cards_per_day ?? 20}
          onPress={() => openEdit("new_cards_per_day")}
        />
        <SettingsRow label="역방향 카드 자동 생성" toggle toggleOn />
        <SettingsRow
          label="리치 임계값"
          description="Again 반복 시 알림"
          value={settings?.leech_threshold ?? 5}
          onPress={() => openEdit("leech_threshold")}
        />
        <SettingsRow
          label="최대 복습 간격"
          description="이 이상 간격이 벌어지지 않음"
          value={`${settings?.max_interval ?? 365}일`}
          onPress={() => openEdit("max_interval")}
        />
      </div>

      {/* Notification Section */}
      <div>
        <Label>알림</Label>
        <SettingsRow label="일일 복습 리마인더" value="09:00" />
      </div>

      {/* Account Section */}
      <div>
        <Label>계정</Label>
        <SettingsRow label="비밀번호 변경" chevron />
        <SettingsRow label="로그아웃" danger noBorder onPress={handleSignOut} />
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editField} onOpenChange={(open) => !open && setEditField(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editField && FIELD_CONFIG[editField].label}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <Input
              type="number"
              inputMode="numeric"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              min={editField ? FIELD_CONFIG[editField].min : undefined}
              max={editField ? FIELD_CONFIG[editField].max : undefined}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
            <Button className="w-full" onClick={handleSave} disabled={updateSettings.isPending}>
              저장
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageContent>
  )
}
