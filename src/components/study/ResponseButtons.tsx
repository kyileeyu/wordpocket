const responses = [
  { label: "Again", time: "< 1분", bg: "bg-brick-bg", text: "text-brick" },
  { label: "Hard", time: "6분", bg: "bg-oak-bg", text: "text-oak" },
  { label: "Good", time: "10분", bg: "bg-moss-bg", text: "text-moss" },
  { label: "Easy", time: "4일", bg: "bg-slate-bg", text: "text-slate" },
] as const

interface ResponseButtonsProps {
  onResponse?: (response: string) => void
}

export default function ResponseButtons({ onResponse }: ResponseButtonsProps) {
  return (
    <div className="flex gap-[6px] px-5">
      {responses.map(({ label, time, bg, text }) => (
        <button
          key={label}
          className={`flex-1 rounded-[10px] py-[10px] px-1 text-center ${bg} ${text} cursor-pointer`}
          onClick={() => onResponse?.(label)}
        >
          <div className="text-[10px] font-semibold">{label}</div>
          <div className="text-[8px] font-normal opacity-70 mt-[2px]">{time}</div>
        </button>
      ))}
    </div>
  )
}
