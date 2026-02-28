import { Link } from "react-router"
import TopBar from "@/components/navigation/TopBar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignupPage() {
  return (
    <>
      <TopBar left="back" />
      <div className="px-5 pt-6">
        <h1 className="font-display text-[20px] font-medium text-ink mb-[6px]">시작해볼까요</h1>
        <p className="text-[11px] text-sepia leading-relaxed mb-7">간단한 가입으로 바로 학습을 시작하세요.</p>

        <div className="space-y-[10px]">
          <div>
            <Label htmlFor="email">이메일</Label>
            <Input id="email" type="email" placeholder="your@email.com" />
          </div>
          <div>
            <Label htmlFor="password">비밀번호</Label>
            <Input id="password" type="password" placeholder="8자 이상" />
          </div>
          <div>
            <Label htmlFor="password-confirm">비밀번호 확인</Label>
            <Input id="password-confirm" type="password" placeholder="다시 한번 입력" />
          </div>
        </div>

        <div className="h-4" />

        <Button asChild className="w-full">
          <Link to="/verify">가입하기</Link>
        </Button>

        <div className="h-4" />

        <p className="text-[10px] text-dust text-center leading-relaxed">
          가입 시 <span className="underline cursor-pointer">이용약관</span> 및 <span className="underline cursor-pointer">개인정보처리방침</span>에<br />동의하는 것으로 간주합니다.
        </p>
      </div>
    </>
  )
}
