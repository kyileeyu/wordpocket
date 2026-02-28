const responses = [
  { label: "Again", time: "< 1분", bg: "bg-again-bg", text: "text-again", border: "border-again/30" },
  { label: "Hard", time: "6분", bg: "bg-bg-subtle", text: "text-text-secondary", border: "border-border" },
  { label: "Good", time: "10분", bg: "bg-accent-bg", text: "text-accent", border: "border-accent/30" },
  { label: "Easy", time: "4일", bg: "bg-accent-bg-soft", text: "text-accent-light", border: "border-accent-lighter" },
] as const

interface ResponseButtonsProps {
  onResponse?: (response: string) => void
}

export default function ResponseButtons({ onResponse }: ResponseButtonsProps) {
  return (
    <div className="flex gap-[6px] px-5">
      {responses.map(({ label, time, bg, text, border }) => (
        <button
          key={label}
          className={`flex-1 rounded-[16px] py-[10px] px-1 text-center border-[1.5px] ${bg} ${text} ${border} cursor-pointer`}
          onClick={() => onResponse?.(label)}
        >
          <div className="text-[10px] font-semibold">{label}</div>
          <div className="text-[8px] font-normal opacity-70 mt-[2px]">{time}</div>
        </button>
      ))}
    </div>
  )
}
