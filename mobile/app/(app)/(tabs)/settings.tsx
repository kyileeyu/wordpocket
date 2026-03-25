import React from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  const { signOut, user } = useAuthStore();

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <View className="flex-1 px-6 pt-6">
        <Text className="text-display-md font-display text-text-primary mb-6">
          설정
        </Text>

        <View className="bg-bg-elevated rounded-xl p-4 mb-4">
          <Text className="text-body-sm text-text-secondary">로그인 계정</Text>
          <Text className="text-body-lg text-text-primary mt-1">
            {user?.email}
          </Text>
        </View>

        <Button variant="destructive" onPress={signOut}>
          로그아웃
        </Button>
      </View>
    </SafeAreaView>
  );
}
