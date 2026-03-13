import { useState } from "react"
import { Link } from "react-router"
import TopBar from "@/components/navigation/TopBar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import PageContent from "@/components/layouts/PageContent"
import { useAuthStore } from "@/stores/authStore"

export default function ForgotPasswordPage() {
  const { resetPassword, loading } = useAuthStore()

  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const { error } = await resetPassword(email)
    if (error) {
      setError(error)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="flex-1 flex flex-col justify-center px-8 text-center">
        <div className="text-[48px] mb-4">✉️</div>
        <h1 className="typo-display-xl text-text-primary mb-2">메일을 확인해주세요</h1>
        <p className="typo-caption text-text-secondary mb-[6px]">비밀번호 재설정 링크를 보냈습니다.</p>
        <p className="typo-mono-md text-text-primary mb-8">{email}</p>

        <Button asChild variant="ghost" className="w-full text-[length:var(--font-size-caption)]">
          <Link to="/login">로그인으로 돌아가기</Link>
        </Button>

        <div className="h-5" />
      </div>
    )
  }

  return (
    <>
      <TopBar left="back" />
      <form onSubmit={handleSubmit}>
        <PageContent>
          <div>
            <h1 className="typo-display-xl text-text-primary mb-[6px]">비밀번호 재설정</h1>
            <p className="typo-caption text-text-secondary">가입한 이메일을 입력하면 재설정 링크를 보내드립니다.</p>
          </div>

          {error && (
            <div className="bg-danger-bg text-danger typo-caption px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "전송 중..." : "재설정 링크 보내기"}
          </Button>

          <Button asChild variant="ghost" className="w-full text-[length:var(--font-size-caption)]">
            <Link to="/login">로그인으로 돌아가기</Link>
          </Button>
        </PageContent>
      </form>
    </>
  )
}
