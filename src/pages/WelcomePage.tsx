import { Link } from "react-router"
import { Button } from "@/components/ui/button"

export default function WelcomePage() {
  return (
    <div className="flex-1 flex flex-col justify-center px-7">
      <div className="text-center mb-12">
        <h1 className="font-display text-[32px] font-medium text-ink mb-1">WordPocket</h1>
        <p className="text-[13px] text-sepia leading-relaxed">
          단어를 주머니에 넣듯,<br />매일 조금씩 꺼내 익히세요.
        </p>
      </div>
      <div className="space-y-[10px]">
        <Button asChild className="w-full">
          <Link to="/signup">시작하기</Link>
        </Button>
        <Button asChild variant="ghost" className="w-full text-center text-[11px]">
          <Link to="/login">
            이미 계정이 있나요? <strong className="text-ink ml-1">로그인</strong>
          </Link>
        </Button>
      </div>
      <div className="h-5" />
    </div>
  )
}
