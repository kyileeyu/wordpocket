import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import TopBar from "@/components/navigation/TopBar"
import PageContent from "@/components/layouts/PageContent"

const SUPPORT_EMAIL = "nullandflow@gmail.com"

export default function SupportPage() {
  return (
    <>
      <TopBar title="고객 지원" />
      <PageContent>
        <div className="space-y-2">
          <h1 className="display-xl text-primary">도움이 필요하신가요?</h1>
          <p className="body-md text-secondary">
            다외워봄 이용 중 궁금한 점이나 문제가 있으시면 언제든지 문의해 주세요.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="display-md text-primary">자주 묻는 질문</h2>

          <div className="rounded-[20px] bg-elevated p-5 shadow-soft space-y-4">
            <FaqItem
              question="단어장은 어떻게 만드나요?"
              answer="홈 화면에서 + 버튼을 눌러 새 폴더나 덱을 만들 수 있습니다. 덱 안에서 단어를 추가하거나 CSV 파일로 한꺼번에 가져올 수도 있어요."
            />
            <hr className="border-border-subtle" />
            <FaqItem
              question="학습 진도는 어떻게 확인하나요?"
              answer="하단 네비게이션의 통계 탭에서 학습 현황과 진도를 확인할 수 있습니다."
            />
            <hr className="border-border-subtle" />
            <FaqItem
              question="데이터가 사라졌어요"
              answer="로그인한 계정을 확인해 주세요. 모든 데이터는 계정에 연동되어 클라우드에 안전하게 저장됩니다."
            />
            <hr className="border-border-subtle" />
            <FaqItem
              question="계정을 삭제하고 싶어요"
              answer="설정 화면에서 계정 삭제를 요청하거나, 아래 이메일로 문의해 주세요."
            />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="display-md text-primary">문의하기</h2>

          <div className="rounded-[20px] bg-elevated p-5 shadow-soft space-y-3">
            <p className="body-md text-secondary">
              아래 이메일로 문의해 주시면 빠르게 답변드리겠습니다.
            </p>
            <Button
              variant="solid"
              size="lg"
              className="w-full"
              asChild
            >
              <a href={`mailto:${SUPPORT_EMAIL}`}>
                <Mail className="size-[18px]" />
                {SUPPORT_EMAIL}
              </a>
            </Button>
          </div>
        </div>

        <p className="caption text-tertiary text-center pb-8">
          &copy; 2026 다외워봄. All rights reserved.
        </p>
      </PageContent>
    </>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="space-y-1">
      <h3 className="body-sm text-primary">{question}</h3>
      <p className="body-md text-secondary">{answer}</p>
    </div>
  )
}
