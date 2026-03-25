import React from "react";
import { View, Text } from "react-native";

interface StatPillProps {
  emoji: string;
  value: string | number;
  label: string;
}

export function StatPill({ emoji, value, label }: StatPillProps) {
  return (
    <View className="bg-accent-bg rounded-full px-3 py-[6px] flex-row items-center gap-[5px]">
      <Text className="text-mono-sm">{emoji}</Text>
      <Text className="text-mono-sm font-semibold text-text-primary">{value}</Text>
      <Text className="text-mono-sm font-medium text-text-secondary">{label}</Text>
    </View>
  );
}
