import { useRef, useEffect, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Camera, Images, ImagePlus } from "lucide-react"
import TopBar from "@/components/navigation/TopBar"
import { Button } from "@/components/ui/button"
import ConfirmDialog from "@/components/feedback/ConfirmDialog"
import ThumbnailStrip from "@/components/photo-import/ThumbnailStrip"
import ExtractionProgress from "@/components/photo-import/ExtractionProgress"
import CardDraftItem from "@/components/photo-import/CardDraftItem"
import FullscreenViewer from "@/components/photo-import/FullscreenViewer"
import DayTagSheet from "@/components/photo-import/DayTagSheet"
import { usePhotoImportReducer } from "@/hooks/usePhotoImportReducer"
import { useMultiImageExtraction } from "@/hooks/useMultiImageExtraction"
import { useCardsByDeck } from "@/hooks/useCards"
import { createThumbnailUrl, revokeThumbnailUrls } from "@/lib/imageProcessing"
import { supabase } from "@/lib/supabase"
import type { ImportImage, DayTagOption } from "@/types/photo-import"

const MAX_IMAGES = 20

export default function PhotoImportPage() {
  const { id: deckId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const albumRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  const [state, dispatch] = usePhotoImportReducer()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [dayTagSheetOpen, setDayTagSheetOpen] = useState(false)

  const { data: existingCards } = useCardsByDeck(deckId ?? "")

  // Cleanup Object URLs on unmount
  useEffect(() => {
    return () => revokeThumbnailUrls(state.images)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const existingWords = existingCards?.map((c) => c.word.toLowerCase().trim()) ?? []

  // Existing day tags for the day tag sheet
  const existingDayTags: string[] = []
  if (existingCards) {
    const tagSet = new Set<string>()
    existingCards.forEach((c) =>
      c.tags?.forEach((t: string) => {
        if (/^Day\s+\d+$/i.test(t)) tagSet.add(t)
      })
    )
    Array.from(tagSet)
      .sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, ""))
        const numB = parseInt(b.replace(/\D/g, ""))
        return numA - numB
      })
      .forEach((t) => existingDayTags.push(t))
  }

  // --- File handling ---
  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return
      const currentCount = state.images.length
      const fileArray = Array.from(files)

      if (currentCount + fileArray.length > MAX_IMAGES) {
        toast.error(`최대 ${MAX_IMAGES}장까지 업로드할 수 있습니다.`)
      }

      const remaining = MAX_IMAGES - currentCount
      const toAdd = fileArray.slice(0, remaining)

      const newImages: ImportImage[] = toAdd.map((f) => ({
        id: crypto.randomUUID(),
        file: f,
        thumbnailUrl: createThumbnailUrl(f),
      }))

      dispatch({ type: "ADD_IMAGES", images: newImages })
    },
    [state.images.length, dispatch]
  )

  const handleAlbumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
    e.target.value = ""
  }

  const handleCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
    e.target.value = ""
  }

  // --- Extraction ---
  const { startExtraction, cancelExtraction } = useMultiImageExtraction({
    onProgress: (current, total) =>
      dispatch({ type: "UPDATE_EXTRACTION_PROGRESS", current, total }),
    onComplete: (cards) => {
      // Mark duplicates
      const markedCards = cards.map((c) => ({
        ...c,
        isDuplicate: existingWords.includes(c.word.toLowerCase().trim()),
        isChecked: !existingWords.includes(c.word.toLowerCase().trim()),
      }))
      dispatch({ type: "EXTRACTION_COMPLETE", cards: markedCards })
    },
    onError: (error) => dispatch({ type: "EXTRACTION_ERROR", error }),
  })

  const handleStartExtraction = () => {
    dispatch({ type: "START_EXTRACTION" })
    startExtraction(state.images)
  }

  const handleRetryExtraction = () => {
    dispatch({ type: "START_EXTRACTION" })
    startExtraction(state.images)
  }

  // --- Back navigation ---
  const handleBack = () => {
    if (state.step === "extracting") {
      setConfirmOpen(true)
    } else if (state.step === "review" && state.cards.length > 0) {
      setConfirmOpen(true)
    } else {
      navigate(-1)
    }
  }

  const handleConfirmLeave = () => {
    setConfirmOpen(false)
    if (state.step === "extracting") {
      cancelExtraction()
    }
    navigate(-1)
  }

  // --- Card creation ---
  const handleOpenDayTagSheet = () => {
    setDayTagSheetOpen(true)
  }

  const handleCreateCards = async (dayTagOption: DayTagOption, dayTag: string, batchSize: number) => {
    if (!deckId) return
    const checkedCards = state.cards.filter((c) => c.isChecked)
    if (checkedCards.length === 0) return

    dispatch({ type: "SET_CREATING", creating: true })
    setDayTagSheetOpen(false)

    try {
      const insertData = checkedCards.map((card, index) => {
        const tags: string[] = []
        if (dayTagOption === "auto") {
          tags.push(`Day ${Math.floor(index / batchSize) + 1 + existingDayTags.length}`)
        } else if (dayTagOption === "existing" && dayTag) {
          tags.push(dayTag)
        } else if (dayTagOption === "new" && dayTag) {
          tags.push(dayTag)
        }

        return {
          deck_id: deckId,
          word: card.word,
          meaning: card.meaning,
          example: card.example || "",
          pronunciation: card.pronunciation || "",
          tags,
          synonyms: card.synonyms ?? [],
        }
      })

      const { error } = await supabase.from("cards").insert(insertData)
      if (error) throw error

      qc.invalidateQueries({ queryKey: ["cards", deckId] })
      qc.invalidateQueries({ queryKey: ["deck-progress"] })
      toast.success(`${checkedCards.length}장 카드 생성 완료`)
      navigate(-1)
    } catch {
      toast.error("카드 생성에 실패했습니다.")
      dispatch({ type: "SET_CREATING", creating: false })
    }
  }

  // --- Swipe delete undo ---
  const handleDeleteCard = (tempId: string) => {
    dispatch({ type: "DELETE_CARD", tempId })
    toast("카드가 삭제되었습니다.", {
      action: {
        label: "되돌리기",
        onClick: () => dispatch({ type: "UNDO_DELETE" }),
      },
      duration: 4000,
    })
  }

  const checkedCount = state.cards.filter((c) => c.isChecked).length

  const confirmMessage =
    state.step === "extracting"
      ? "추출을 취소하시겠습니까?"
      : "편집 중인 내용이 있습니다. 나가시겠습니까?"

  return (
    <div className="flex flex-col h-full">
      {/* --- UPLOAD STEP --- */}
      {state.step === "upload" && (
        <>
          <TopBar left="back" title="사진으로 가져오기" onLeftClick={handleBack} />
          <div className="flex-1 overflow-y-auto px-5 pt-4 pb-28">
            {/* Hidden file inputs */}
            <input
              ref={albumRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleAlbumChange}
            />
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleCameraChange}
            />

            {state.images.length === 0 ? (
              /* Empty upload area */
              <div className="mt-8 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-accent-bg flex items-center justify-center mb-4">
                  <ImagePlus className="w-9 h-9 text-accent" />
                </div>
                <p className="typo-body-md text-text-primary font-semibold mb-1">
                  단어가 적힌 사진을 업로드하세요
                </p>
                <p className="typo-caption text-text-secondary mb-6 text-center">
                  교재, 단어 노트, 시험지 등에서<br />단어를 자동으로 추출합니다. (최대 {MAX_IMAGES}장)
                </p>
                <div className="flex gap-3 w-full">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => albumRef.current?.click()}
                  >
                    <Images className="w-4 h-4" />
                    앨범에서 선택
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => cameraRef.current?.click()}
                  >
                    <Camera className="w-4 h-4" />
                    촬영하기
                  </Button>
                </div>
              </div>
            ) : (
              /* Images selected — show strip + preview */
              <>
                <ThumbnailStrip
                  images={state.images}
                  selectedIndex={state.selectedImageIndex}
                  onSelect={(i) => dispatch({ type: "SELECT_IMAGE", index: i })}
                  onRemove={(id) => dispatch({ type: "REMOVE_IMAGE", id })}
                  onAdd={() => albumRef.current?.click()}
                />
                {/* Selected image preview */}
                {state.images[state.selectedImageIndex] && (
                  <div className="mt-3">
                    <img
                      src={state.images[state.selectedImageIndex].thumbnailUrl}
                      alt={`페이지 ${state.selectedImageIndex + 1}`}
                      className="w-full rounded-[14px] border border-border object-contain max-h-[300px]"
                    />
                  </div>
                )}
                <p className="typo-caption text-text-secondary mt-3 text-center">
                  {state.images.length}장 선택됨
                  {state.images.length >= MAX_IMAGES && " (최대)"}
                </p>
              </>
            )}
          </div>

          {/* Bottom CTA */}
          {state.images.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 p-5 bg-bg-primary/80 backdrop-blur-sm border-t border-border-subtle">
              <Button
                className="w-full"
                onClick={handleStartExtraction}
                disabled={state.images.length === 0}
              >
                {state.images.length}장 추출하기
              </Button>
            </div>
          )}
        </>
      )}

      {/* --- EXTRACTING STEP --- */}
      {state.step === "extracting" && (
        <>
          <TopBar left="close" title="단어 추출 중" onLeftClick={handleBack} />
          <div className="flex-1 flex items-center justify-center px-5">
            <ExtractionProgress
              current={state.extractionProgress.current}
              total={state.extractionProgress.total}
              error={state.extractionError}
              onRetry={handleRetryExtraction}
            />
          </div>
        </>
      )}

      {/* --- REVIEW STEP --- */}
      {state.step === "review" && (
        <>
          <TopBar
            left="back"
            title="추출 결과"
            onLeftClick={handleBack}
            right={
              <button
                onClick={() => dispatch({ type: "TOGGLE_ALL_CARDS" })}
                className="typo-caption text-accent font-semibold"
              >
                {state.cards.filter((c) => !c.isDuplicate).every((c) => c.isChecked)
                  ? "전체해제"
                  : "전체선택"}
              </button>
            }
          />
          <div className="flex-1 overflow-y-auto px-5 pt-2 pb-28">
            {/* Thumbnail strip — tappable for fullscreen */}
            <ThumbnailStrip
              images={state.images}
              selectedIndex={state.selectedImageIndex}
              onSelect={(i) => {
                dispatch({ type: "SELECT_IMAGE", index: i })
                dispatch({ type: "OPEN_FULLSCREEN" })
              }}
            />

            {/* Summary */}
            <p className="typo-caption text-text-secondary mt-3 mb-3">
              <span className="text-text-primary font-semibold">{state.cards.length}개</span> 단어 추출됨
              {state.cards.some((c) => c.isDuplicate) && (
                <span className="text-text-tertiary">
                  {" "}· {state.cards.filter((c) => c.isDuplicate).length}개 중복
                </span>
              )}
            </p>

            {/* Card list */}
            {state.cards.length === 0 ? (
              <div className="flex flex-col items-center mt-12">
                <p className="typo-body-md text-text-secondary mb-4">
                  추출된 단어가 없습니다.
                </p>
                <Button
                  variant="outline"
                  onClick={() => dispatch({ type: "GO_BACK_TO_UPLOAD" })}
                >
                  다시 업로드하기
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-[6px]">
                {state.cards.map((card) => (
                  <CardDraftItem
                    key={card.tempId}
                    card={card}
                    onToggleCheck={() =>
                      dispatch({ type: "TOGGLE_CARD_CHECK", tempId: card.tempId })
                    }
                    onToggleExpand={() =>
                      dispatch({ type: "TOGGLE_CARD_EXPAND", tempId: card.tempId })
                    }
                    onUpdateField={(field, value) =>
                      dispatch({
                        type: "UPDATE_CARD_FIELD",
                        tempId: card.tempId,
                        field,
                        value,
                      })
                    }
                    onDelete={() => handleDeleteCard(card.tempId)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Bottom CTA */}
          {state.cards.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 p-5 bg-bg-primary/80 backdrop-blur-sm border-t border-border-subtle">
              <Button
                className="w-full"
                onClick={handleOpenDayTagSheet}
                disabled={checkedCount === 0 || state.creating}
              >
                {state.creating ? "생성 중..." : `${checkedCount}장 카드 생성`}
              </Button>
            </div>
          )}
        </>
      )}

      {/* --- FULLSCREEN VIEWER --- */}
      {state.fullscreenImageOpen && (
        <FullscreenViewer
          images={state.images}
          initialIndex={state.selectedImageIndex}
          onClose={() => dispatch({ type: "CLOSE_FULLSCREEN" })}
          onIndexChange={(i) => dispatch({ type: "SELECT_IMAGE", index: i })}
        />
      )}

      {/* --- DAY TAG SHEET --- */}
      {dayTagSheetOpen && (
        <DayTagSheet
          existingDayTags={existingDayTags}
          checkedCount={checkedCount}
          onClose={() => setDayTagSheetOpen(false)}
          onConfirm={handleCreateCards}
        />
      )}

      {/* --- CONFIRM DIALOG --- */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmMessage}
        confirmLabel="나가기"
        onConfirm={handleConfirmLeave}
      />
    </div>
  )
}
