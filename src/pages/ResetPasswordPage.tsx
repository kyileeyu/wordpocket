import { useState } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import TopBar from "@/components/navigation/TopBar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import PageContent from "@/components/layouts/PageContent"
import { useAuthStore } from "@/stores/authStore"

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const { updatePassword, loading, session, initialized } = useAuthStore()

  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)

  if (!initialized) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-bg-primary">
        <div className="text-text-secondary text-sm">로딩 중...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <>
        <TopBar />
        <PageContent>
          <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
            <p className="typo-caption text-text-secondary mb-4">유효하지 않거나 만료된 링크입니다.</p>
            <Button variant="secondary" onClick={() => navigate("/forgot-password", { replace: true })}>
              비밀번호 재설정 다시 요청
            </Button>
          </div>
        </PageContent>
      </>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.")
      return
    }
    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.")
      return
    }

    const { error } = await updatePassword(password)
    if (error) {
      setError(error)
    } else {
      toast.success("비밀번호가 변경되었습니다")
      navigate("/", { replace: true })
    }
  }

  return (
    <>
      <TopBar />
      <form onSubmit={handleSubmit}>
        <PageContent>
          <div>
            <h1 className="typo-display-xl text-text-primary mb-[6px]">새 비밀번호 설정</h1>
            <p className="typo-caption text-text-secondary">새로운 비밀번호를 입력해주세요.</p>
          </div>

          {error && (
            <div className="bg-danger-bg text-danger typo-caption px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-[10px]">
            <div>
              <Label htmlFor="password">새 비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="8자 이상"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="password-confirm">비밀번호 확인</Label>
              <Input
                id="password-confirm"
                type="password"
                placeholder="다시 한번 입력"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
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
