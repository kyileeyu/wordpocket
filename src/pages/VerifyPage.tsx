import { useState } from "react"
import { Link, useLocation } from "react-router"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/authStore"

export default function VerifyPage() {
  const location = useLocation()
  const email = (location.state as { email?: string })?.email ?? ""
  const { resendVerification, loading } = useAuthStore()
  const [sent, setSent] = useState(false)

  const handleResend = async () => {
    if (!email) return
    const { error } = await resendVerification(email)
    if (!error) setSent(true)
  }

  return (
    <div className="flex-1 flex flex-col justify-center px-7 text-center">
      <div className="text-[48px] mb-4">✉️</div>
      <h1 className="font-display text-[20px] font-medium text-ink mb-2">메일을 확인해주세요</h1>
      <p className="text-[11px] text-sepia mb-[6px]">인증 링크를 보냈습니다.</p>
      <p className="font-mono text-[12px] text-ink mb-8">{email || "your@email.com"}</p>

      <Button
        variant="secondary"
        className="w-full mb-3"
        onClick={handleResend}
        disabled={loading || sent}
      >
        {sent ? "메일을 확인해주세요" : "인증 메일 재전송"}
      </Button>
      <Button asChild variant="ghost" className="w-full text-[11px]">
        <Link to="/signup">다른 이메일로 가입</Link>
      </Button>

      <div className="h-5" />
    </div>
  )
}
