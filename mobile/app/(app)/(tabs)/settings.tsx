import React, { useState } from "react";
import { View, Text, ScrollView, Modal, KeyboardAvoidingView, Platform, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { X } from "lucide-react-native";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SettingsRow } from "@/components/forms/SettingsRow";
import { useAuthStore } from "@/stores/authStore";
import { useUserSettings, useUpdateUserSettings } from "@/hooks/useUserSettings";
import { colors } from "@/lib/theme";

type EditField = "new_cards_per_day" | "leech_threshold" | "max_interval";

const FIELD_CONFIG: Record<EditField, { label: string; min: number; max: number }> = {
  new_cards_per_day: { label: "하루 새 카드 수", min: 1, max: 9999 },
  leech_threshold: { label: "리치 임계값", min: 2, max: 99 },
  max_interval: { label: "최대 복습 간격", min: 1, max: 3650 },
};

export default function SettingsPage() {
  const { user, signOut } = useAuthStore();
  const { data: settings } = useUserSettings();
  const updateSettings = useUpdateUserSettings();

  const [editField, setEditField] = useState<EditField | null>(null);
  const [editValue, setEditValue] = useState("");

  const openEdit = (field: EditField) => {
    setEditField(field);
    setEditValue(String(settings?.[field] ?? ""));
  };

  const handleSave = () => {
    if (!editField) return;
    const config = FIELD_CONFIG[editField];
    const num = parseInt(editValue, 10);
    if (isNaN(num) || num < config.min || num > config.max) return;
    updateSettings.mutate({ [editField]: num });
    setEditField(null);
  };

  const handleSignOut = () => {
    Alert.alert("로그아웃", "정말 로그아웃하시겠습니까?", [
      { text: "취소", style: "cancel" },
      { text: "로그아웃", style: "destructive", onPress: () => signOut() },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-12 gap-5">
        {/* Header */}
        <View>
          <Text className="text-display-xl font-display text-text-primary mb-1">설정</Text>
          <Text className="text-caption text-text-secondary">{user?.email ?? ""}</Text>
        </View>

        {/* Learning Section */}
        <View>
          <Label>학습</Label>
          <SettingsRow
            label="하루 새 카드 수"
            value={settings?.new_cards_per_day ?? 20}
            onPress={() => openEdit("new_cards_per_day")}
          />
          <SettingsRow
            label="리치 임계값"
            description="Again 반복 시 알림"
            value={settings?.leech_threshold ?? 5}
            onPress={() => openEdit("leech_threshold")}
          />
          <SettingsRow
            label="최대 복습 간격"
            description="이 이상 간격이 벌어지지 않음"
            value={`${settings?.max_interval ?? 365}일`}
            onPress={() => openEdit("max_interval")}
          />
        </View>

        {/* Account Section */}
        <View>
          <Label>계정</Label>
          <SettingsRow
            label="비밀번호 변경"
            chevron
            onPress={() => router.push("/(app)/change-password")}
          />
          <SettingsRow label="로그아웃" danger noBorder onPress={handleSignOut} />
        </View>
      </ScrollView>

      {/* Edit Dialog */}
      <Modal visible={!!editField} transparent animationType="fade" onRequestClose={() => setEditField(null)}>
        <KeyboardAvoidingView
          className="flex-1 justify-center items-center"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ backgroundColor: "rgba(26,26,46,0.4)" }}
        >
          <View className="bg-bg-elevated rounded-2xl p-6 mx-6 w-[340px] max-w-full">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-display-md font-display text-text-primary">
                {editField && FIELD_CONFIG[editField].label}
              </Text>
              <Pressable onPress={() => setEditField(null)} hitSlop={8}>
                <X size={20} color={colors.text.tertiary} />
              </Pressable>
            </View>
            <Input
              value={editValue}
              onChangeText={setEditValue}
              keyboardType="number-pad"
              autoFocus
              onSubmitEditing={handleSave}
              returnKeyType="done"
            />
            <Button
              variant="solid"
              className="w-full mt-4"
              onPress={handleSave}
              loading={updateSettings.isPending}
            >
              저장
            </Button>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
