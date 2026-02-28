import { Outlet } from "react-router"
import BottomNav from "@/components/navigation/BottomNav"

export default function AppShell() {
  return (
    <div className="min-h-dvh bg-canvas flex justify-center">
      <div className="w-full max-w-[480px] sm:max-w-[640px] lg:max-w-[768px] bg-parchment min-h-dvh flex flex-col relative">
        <div className="flex-1 pb-[72px] overflow-y-auto sm:px-2 lg:px-4">
          <Outlet />
        </div>
        <BottomNav />
      </div>
    </div>
  )
}
