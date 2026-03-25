import React, { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Pressable } from "react-native";
import { Link, router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useAuthStore } from "@/stores/authStore";
import { colors } from "@/lib/theme";

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
      <Pressable onPress={() => router.back()} className="px-4 py-3">
        <ArrowLeft size={24} color={colors.text.primary} />
      </Pressable>

      <ScrollView
        contentContainerClassName="flex-1 justify-center px-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-8">
          <Text className="text-display-xl font-display text-text-primary mb-[6px]">
            다시 만나서 반가워요
          </Text>
          <Text className="text-caption text-text-secondary">
            이메일과 비밀번호를 입력해주세요.
          </Text>
        </View>

        {error && (
          <View className="bg-danger-bg px-3 py-2 rounded-lg mb-4">
            <Text className="text-danger text-caption">{error}</Text>
          </View>
        )}

        <View className="gap-[10px] mb-4">
          <View>
            <Label>이메일</Label>
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="user@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>
          <View>
            <Label>비밀번호</Label>
            <Input
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              autoComplete="password"
            />
          </View>
        </View>

        <View className="items-end mb-4">
          <Link href="/(auth)/forgot-password">
            <Text className="text-caption text-text-secondary">비밀번호를 잊으셨나요?</Text>
          </Link>
        </View>

        <Button variant="default" size="lg" onPress={handleLogin} loading={loading} className="w-full">
          {loading ? "로그인 중..." : "로그인"}
        </Button>

        <Link href="/(auth)/signup" asChild>
          <Pressable className="mt-4 items-center">
            <Text className="text-caption text-text-secondary">
              계정이 없나요?{" "}
              <Text className="text-accent font-bold">회원가입</Text>
            </Text>
          </Pressable>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
