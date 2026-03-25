import React from "react";
import { Pressable } from "react-native";
import { Plus } from "lucide-react-native";
import { shadows } from "@/lib/theme";

interface FABProps {
  onPress: () => void;
}

export function FAB({ onPress }: FABProps) {
  return (
    <Pressable
      onPress={onPress}
      className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-accent items-center justify-center"
      style={shadows.md}
    >
      <Plus size={24} color="#FFFFFF" />
    </Pressable>
  );
}
