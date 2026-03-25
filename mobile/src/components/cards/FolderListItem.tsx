import React from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { shadows, colors } from "@/lib/theme";

interface FolderListItemProps {
  id: string;
  emoji: string;
  name: string;
  deckCount: number;
  reviewCount: number;
}

export function FolderListItem({ id, emoji, name, deckCount, reviewCount }: FolderListItemProps) {
  return (
    <Pressable
      onPress={() => router.push(`/(app)/folder/${id}`)}
      className="flex-row items-center gap-3 bg-bg-elevated p-[14px] mb-[10px]"
      style={[shadows.soft, { borderRadius: 20 }]}
    >
      <View
        className="w-9 h-9 rounded-icon items-center justify-center"
        style={{ backgroundColor: "#EDEAFC" }}
      >
        <Text className="text-[16px]">{emoji}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-body-md font-semibold text-text-primary">{name}</Text>
        <Text className="text-mono-sm text-text-secondary mt-[1px]">
          {deckCount}개 카드뭉치 · {reviewCount}장 대기
        </Text>
      </View>
      {reviewCount > 0 && (
        <View className="bg-accent-bg px-2 py-[3px] rounded-full">
          <Text className="text-mono-sm font-semibold text-accent">{reviewCount}</Text>
        </View>
      )}
      <ChevronRight size={14} color={colors.text.tertiary} />
    </Pressable>
  );
}
