import React from "react";
import { View, Text, Pressable } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { cn } from "@/lib/utils";
import { colors } from "@/lib/theme";

interface SettingsRowProps {
  label: string;
  description?: string;
  value?: string | number;
  toggle?: boolean;
  toggleOn?: boolean;
  chevron?: boolean;
  danger?: boolean;
  noBorder?: boolean;
  onPress?: () => void;
}

export function SettingsRow({
  label,
  description,
  value,
  toggle,
  toggleOn,
  chevron,
  danger,
  noBorder,
  onPress,
}: SettingsRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "flex-row items-center justify-between py-3",
        !noBorder && "border-b border-border",
      )}
    >
      <View className="flex-1">
        <Text className={cn("text-body-md", danger ? "text-danger" : "text-text-primary")}>
          {label}
        </Text>
        {description && (
          <Text className="text-mono-sm text-text-secondary">{description}</Text>
        )}
      </View>
      <View className="flex-row items-center gap-1">
        {value !== undefined && (
          <Text className="font-mono text-[14px] font-bold text-text-primary">{value}</Text>
        )}
        {toggle && (
          <View
            className={cn(
              "w-11 h-[26px] rounded-full justify-center",
              toggleOn ? "bg-accent" : "bg-text-tertiary",
            )}
          >
            <View
              className={cn(
                "w-5 h-5 rounded-full bg-white absolute",
                toggleOn ? "left-[22px]" : "left-[3px]",
              )}
              style={{ top: 3 }}
            />
          </View>
        )}
        {chevron && <ChevronRight size={14} color={colors.text.tertiary} />}
      </View>
    </Pressable>
  );
}
