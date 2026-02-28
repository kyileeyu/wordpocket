import { Outlet } from "react-router"

export default function AuthShell() {
  return (
    <div className="min-h-dvh bg-canvas flex justify-center">
      <div className="w-full max-w-[480px] sm:max-w-[640px] lg:max-w-[768px] bg-parchment min-h-dvh flex flex-col">
        <Outlet />
      </div>
    </div>
  )
}
