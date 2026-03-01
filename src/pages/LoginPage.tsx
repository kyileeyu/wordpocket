import { useState } from "react"
import { Link, useNavigate } from "react-router"
import TopBar from "@/components/navigation/TopBar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/stores/authStore"

export default function LoginPage() {
  const navigate = useNavigate()
  const { signIn, loading } = useAuthStore()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const { error } = await signIn(email, password)
    if (error) {
      setError(error)
    } else {
      navigate("/", { replace: true })
    }
  }

  return (
    <>
      <TopBar left="back" />
      <form onSubmit={handleSubmit} className="px-5 pt-6">
        <h1 className="typo-display-md text-text-primary mb-[6px]">다시 만나서 반가워요</h1>
        <p className="typo-caption text-text-secondary mb-7">이메일과 비밀번호를 입력해주세요.</p>

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
              placeholder="user@email.com"
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="text-right mt-2 mb-6">
          <span className="typo-caption text-text-secondary cursor-pointer hover:text-text-primary transition-colors">비밀번호를 잊으셨나요?</span>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "로그인 중..." : "로그인"}
        </Button>

        <div className="h-4" />

        <Button asChild variant="ghost" className="w-full text-center text-[length:var(--font-size-caption)]">
          <Link to="/signup">
            계정이 없나요? <strong className="text-accent ml-1">회원가입</strong>
          </Link>
        </Button>
      </form>
    </>
  )
}
