import { Outlet } from "react-router"
import BottomNav from "@/components/navigation/BottomNav"

export default function AppShell() {
  return (
    <div className="min-h-dvh bg-canvas flex justify-center">
      <div className="w-full max-w-[480px] bg-parchment min-h-dvh flex flex-col relative">
        <div className="flex-1 pb-[72px] overflow-y-auto">
          <Outlet />
        </div>
        <BottomNav />
      </div>
    </div>
  )
}
