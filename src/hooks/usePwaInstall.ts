import { usePwaStore } from "@/stores/pwaStore"

export function usePwaInstall() {
  const deferredPrompt = usePwaStore((s) => s.deferredPrompt)
  const isInstalled = usePwaStore((s) => s.isInstalled)
  const isDismissed = usePwaStore((s) => s.isDismissed)
  const platform = usePwaStore((s) => s.platform)
  const triggerInstall = usePwaStore((s) => s.triggerInstall)
  const dismiss = usePwaStore((s) => s.dismiss)

  const canShow =
    !isInstalled &&
    !isDismissed &&
    (deferredPrompt !== null || platform === "ios")

  return { canShow, platform, triggerInstall, dismiss }
}
