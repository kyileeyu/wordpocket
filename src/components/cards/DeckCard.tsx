import { Link } from "react-router";
import { ChevronRight } from "lucide-react";
import SpreadCardsIcon from "../icons/SpreadCardsIcon";

interface DeckCardProps {
  id: string;
  name: string;
  cardCount: number;
  reviewCount: number;
  stripeColor: string;
  disableLink?: boolean;
}

export default function DeckCard({
  id,
  name,
  cardCount,
  reviewCount,
  stripeColor,
  disableLink,
}: DeckCardProps) {
  const progress = cardCount > 0 ? reviewCount / cardCount : 0;
  const className =
    "flex items-center gap-3 bg-bg-elevated rounded-[20px] px-4 py-3 mb-[10px] shadow-md hover:shadow-lg transition-shadow";

  const content = (
    <>
      <div
        className="w-9 h-9 rounded-icon flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${stripeColor}22` }}
      >
        <SpreadCardsIcon className="w-[20px] h-[20px]" color={stripeColor} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <div className="shrink min-w-0">
            <div className="typo-body-md font-semibold text-text-primary truncate">
              {name}
            </div>
            <div className="typo-mono-sm text-text-secondary mt-[1px]">
              {cardCount}장
            </div>
          </div>
          <div className="basis-1/2 shrink-0 ml-auto h-[4px] bg-border rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(progress * 100, 100)}%`,
                backgroundColor: stripeColor,
              }}
            />
          </div>
        </div>
      </div>
      {reviewCount > 0 && (
        <div className="bg-accent-bg text-accent typo-mono-sm font-semibold px-2 py-[3px] rounded-full shrink-0">
          {reviewCount}
        </div>
      )}
      <ChevronRight className="w-[14px] h-[14px] text-text-tertiary shrink-0" />
    </>
  );

  if (disableLink) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link to={`/deck/${id}`} className={className}>
      {content}
    </Link>
  );
}
