import { Button } from "@/components/ui/button"

export default function VerifyPage() {
  return (
    <div className="flex-1 flex flex-col justify-center px-7 text-center">
      <div className="text-[48px] mb-4">✉️</div>
      <h1 className="font-display text-[20px] font-medium text-ink mb-2">메일을 확인해주세요</h1>
      <p className="text-[11px] text-sepia mb-[6px]">인증 링크를 보냈습니다.</p>
      <p className="font-mono text-[12px] text-ink mb-8">user@email.com</p>

      <Button variant="secondary" className="w-full mb-3">인증 메일 재전송</Button>
      <Button variant="ghost" className="w-full text-[11px]">다른 이메일로 가입</Button>

      <div className="h-5" />
    </div>
  )
}
