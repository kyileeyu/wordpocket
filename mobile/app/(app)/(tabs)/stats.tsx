import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StatsPage() {
  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-display-md font-display text-text-primary">
          통계
        </Text>
        <Text className="text-body-lg text-text-secondary mt-2">
          Phase 4에서 구현
        </Text>
      </View>
    </SafeAreaView>
  );
}
