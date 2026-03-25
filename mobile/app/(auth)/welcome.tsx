import React from "react";
import { View, Text } from "react-native";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "@/components/ui/Button";
import { gradients } from "@/lib/theme";

export default function WelcomePage() {
  return (
    <LinearGradient
      colors={[gradients.brandVivid[0], gradients.brandVivid[1], gradients.brandVivid[2]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1 justify-center px-8"
    >
      <View className="items-center mb-12">
        <Text className="text-display-xl font-display text-white mb-1">
          WordPocket
        </Text>
        <Text className="text-body-md text-white/80 text-center">
          단어를 주머니에 넣듯,{"\n"}매일 조금씩 꺼내 익히세요.
        </Text>
      </View>

      <View className="gap-[10px]">
        <Link href="/(auth)/signup" asChild>
          <Button variant="outline" size="lg" className="border-white bg-white">
            <Text className="text-accent font-semibold text-body-lg">시작하기</Text>
          </Button>
        </Link>
        <Link href="/(auth)/login" asChild>
          <Button variant="ghost" size="default">
            <Text className="text-caption text-white/80">
              이미 계정이 있나요?{" "}
              <Text className="text-white font-bold">로그인</Text>
            </Text>
          </Button>
        </Link>
      </View>
    </LinearGradient>
  );
}
