import { Link } from "react-router"
import TopBar from "@/components/navigation/TopBar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  return (
    <>
      <TopBar left="back" />
      <div className="px-5 pt-6">
        <h1 className="font-display text-[20px] font-medium text-ink mb-[6px]">다시 만나서 반가워요</h1>
        <p className="text-[11px] text-sepia leading-relaxed mb-7">이메일과 비밀번호를 입력해주세요.</p>

        <div className="space-y-[10px]">
          <div>
            <Label htmlFor="email">이메일</Label>
            <Input id="email" type="email" placeholder="user@email.com" />
          </div>
          <div>
            <Label htmlFor="password">비밀번호</Label>
            <Input id="password" type="password" placeholder="••••••••" />
          </div>
        </div>

        <div className="text-right mt-2 mb-6">
          <span className="text-[11px] text-sepia cursor-pointer hover:text-ink transition-colors">비밀번호를 잊으셨나요?</span>
        </div>

        <Button className="w-full">로그인</Button>

        <div className="h-4" />

        <Button asChild variant="ghost" className="w-full text-center text-[11px]">
          <Link to="/signup">
            계정이 없나요? <strong className="text-ink ml-1">회원가입</strong>
          </Link>
        </Button>
      </div>
    </>
  )
}
