import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { X } from "lucide-react-native";
import { WordCard } from "@/components/cards/WordCard";
import { ResponseButtons } from "@/components/study/ResponseButtons";
import { StudyProgress } from "@/components/study/StudyProgress";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useFolderReviewQueue, useReviewBatch } from "@/hooks/useStudy";
import { computeIntervals } from "@/lib/utils";
import { colors } from "@/lib/theme";

export default function FolderStudyPage() {
  const { folderId } = useLocalSearchParams<{ folderId: string }>();
  const { data: queue, isLoading, refetch } = useFolderReviewQueue(folderId!);
  const batch = useReviewBatch();

  const [workingQueue, setWorkingQueue] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [newCount, setNewCount] = useState(0);
  const [lapCount, setLapCount] = useState(0);
  const [lapStartIndex, setLapStartIndex] = useState(0);
  const [lapEndIndex, setLapEndIndex] = useState(0);
  const reviewStartRef = useRef(Date.now());
  const initRef = useRef(false);

  useEffect(() => {
    if (queue && queue.length > 0 && !initRef.current) {
      setWorkingQueue(queue);
      setNewCount(queue.filter((c: any) => c.queue_type === "new").length);
      setLapEndIndex(queue.length);
      initRef.current = true;
    }
  }, [queue]);

  useEffect(() => { reviewStartRef.current = Date.now(); }, [index]);

  const card = workingQueue[index];
  const intervals = useMemo(() => {
    if (!card) return undefined;
    return computeIntervals(card);
  }, [card?.card_id, card?.status, card?.ease_factor, card?.interval, card?.step_index]);

  const handleExit = useCallback(async () => {
    if (batch.getPendingCount() > 0) try { await batch.flush(); } catch {}
    router.back();
  }, [batch]);

  const handleResponse = async (label: string) => {
    if (!card) return;
    const rating = label.toLowerCase();
    const duration = Date.now() - reviewStartRef.current;
    const nextReviewed = reviewedCount + 1;
    const nextCorrect = rating !== "again" ? correctCount + 1 : correctCount;
    setReviewedCount(nextReviewed); setCorrectCount(nextCorrect);
    batch.addReview(card.card_id, rating, duration);

    let nextQueue = [...workingQueue];
    if (rating === "again" || rating === "hard") nextQueue = [...nextQueue, card];
    const nextIndex = index + 1;

    if (nextIndex >= lapEndIndex && nextIndex < nextQueue.length) {
      setLapCount((c) => c + 1); setLapStartIndex(lapEndIndex); setLapEndIndex(nextQueue.length);
    }

    if (nextIndex >= nextQueue.length) {
      try { await batch.flush(); } catch {}
      const { data: serverQueue } = await refetch();
      if (serverQueue && serverQueue.length > 0) {
        setWorkingQueue(serverQueue); setIndex(0); setFlipped(false);
        setLapStartIndex(0); setLapEndIndex(serverQueue.length);
      } else {
        router.replace({ pathname: "/(app)/study/complete", params: { reviewed: String(nextReviewed), correct: String(nextCorrect), newCount: String(newCount) } });
      }
    } else {
      setWorkingQueue(nextQueue); setIndex(nextIndex); setFlipped(false);
    }
  };

  if (isLoading) return <SafeAreaView className="flex-1 bg-bg-primary px-6 gap-4 pt-16"><Skeleton className="h-2 rounded-full" /><Skeleton className="h-[280px] rounded-2xl" /></SafeAreaView>;
  if (!queue || queue.length === 0) return <SafeAreaView className="flex-1 bg-bg-primary items-center justify-center"><EmptyState icon="📚" text="학습할 카드가 없습니다." /></SafeAreaView>;
  if (!card) return null;

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <View className="flex-row items-center justify-between px-4 py-2">
        <Pressable onPress={handleExit} hitSlop={8}><X size={24} color={colors.text.primary} /></Pressable>
        <Text className="text-mono-md text-text-secondary">{index - lapStartIndex + 1} / {lapEndIndex - lapStartIndex}</Text>
        <View className="w-6" />
      </View>
      <StudyProgress current={index - lapStartIndex + 1} total={lapEndIndex - lapStartIndex} lapCount={lapCount} />
      <View className="flex-1 justify-center px-6">
        <WordCard word={card.word} phonetic={card.pronunciation ?? undefined} meaning={card.meaning} example={card.example ?? undefined} synonyms={card.synonyms} tags={card.tags} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />
      </View>
      <View className={`mb-4 ${!flipped ? "opacity-0" : ""}`} pointerEvents={flipped ? "auto" : "none"}>
        <ResponseButtons onResponse={handleResponse} intervals={intervals} />
      </View>
    </SafeAreaView>
  );
}
