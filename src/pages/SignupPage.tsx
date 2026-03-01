import { useState } from "react"
import { useNavigate } from "react-router"
import TopBar from "@/components/navigation/TopBar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/stores/authStore"

export default function SignupPage() {
  const navigate = useNavigate()
  const { signUp, loading } = useAuthStore()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)

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

    const { error } = await signUp(email, password)
    if (error) {
      setError(error)
    } else {
      navigate("/verify", { state: { email }, replace: true })
    }
  }

  return (
    <>
      <TopBar left="back" />
      <form onSubmit={handleSubmit} className="px-7 pt-7">
        <h1 className="typo-display-xl text-text-primary mb-[6px]">시작해볼까요</h1>
        <p className="typo-caption text-text-secondary mb-7">간단한 가입으로 바로 학습을 시작하세요.</p>

        {error && (
          <div className="bg-danger-bg text-danger typo-caption px-3 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="space-y-[10px]">
          <div>
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="8자 이상"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
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

        <div className="h-4" />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "가입 중..." : "가입하기"}
        </Button>

        <div className="h-4" />

        <p className="typo-mono-sm text-text-tertiary text-center">
          가입 시 <span className="underline cursor-pointer">이용약관</span> 및 <span className="underline cursor-pointer">개인정보처리방침</span>에<br />동의하는 것으로 간주합니다.
        </p>
      </form>
    </>
  )
}
