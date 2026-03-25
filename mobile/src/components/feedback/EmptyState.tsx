import React from "react";
import { View, Text } from "react-native";
import { Button } from "@/components/ui/Button";

interface EmptyStateProps {
  icon: string;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, text, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="items-center py-8 px-7">
      <Text className="text-[40px] mb-3 opacity-60">{icon}</Text>
      <Text className="text-body-md text-text-secondary mb-4 text-center">{text}</Text>
      {actionLabel && onAction && (
        <Button variant="secondary" onPress={onAction}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
}
