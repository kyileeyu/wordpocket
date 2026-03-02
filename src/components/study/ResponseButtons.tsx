const responses = [
  { label: "Again", display: "모르겠어요", time: "< 1분", bg: "bg-again-bg", text: "text-again", border: "border-again/30" },
  { label: "Hard", display: "애매해요", time: "6분", bg: "bg-bg-subtle", text: "text-text-secondary", border: "border-border" },
  { label: "Good", display: "알아요", time: "10분", bg: "bg-accent-bg", text: "text-accent", border: "border-accent/30" },
  { label: "Easy", display: "안외워도 돼요", time: "4일", bg: "bg-accent-bg-soft", text: "text-accent-light", border: "border-accent-lighter" },
] as const

interface ResponseButtonsProps {
  onResponse?: (response: string) => void
}

export default function ResponseButtons({ onResponse }: ResponseButtonsProps) {
  return (
    <div className="flex gap-[10px] px-7">
      {responses.map(({ label, display, time, bg, text, border }) => (
        <button
          key={label}
          className={`flex-1 aspect-square rounded-[20px] flex flex-col items-center justify-center border-[1.5px] ${bg} ${text} ${border} cursor-pointer`}
          onClick={() => onResponse?.(label)}
        >
          <div className="typo-body-sm font-bold">{display}</div>
          <div className="typo-mono-sm font-normal opacity-70 mt-[2px]">{time}</div>
        </button>
      ))}
    </div>
  )
}
