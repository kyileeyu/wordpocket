import React, { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Pressable, Alert } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useAuthStore } from "@/stores/authStore";

export default function ResetPasswordUpdatePage() {
  const { updatePassword, loading, session, initialized } = useAuthStore();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!initialized) {
    return (
      <SafeAreaView className="flex-1 bg-bg-primary items-center justify-center">
        <Text className="text-body-sm text-text-secondary">로딩 중...</Text>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView className="flex-1 bg-bg-primary items-center justify-center px-6">
        <Text className="text-caption text-text-secondary mb-4 text-center">
          유효하지 않거나 만료된 링크입니다.
        </Text>
        <Button
          variant="secondary"
          onPress={() => router.replace("/(auth)/forgot-password")}
        >
          비밀번호 재설정 다시 요청
        </Button>
      </SafeAreaView>
    );
  }

  const handleUpdate = async () => {
    setError(null);
    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    const { error: err } = await updatePassword(password);
    if (err) {
      setError(err);
    } else {
      Alert.alert("완료", "비밀번호가 변경되었습니다", [
        { text: "확인", onPress: () => router.replace("/(app)/(tabs)") },
      ]);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerClassName="flex-1 justify-center px-6"
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-8">
            <Text className="text-display-xl font-display text-text-primary mb-[6px]">
              새 비밀번호 설정
            </Text>
            <Text className="text-caption text-text-secondary">
              새로운 비밀번호를 입력해주세요.
            </Text>
          </View>

          {error && (
            <View className="bg-danger-bg px-3 py-2 rounded-lg mb-4">
              <Text className="text-danger text-caption">{error}</Text>
            </View>
          )}

          <View className="gap-[10px] mb-6">
            <View>
              <Label>새 비밀번호</Label>
              <Input
                value={password}
                onChangeText={setPassword}
                placeholder="8자 이상"
                secureTextEntry
                autoFocus
              />
            </View>
            <View>
              <Label>비밀번호 확인</Label>
              <Input
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="다시 한번 입력"
                secureTextEntry
              />
            </View>
          </View>

          <Button variant="default" size="lg" onPress={handleUpdate} loading={loading} className="w-full">
            {loading ? "변경 중..." : "비밀번호 변경"}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
