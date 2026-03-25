import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Button } from "@/components/ui/Button";
import { useStreak } from "@/hooks/useStats";
import { shadows } from "@/lib/theme";

export default function StudyCompletePage() {
  const { reviewed = "0", correct = "0", newCount = "0" } = useLocalSearchParams<{
    reviewed?: string;
    correct?: string;
    newCount?: string;
  }>();

  const reviewedNum = parseInt(reviewed, 10);
  const correctNum = parseInt(correct, 10);
  const newCountNum = parseInt(newCount, 10);

  const { data: streakData } = useStreak();
  const streak = streakData?.current_streak ?? 0;

  const reviewCount = reviewedNum - newCountNum;
  const accuracy = reviewedNum > 0 ? Math.round((correctNum / reviewedNum) * 100) : 0;

  return (
    <SafeAreaView className="flex-1 bg-bg-primary justify-center px-8">
      <Text className="text-[48px] text-center mb-2">🎉</Text>
      <Text className="text-display-xl font-display text-center text-text-primary mb-1">
        학습 완료!
      </Text>
      <Text className="text-body-sm text-text-secondary text-center mb-5">
        오늘도 한 걸음 나아갔어요.
      </Text>

      {/* Stats */}
      <View className="flex-row gap-[6px] mb-5">
        {[
          { v: newCountNum, l: "New" },
          { v: reviewCount, l: "복습" },
          { v: `${accuracy}%`, l: "정답률" },
        ].map((s) => (
          <View key={s.l} className="flex-1 items-center py-3 rounded-xl bg-bg-elevated" style={shadows.soft}>
            <Text className="text-stat-value font-bold text-text-primary">{s.v}</Text>
            <Text className="text-mono-sm text-text-secondary">{s.l}</Text>
          </View>
        ))}
      </View>

      {/* Streak */}
      <View className="bg-bg-subtle border border-border rounded-xl p-4 items-center mb-5">
        <Text className="text-caption text-text-secondary mb-1">연속 학습</Text>
        <Text className="text-[28px] font-bold text-accent">🔥 {streak}일</Text>
      </View>

      <Button variant="default" size="lg" className="w-full" onPress={() => router.replace("/(app)/(tabs)")}>
        홈으로
      </Button>
    </SafeAreaView>
  );
}
