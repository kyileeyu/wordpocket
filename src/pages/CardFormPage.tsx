import TopBar from "@/components/navigation/TopBar"
import CardForm from "@/components/forms/CardForm"

export default function CardFormPage() {
  return (
    <>
      <TopBar
        left="close"
        title="카드 추가"
        right={
          <span className="text-[11px] text-moss font-semibold cursor-pointer">저장</span>
        }
      />
      <CardForm showToast />
    </>
  )
}
