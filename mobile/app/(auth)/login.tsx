import React, { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Link, router } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useAuthStore } from "@/stores/authStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { signIn, loading } = useAuthStore();

  const handleLogin = async () => {
    setError(null);
    const { error: err } = await signIn(email.trim(), password);
    if (err) {
      setError(err);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerClassName="flex-1 justify-center px-6"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-display-md font-display text-text-primary mb-8">
          로그인
        </Text>

        <View className="gap-4 mb-6">
          <View className="gap-1.5">
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

          <View className="gap-1.5">
            <Label>비밀번호</Label>
            <Input
              value={password}
              onChangeText={setPassword}
              placeholder="비밀번호"
              secureTextEntry
              autoComplete="password"
            />
          </View>
        </View>

        {error && (
          <Text className="text-danger text-body-sm mb-4">{error}</Text>
        )}

        <Button variant="solid" size="lg" onPress={handleLogin} loading={loading}>
          로그인
        </Button>

        <View className="flex-row items-center justify-center mt-4 gap-1">
          <Link href="/(auth)/forgot-password">
            <Text className="text-body-sm text-accent">비밀번호 찾기</Text>
          </Link>
          <Text className="text-text-tertiary text-body-sm">|</Text>
          <Link href="/(auth)/signup">
            <Text className="text-body-sm text-accent">회원가입</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
