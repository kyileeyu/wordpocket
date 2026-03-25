import React from "react";
import { View, type ViewProps } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { cn } from "@/lib/utils";
import { gradients } from "@/lib/theme";

export interface ProgressProps extends ViewProps {
  value: number;
  max?: number;
}

export function Progress({ value, max = 100, className, ...props }: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <View
      className={cn("h-2 w-full rounded-full bg-bg-subtle overflow-hidden", className)}
      {...props}
    >
      <LinearGradient
        colors={[gradients.progress[0], gradients.progress[1]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ width: `${percentage}%`, height: "100%", borderRadius: 9999 }}
      />
    </View>
  );
}
