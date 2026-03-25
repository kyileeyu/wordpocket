import React, { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useAuthStore } from "@/stores/authStore";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { resetPassword, loading } = useAuthStore();

  const handleReset = async () => {
    setError(null);
    const { error: err } = await resetPassword(email.trim());
    if (err) {
      setError(err);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <View className="flex-1 items-center justify-center px-6 bg-bg-primary">
        <Text className="text-display-md font-display text-text-primary mb-4">
          이메일을 확인하세요
        </Text>
        <Text className="text-body-lg text-text-secondary text-center mb-8">
          비밀번호 재설정 링크를 보냈습니다.{"\n"}
          이메일을 확인해 주세요.
        </Text>
        <Button variant="solid" size="lg" className="w-full" onPress={() => router.back()}>
          돌아가기
        </Button>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerClassName="flex-1 justify-center px-6"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-display-md font-display text-text-primary mb-2">
          비밀번호 찾기
        </Text>
        <Text className="text-body-lg text-text-secondary mb-8">
          가입한 이메일 주소를 입력하면{"\n"}비밀번호 재설정 링크를 보내드립니다.
        </Text>

        <View className="gap-1.5 mb-6">
          <Label>이메일</Label>
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="이메일 주소"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        {error && (
          <Text className="text-danger text-body-sm mb-4">{error}</Text>
        )}

        <Button variant="solid" size="lg" onPress={handleReset} loading={loading}>
          재설정 링크 보내기
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
