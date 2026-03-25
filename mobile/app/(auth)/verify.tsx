import React from "react";
import { View, Text } from "react-native";
import { Link } from "expo-router";
import { Button } from "@/components/ui/Button";

export default function VerifyPage() {
  return (
    <View className="flex-1 items-center justify-center px-6 bg-bg-primary">
      <Text className="text-display-md font-display text-text-primary mb-4">
        이메일을 확인하세요
      </Text>
      <Text className="text-body-lg text-text-secondary text-center mb-8">
        가입하신 이메일로 인증 링크를 보냈습니다.{"\n"}
        이메일을 확인하고 링크를 클릭해 주세요.
      </Text>

      <Link href="/(auth)/login" asChild>
        <Button variant="solid" size="lg" className="w-full">
          로그인 화면으로
        </Button>
      </Link>
    </View>
  );
}
