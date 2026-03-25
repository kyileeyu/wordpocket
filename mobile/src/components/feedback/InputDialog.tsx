import React, { useState, useEffect } from "react";
import { View, Text, Modal, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { X } from "lucide-react-native";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { colors } from "@/lib/theme";

interface InputDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  placeholder: string;
  submitLabel: string;
  onSubmit: (value: string) => void;
  loading?: boolean;
}

export function InputDialog({
  open,
  onClose,
  title,
  placeholder,
  submitLabel,
  onSubmit,
  loading,
}: InputDialogProps) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (open) setValue("");
  }, [open]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        className="flex-1 justify-center items-center"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ backgroundColor: "rgba(26,26,46,0.4)" }}
      >
        <View className="bg-bg-elevated rounded-2xl p-6 mx-6 w-[340px] max-w-full">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-display-md font-display text-text-primary">{title}</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={20} color={colors.text.tertiary} />
            </Pressable>
          </View>
          <Input
            value={value}
            onChangeText={setValue}
            placeholder={placeholder}
            autoFocus
            onSubmitEditing={handleSubmit}
            returnKeyType="done"
          />
          <Button
            variant="solid"
            className="w-full mt-4"
            onPress={handleSubmit}
            loading={loading}
          >
            {submitLabel}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
