import React from "react";
import { View, Text, Pressable } from "react-native";

const RESPONSES = [
  { label: "Again", display: "모르겠어요", defaultTime: "1분", bgColor: "#FDE8EE", textColor: "#E55B7A", borderColor: "rgba(229,91,122,0.3)" },
  { label: "Hard", display: "애매해요", defaultTime: "10분", bgColor: "#F3F2FA", textColor: "#6E6B7B", borderColor: "#E8E6F0" },
  { label: "Good", display: "외웠어요", defaultTime: "1일", bgColor: "#EDEAFC", textColor: "#7C6CE7", borderColor: "rgba(124,108,231,0.3)" },
  { label: "Easy", display: "안외워도 돼요", defaultTime: "4일", bgColor: "#F3F2FA", textColor: "#A99BF0", borderColor: "#D4CEFA" },
] as const;

export interface Intervals {
  again: string;
  hard: string;
  good: string;
  easy: string;
}

interface ResponseButtonsProps {
  onResponse?: (response: string) => void;
  intervals?: Intervals;
}

export function ResponseButtons({ onResponse, intervals }: ResponseButtonsProps) {
  return (
    <View className="flex-row gap-[10px] px-7">
      {RESPONSES.map(({ label, display, defaultTime, bgColor, textColor, borderColor }) => (
        <Pressable
          key={label}
          onPress={() => onResponse?.(label)}
          className="flex-1 aspect-square rounded-xl items-center justify-center"
          style={{
            backgroundColor: bgColor,
            borderWidth: 1.5,
            borderColor,
          }}
        >
          <Text className="text-body-sm font-bold text-center" style={{ color: textColor }}>
            {display}
          </Text>
          <Text className="text-mono-sm opacity-70 mt-[2px]" style={{ color: textColor }}>
            {intervals ? intervals[label.toLowerCase() as keyof Intervals] : defaultTime}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
