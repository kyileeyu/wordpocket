import React from "react";
import { View, Text } from "react-native";
import { Link } from "expo-router";
import { Button } from "@/components/ui/Button";

export default function WelcomePage() {
  return (
    <View className="flex-1 items-center justify-center px-6 bg-bg-primary">
      <Text className="text-display-xl font-display text-accent mb-2">
        WordPocket
      </Text>
      <Text className="text-body-lg text-text-secondary mb-12 text-center">
        나만의 단어장으로{"\n"}효율적인 암기를 시작하세요
      </Text>

      <View className="w-full gap-3">
        <Link href="/(auth)/login" asChild>
          <Button variant="solid" size="lg">
            로그인
          </Button>
        </Link>
        <Link href="/(auth)/signup" asChild>
          <Button variant="outline" size="lg">
            회원가입
          </Button>
        </Link>
      </View>
    </View>
  );
}
