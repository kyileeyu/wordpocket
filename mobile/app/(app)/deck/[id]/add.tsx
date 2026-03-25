import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddCardPage() {
  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <View className="flex-1 items-center justify-center">
        <Text className="text-display-md font-display text-text-primary">카드 추가</Text>
        <Text className="text-body-lg text-text-secondary mt-2">구현 예정</Text>
      </View>
    </SafeAreaView>
  );
}
