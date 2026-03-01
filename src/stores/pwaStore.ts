import { create } from "zustand"

type Platform = "chromium" | "ios" | "other"

interface PwaState {
  deferredPrompt: BeforeInstallPromptEvent | null
  isInstalled: boolean
  isDismissed: boolean
  platform: Platform
  initialize: () => void
  triggerInstall: () => Promise<void>
  dismiss: () => void
}

function detectPlatform(): Platform {
  const ua = navigator.userAgent
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  if (isIOS) return "ios"

  // Chromium-based browsers support beforeinstallprompt
  if (/Chrome|Edg|Samsung|Opera/.test(ua) && !/Firefox/.test(ua))
    return "chromium"

  return "other"
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

const DISMISS_KEY = "wp-pwa-install-dismissed"

export const usePwaStore = create<PwaState>((set, get) => ({
  deferredPrompt: null,
  isInstalled: false,
  isDismissed: false,
  platform: "other",

  initialize: () => {
    const platform = detectPlatform()
    const installed = isStandalone()
    const dismissed = localStorage.getItem(DISMISS_KEY) === "true"

    set({ platform, isInstalled: installed, isDismissed: dismissed })

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault()
      set({ deferredPrompt: e })
    })

    window.addEventListener("appinstalled", () => {
      set({ isInstalled: true, deferredPrompt: null })
    })
  },

  triggerInstall: async () => {
    const { deferredPrompt } = get()
    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      set({ isInstalled: true, deferredPrompt: null })
    } else {
      set({ deferredPrompt: null })
    }
  },

  dismiss: () => {
    localStorage.setItem(DISMISS_KEY, "true")
    set({ isDismissed: true })
  },
}))
