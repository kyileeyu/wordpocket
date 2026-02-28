import TopBar from "@/components/navigation/TopBar"
import CardForm from "@/components/forms/CardForm"

export default function CardFormPage() {
  return (
    <div className="min-h-dvh bg-canvas flex justify-center">
      <div className="w-full max-w-[480px] bg-parchment min-h-dvh flex flex-col">
        <TopBar
          left="close"
          title="카드 추가"
          right={
            <span className="text-[11px] text-moss font-semibold cursor-pointer">저장</span>
          }
        />
        <CardForm showToast />
      </div>
    </div>
  )
}
