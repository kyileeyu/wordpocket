import React, { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Pressable, Alert } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabase";
import { colors } from "@/lib/theme";

export default function ChangePasswordPage() {
  const { user, updatePassword } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);

    if (newPassword.length < 8) {
      setError("새 비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user!.email!,
      password: currentPassword,
    });

    if (signInError) {
      setLoading(false);
      setError("현재 비밀번호가 올바르지 않습니다.");
      return;
    }

    const { error: updateError } = await updatePassword(newPassword);
    setLoading(false);

    if (updateError) {
      setError(updateError);
    } else {
      Alert.alert("완료", "비밀번호가 변경되었습니다", [
        { text: "확인", onPress: () => router.back() },
      ]);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <Pressable onPress={() => router.back()} className="px-4 py-3">
        <ArrowLeft size={24} color={colors.text.primary} />
      </Pressable>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerClassName="px-6 pb-8"
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-8">
            <Text className="text-display-xl font-display text-text-primary mb-[6px]">
              비밀번호 변경
            </Text>
            <Text className="text-caption text-text-secondary">
              현재 비밀번호를 확인한 후 변경합니다.
            </Text>
          </View>

          {error && (
            <View className="bg-danger-bg px-3 py-2 rounded-lg mb-4">
              <Text className="text-danger text-caption">{error}</Text>
            </View>
          )}

          <View className="gap-[10px] mb-6">
            <View>
              <Label>현재 비밀번호</Label>
              <Input
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                autoFocus
              />
            </View>
            <View>
              <Label>새 비밀번호</Label>
              <Input
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="8자 이상"
                secureTextEntry
              />
            </View>
            <View>
              <Label>새 비밀번호 확인</Label>
              <Input
                value={newPasswordConfirm}
                onChangeText={setNewPasswordConfirm}
                placeholder="다시 한번 입력"
                secureTextEntry
              />
            </View>
          </View>

          <Button variant="default" size="lg" onPress={handleSubmit} loading={loading} className="w-full">
            {loading ? "변경 중..." : "비밀번호 변경"}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
