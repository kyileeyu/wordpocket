import React from "react";
import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "@/stores/authStore";

export default function AppLayout() {
  const { user, initialized } = useAuthStore();

  if (!initialized) return null;
  if (!user) return <Redirect href="/(auth)/welcome" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="folder/[id]" />
      <Stack.Screen name="deck/[id]/index" />
      <Stack.Screen name="deck/[id]/add" />
      <Stack.Screen name="deck/[id]/edit/[cardId]" />
      <Stack.Screen name="deck/[id]/import" />
      <Stack.Screen name="deck/[id]/photo-import" />
      <Stack.Screen name="folder/[id]/import" />
      <Stack.Screen name="study/[deckId]" />
      <Stack.Screen name="study/folder/[folderId]" />
      <Stack.Screen name="study/complete" />
      <Stack.Screen name="change-password" />
    </Stack>
  );
}
