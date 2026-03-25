import React from "react";
import { View, Text } from "react-native";
import { Progress } from "@/components/ui/Progress";

interface StudyProgressProps {
  current: number;
  total: number;
  lapCount: number;
}

export function StudyProgress({ current, total, lapCount }: StudyProgressProps) {
  return (
    <View className="px-6 mb-2">
      <Progress value={current} max={total} />
      {lapCount > 0 && (
        <View className="flex-row items-center justify-end mt-1">
          {Array.from({ length: lapCount }).map((_, i) => (
            <Text key={i} className="text-caption text-warning">⭐</Text>
          ))}
        </View>
      )}
    </View>
  );
}
