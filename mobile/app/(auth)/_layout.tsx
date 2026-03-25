import React from "react";
import { Redirect, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/authStore";

export default function AuthLayout() {
  const { user, initialized } = useAuthStore();

  if (!initialized) return null;
  if (user) return <Redirect href="/(app)/(tabs)" />;

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaView>
  );
}
