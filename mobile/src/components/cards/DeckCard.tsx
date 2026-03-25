import React from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import Svg, { Rect } from "react-native-svg";
import { shadows, colors } from "@/lib/theme";

function SpreadCardsIcon({ size = 20, color = "#7C6CE7" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={2} y={4} width={12} height={16} rx={2} fill={color} fillOpacity={0.15} stroke={color} strokeWidth={1} strokeOpacity={0.3} opacity={0.5} rotation={-12} origin="8, 12" />
      <Rect x={6} y={3} width={12} height={16} rx={2} fill={color} fillOpacity={0.2} stroke={color} strokeWidth={1} strokeOpacity={0.3} opacity={0.7} />
      <Rect x={10} y={4} width={12} height={16} rx={2} fill={color} fillOpacity={0.3} stroke={color} strokeWidth={1} strokeOpacity={0.3} rotation={12} origin="16, 12" />
    </Svg>
  );
}

interface DeckCardProps {
  id: string;
  name: string;
  cardCount: number;
  reviewCount: number;
  stripeColor?: string;
}

export function DeckCard({ id, name, cardCount, reviewCount, stripeColor = "#7C6CE7" }: DeckCardProps) {
  const progress = cardCount > 0 ? reviewCount / cardCount : 0;

  return (
    <Pressable
      onPress={() => router.push(`/(app)/deck/${id}`)}
      className="flex-row items-center gap-3 bg-bg-elevated p-[14px] mb-[10px]"
      style={[shadows.md, { borderRadius: 20 }]}
    >
      {/* Icon */}
      <View
        className="w-9 h-9 rounded-icon items-center justify-center"
        style={{ backgroundColor: `${stripeColor}22` }}
      >
        <SpreadCardsIcon size={20} color={stripeColor} />
      </View>

      {/* Name + Progress */}
      <View className="flex-1">
        <View className="flex-row items-center gap-3">
          <View className="shrink min-w-0">
            <Text className="text-body-md font-semibold text-text-primary" numberOfLines={1}>
              {name}
            </Text>
            <Text className="text-[10px] text-text-secondary mt-[1px]">{cardCount}장</Text>
          </View>
          {/* Progress bar */}
          <View className="flex-1 h-[4px] bg-border rounded-full overflow-hidden ml-auto">
            <View
              className="h-full rounded-full"
              style={{
                width: `${Math.min(progress * 100, 100)}%`,
                backgroundColor: stripeColor,
              }}
            />
          </View>
        </View>
      </View>

      {/* Review badge */}
      {reviewCount > 0 && (
        <View className="bg-accent-bg px-2 py-[3px] rounded-full">
          <Text className="text-[10px] font-semibold text-accent">{reviewCount}</Text>
        </View>
      )}

      <ChevronRight size={14} color={colors.text.tertiary} />
    </Pressable>
  );
}
