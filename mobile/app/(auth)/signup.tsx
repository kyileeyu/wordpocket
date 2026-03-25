import React, { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Link, router } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useAuthStore } from "@/stores/authStore";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { signUp, loading } = useAuthStore();

  const handleSignup = async () => {
    setError(null);
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }
    const { error: err } = await signUp(email.trim(), password);
    if (err) {
      setError(err);
    } else {
      router.replace("/(auth)/verify");
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
          회원가입
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
              placeholder="6자 이상"
              secureTextEntry
              autoComplete="new-password"
            />
          </View>

          <View className="gap-1.5">
            <Label>비밀번호 확인</Label>
            <Input
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="비밀번호 다시 입력"
              secureTextEntry
              autoComplete="new-password"
            />
          </View>
        </View>

        {error && (
          <Text className="text-danger text-body-sm mb-4">{error}</Text>
        )}

        <Button variant="solid" size="lg" onPress={handleSignup} loading={loading}>
          가입하기
        </Button>

        <View className="flex-row items-center justify-center mt-4">
          <Text className="text-body-sm text-text-secondary">이미 계정이 있으신가요? </Text>
          <Link href="/(auth)/login">
            <Text className="text-body-sm text-accent">로그인</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
