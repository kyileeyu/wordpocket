import { useState } from "react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { StatPill } from "@/components/stats"
import { FolderListItem } from "@/components/cards"
import EmptyState from "@/components/feedback/EmptyState"
import FAB from "@/components/feedback/FAB"
import InputDialog from "@/components/feedback/InputDialog"
import { useFolders, useCreateFolder } from "@/hooks/useFolders"
import { useDeckProgress } from "@/hooks/useDecks"

export default function HomePage() {
  const { data: folders, isLoading: foldersLoading } = useFolders()
  const { data: deckProgress } = useDeckProgress()
  const createFolder = useCreateFolder()
  const [dialogOpen, setDialogOpen] = useState(false)

  const totalDue = deckProgress?.reduce((sum, d) => sum + d.due_today, 0) ?? 0
  const totalCards = deckProgress?.reduce((sum, d) => sum + d.total_cards, 0) ?? 0

  // Aggregate due_today per folder
  const folderDueMap = new Map<string, number>()
  const folderDeckCountMap = new Map<string, number>()
  deckProgress?.forEach((d) => {
    if (!d.folder_id) return
    folderDueMap.set(d.folder_id, (folderDueMap.get(d.folder_id) ?? 0) + d.due_today)
    folderDeckCountMap.set(d.folder_id, (folderDeckCountMap.get(d.folder_id) ?? 0) + 1)
  })

  const handleCreate = (name: string) => {
    createFolder.mutate(name, {
      onSuccess: () => setDialogOpen(false),
    })
  }

  return (
    <div>
      {/* Greeting + Title */}
      <div className="px-5 pt-3">
        <div className="font-display text-[11px] text-sepia italic mb-[2px]">Good morning,</div>
        <h1 className="font-display text-[20px] font-medium text-ink">오늘의 복습</h1>
      </div>

      {/* Stat Pills */}
      <div className="px-5 mt-4">
        <div className="flex gap-[6px] flex-wrap">
          <StatPill emoji="📖" value={totalDue} label="카드" />
          <StatPill emoji="📦" value={totalCards} label="전체" />
        </div>
      </div>

      {/* Study CTA */}
      {totalDue > 0 && (
        <div className="px-5 mt-4 mb-4">
          <Button asChild size="lg" className="w-full">
            <Link to="/study/all">▶ 학습 시작</Link>
          </Button>
        </div>
      )}

      {/* Folder List */}
      <div className="px-5 mt-4">
        <Label>단어장</Label>

        {foldersLoading ? (
          <div className="space-y-3 mt-2">
            <Skeleton className="h-14 rounded-[12px]" />
            <Skeleton className="h-14 rounded-[12px]" />
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
    </div>
  )
}
