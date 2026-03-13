import { useState } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import TopBar from "@/components/navigation/TopBar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import PageContent from "@/components/layouts/PageContent"
import { useAuthStore } from "@/stores/authStore"
import { supabase } from "@/lib/supabase"

export default function ChangePasswordPage() {
  const navigate = useNavigate()
  const { user, updatePassword } = useAuthStore()

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newPassword.length < 8) {
      setError("새 비밀번호는 8자 이상이어야 합니다.")
      return
    }
    if (newPassword !== newPasswordConfirm) {
      setError("새 비밀번호가 일치하지 않습니다.")
      return
    }

    setLoading(true)

    // Verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user!.email!,
      password: currentPassword,
    })

    if (signInError) {
      setLoading(false)
      setError("현재 비밀번호가 올바르지 않습니다.")
      return
    }

    // Update to new password
    const { error: updateError } = await updatePassword(newPassword)
    setLoading(false)

    if (updateError) {
      setError(updateError)
    } else {
      toast.success("비밀번호가 변경되었습니다")
      navigate(-1)
    }
  }

  return (
    <>
      <TopBar left="back" />
      <form onSubmit={handleSubmit}>
        <PageContent>
          <div>
            <h1 className="typo-display-xl text-text-primary mb-[6px]">비밀번호 변경</h1>
            <p className="typo-caption text-text-secondary">현재 비밀번호를 확인한 후 변경합니다.</p>
          </div>

          {error && (
            <div className="bg-danger-bg text-danger typo-caption px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-[10px]">
            <div>
              <Label htmlFor="current-password">현재 비밀번호</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="new-password">새 비밀번호</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="8자 이상"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div>
              <Label htmlFor="new-password-confirm">새 비밀번호 확인</Label>
              <Input
                id="new-password-confirm"
                type="password"
                placeholder="다시 한번 입력"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "변경 중..." : "비밀번호 변경"}
          </Button>
        </PageContent>
      </form>
    </>
  )
}
