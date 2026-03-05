interface SpreadCardsIconProps {
  className?: string;
  color?: string;
}

export default function SpreadCardsIcon({ className, color = "currentColor" }: SpreadCardsIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left card */}
      <rect
        x="2"
        y="4"
        width="12"
        height="16"
        rx="2"
        fill={color}
        fillOpacity={0.15}
        stroke={color}
        strokeWidth="1"
        strokeOpacity={0.3}
        opacity={0.5}
        transform="rotate(-12 8 12)"
      />
      {/* Middle card */}
      <rect
        x="6"
        y="3"
        width="12"
        height="16"
        rx="2"
        fill={color}
        fillOpacity={0.2}
        stroke={color}
        strokeWidth="1"
        strokeOpacity={0.3}
        opacity={0.7}
      />
      {/* Right card */}
      <rect
        x="10"
        y="4"
        width="12"
        height="16"
        rx="2"
        fill={color}
        fillOpacity={0.3}
        stroke={color}
        strokeWidth="1"
        strokeOpacity={0.3}
        transform="rotate(12 16 12)"
      />
    </svg>
  );
}
