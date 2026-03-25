import React, { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useAuthStore } from "@/stores/authStore";

export default function ResetPasswordUpdatePage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { updatePassword, loading } = useAuthStore();

  const handleUpdate = async () => {
    setError(null);
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }
    const { error: err } = await updatePassword(password);
    if (err) {
      setError(err);
    } else {
      router.replace("/(app)/(tabs)");
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
          <Text className="text-display-md font-display text-text-primary mb-8">
            새 비밀번호 설정
          </Text>

          <View className="gap-4 mb-6">
            <View className="gap-1.5">
              <Label>새 비밀번호</Label>
              <Input
                value={password}
                onChangeText={setPassword}
                placeholder="6자 이상"
                secureTextEntry
              />
            </View>

            <View className="gap-1.5">
              <Label>비밀번호 확인</Label>
              <Input
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="비밀번호 다시 입력"
                secureTextEntry
              />
            </View>
          </View>

          {error && (
            <Text className="text-danger text-body-sm mb-4">{error}</Text>
          )}

          <Button variant="solid" size="lg" onPress={handleUpdate} loading={loading}>
            비밀번호 변경
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
