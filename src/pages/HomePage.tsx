import { useState } from "react";
import { Link } from "react-router";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { StatPill } from "@/components/stats";
import { FolderListItem } from "@/components/cards";
import { SearchOverlay } from "@/components/search";
import EmptyState from "@/components/feedback/EmptyState";
import FAB from "@/components/feedback/FAB";
import InputDialog from "@/components/feedback/InputDialog";
import PageContent from "@/components/layouts/PageContent";
import { useFolders, useCreateFolder } from "@/hooks/useFolders";
import { useDeckProgress } from "@/hooks/useDecks";
import { useTodayStats, useStreak } from "@/hooks/useStats";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import InstallBanner from "@/components/feedback/InstallBanner";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning,";
  if (h < 18) return "Good afternoon,";
  return "Good evening,";
}

export default function HomePage() {
  const { data: folders, isLoading: foldersLoading } = useFolders();
  const { data: deckProgress } = useDeckProgress();
  const createFolder = useCreateFolder();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { canShow, platform, triggerInstall, dismiss } = usePwaInstall();

  const { data: todayStats } = useTodayStats();
  const { data: streakData } = useStreak();
  const reviewedCount = todayStats?.reviewed_count ?? 0;
  const newLearnedCount = todayStats?.new_learned_count ?? 0;
  const streak = streakData?.current_streak ?? 0;
  const studySeconds = todayStats?.study_seconds ?? 0;
  const studyMin = Math.round(studySeconds / 60);

  const totalDue =
    deckProgress?.reduce((sum, d) => sum + d.due_today, 0) ?? 0;
  const firstDueDeck = deckProgress?.find((d) => d.due_today > 0);

  // Aggregate due_today per folder
  const folderDueMap = new Map<string, number>();
  const folderDeckCountMap = new Map<string, number>();
  deckProgress?.forEach((d) => {
    if (!d.folder_id) return;
    folderDueMap.set(
      d.folder_id,
      (folderDueMap.get(d.folder_id) ?? 0) + d.due_today,
    );
    folderDeckCountMap.set(
      d.folder_id,
      (folderDeckCountMap.get(d.folder_id) ?? 0) + 1,
    );
  });

  const handleCreate = (name: string) => {
    createFolder.mutate(name, {
      onSuccess: () => setDialogOpen(false),
    });
  };

  return (
    <PageContent>
      {/* Greeting + Title */}
      <div className="flex items-start justify-between">
        <div>
          <div className="typo-display-l font-display text-text-secondary italic mb-[2px]">
            {getGreeting()}
          </div>
          <h1 className="typo-display-xl text-text-primary">오늘의 복습</h1>
        </div>
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="mt-1 p-2 -mr-2 rounded-full active:bg-bg-subtle transition-colors"
        >
          <Search className="w-6 h-6 text-text-secondary" />
        </button>
      </div>

      {/* Stat Pills */}
      <div className="flex gap-[6px] flex-wrap">
        <StatPill emoji="📖" value={reviewedCount} label="복습" />
        <StatPill emoji="🆕" value={newLearnedCount} label="신규" />
        <StatPill emoji="🔥" value={streak} label="일 연속" />
        <StatPill emoji="⏱" value={`${studyMin}m`} label="학습" />
      </div>

      {/* Install Banner */}
      {canShow && (
        <InstallBanner
          platform={platform}
          onInstall={triggerInstall}
          onDismiss={dismiss}
        />
      )}

      {/* Study CTA */}
      {totalDue > 0 && firstDueDeck && (
        <Button asChild size="lg" className="w-full">
          <Link to={`/study/${firstDueDeck.deck_id}`}>
            ▶ 학습 시작 · {totalDue}장
          </Link>
        </Button>
      )}

      {/* Folder List */}
      <div>
        <Label>단어장</Label>

        {foldersLoading ? (
          <div className="space-y-3 mt-2">
            <Skeleton className="h-14 rounded-[20px]" />
            <Skeleton className="h-14 rounded-[20px]" />
          </div>
        ) : folders && folders.length > 0 ? (
          folders.map((folder) => (
            <FolderListItem
              key={folder.id}
              id={folder.id}
              emoji="📁"
              name={folder.name}
              deckCount={folderDeckCountMap.get(folder.id) ?? 0}
              reviewCount={folderDueMap.get(folder.id) ?? 0}
            />
          ))
        ) : (
          <EmptyState
            icon="📂"
            text="아직 단어장이 없습니다. 첫 단어장을 만들어보세요!"
            actionLabel="단어장 만들기"
            onAction={() => setDialogOpen(true)}
          />
        )}
      </div>

      <FAB onClick={() => setDialogOpen(true)} />

      <InputDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="새 단어장"
        placeholder="단어장 이름"
        submitLabel="만들기"
        onSubmit={handleCreate}
        loading={createFolder.isPending}
      />

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </PageContent>
  );
}
