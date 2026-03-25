import React from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { shadows, colors } from "@/lib/theme";

interface DeckCardProps {
  id: string;
  name: string;
  cardCount: number;
  reviewCount: number;
  stripeColor?: string;
}

export function DeckCard({ id, name, cardCount, reviewCount, stripeColor = "#7C6CE7" }: DeckCardProps) {
  return (
    <Pressable
      onPress={() => router.push(`/(app)/deck/${id}`)}
      className="flex-row items-center bg-bg-elevated rounded-xl mb-[10px] overflow-hidden"
      style={shadows.soft}
    >
      <View className="w-1 self-stretch" style={{ backgroundColor: stripeColor }} />
      <View className="flex-1 flex-row items-center p-[14px] gap-3">
        <View className="flex-1">
          <Text className="text-body-md font-semibold text-text-primary">{name}</Text>
          <Text className="text-mono-sm text-text-secondary mt-[1px]">{cardCount}장</Text>
        </View>
        {reviewCount > 0 && (
          <View className="bg-accent-bg px-2 py-[3px] rounded-full">
            <Text className="text-mono-sm font-semibold text-accent">{reviewCount}</Text>
          </View>
        )}
        <ChevronRight size={14} color={colors.text.tertiary} />
      </View>
    </Pressable>
  );
}
