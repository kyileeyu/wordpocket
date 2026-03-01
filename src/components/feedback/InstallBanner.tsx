import { Download, Share, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface InstallBannerProps {
  platform: "chromium" | "ios" | "other"
  onInstall: () => void
  onDismiss: () => void
}

export default function InstallBanner({
  platform,
  onInstall,
  onDismiss,
}: InstallBannerProps) {
  return (
    <div className="bg-bg-elevated rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-xl mt-0.5">
            {platform === "ios" ? <Share size={20} /> : <Download size={20} />}
          </span>
          <div>
            <p className="typo-body-md font-semibold text-text-primary">
              앱 설치하기
            </p>
            <p className="typo-caption text-text-secondary mt-0.5">
              홈 화면에 추가하면 더 빠르게 학습할 수 있어요
            </p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-text-secondary hover:text-text-primary p-1 -m-1"
          aria-label="닫기"
        >
          <X size={18} />
        </button>
      </div>

      {/* Action */}
      <div className="mt-4">
        {platform === "ios" ? (
          <p className="typo-caption text-text-secondary">
            Safari 하단의{" "}
            <Share size={14} className="inline-block align-text-bottom" />{" "}
            <strong>공유</strong> 버튼을 누른 뒤{" "}
            <strong>'홈 화면에 추가'</strong>를 선택하세요
          </p>
        ) : (
          <Button size="sm" onClick={onInstall} className="w-full">
            설치
          </Button>
        )}
      </div>
    </div>
  )
}
