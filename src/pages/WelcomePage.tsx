import { useState } from "react"
import { Link } from "react-router"
import { Download, Share } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePwaInstall } from "@/hooks/usePwaInstall"

export default function WelcomePage() {
  const { canShow, platform, triggerInstall } = usePwaInstall()
  const [showIosGuide, setShowIosGuide] = useState(false)

  const handleInstallClick = () => {
    if (platform === "ios") {
      setShowIosGuide((v) => !v)
    } else {
      triggerInstall()
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-center px-8 bg-[linear-gradient(135deg,#7C6CE7_0%,#A99BF0_50%,#D4CEFA_100%)]">
      <div className="text-center mb-12">
        <h1 className="typo-display-xl text-white mb-1">WordPocket</h1>
        <p className="typo-body-md text-white/80">
          단어를 주머니에 넣듯,<br />매일 조금씩 꺼내 익히세요.
        </p>
      </div>
      <div className="space-y-[10px]">
        {canShow && (
          <>
            <Button
              onClick={handleInstallClick}
              className="w-full border border-white text-white bg-transparent hover:bg-white/10"
            >
              <Download size={18} className="mr-1.5" />
              앱 설치하기
            </Button>
            {showIosGuide && (
              <p className="typo-caption text-white/80 text-center">
                Safari 하단의{" "}
                <Share size={14} className="inline-block align-text-bottom" />{" "}
                <strong className="text-white">공유</strong> 버튼을 누른 뒤{" "}
                <strong className="text-white">'홈 화면에 추가'</strong>를 선택하세요
              </p>
            )}
          </>
        )}
        <Button asChild className="w-full bg-white text-accent hover:bg-white/90">
          <Link to="/signup">시작하기</Link>
        </Button>
        <Button asChild variant="ghost" className="w-full text-center text-[length:var(--font-size-caption)] text-white/80 hover:text-white">
          <Link to="/login">
            이미 계정이 있나요? <strong className="text-white ml-1">로그인</strong>
          </Link>
        </Button>
      </div>
      <div className="h-5" />
    </div>
  )
}
