import { NavLink } from "react-router"
import { House, BarChart2, Settings2 } from "lucide-react"

const tabs = [
  { to: "/", icon: House, label: "Home" },
  { to: "/stats", icon: BarChart2, label: "Stats" },
  { to: "/settings", icon: Settings2, label: "Settings" },
] as const

export default function BottomNav() {
  return (
    <nav className="absolute bottom-0 left-0 right-0 border-t border-border bg-parchment pb-[env(safe-area-inset-bottom)]">
      <div className="flex h-14">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-[3px] text-[9px] font-medium transition-colors ${
                isActive ? "text-ink" : "text-sepia"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
