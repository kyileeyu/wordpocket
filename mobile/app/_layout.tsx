import "../global.css";
import React, { useEffect, useCallback } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useAuthStore } from "@/stores/authStore";

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);

  const [fontsLoaded] = useFonts({
    Outfit: require("../assets/fonts/Outfit-Variable.ttf"),
    Pretendard: require("../assets/fonts/Pretendard-Variable.ttf"),
    JetBrainsMono: require("../assets/fonts/JetBrainsMono-Variable.ttf"),
  });

  useEffect(() => {
    initialize();
  }, [initialize]);

  const onLayoutRootView = useCallback(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
          <Stack.Screen name="reset-password/update" />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
