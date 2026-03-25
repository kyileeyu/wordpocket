import React from "react";
import { View, Text, Modal, Pressable } from "react-native";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react-native";
import { colors } from "@/lib/theme";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  onConfirm: () => void;
  loading?: boolean;
}

export function ConfirmDialog({ open, onClose, title, description, onConfirm, loading }: ConfirmDialogProps) {
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: "rgba(26,26,46,0.4)" }}
      >
        <View className="bg-bg-elevated rounded-2xl p-6 mx-6 w-[340px] max-w-full">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-display-md font-display text-text-primary">{title}</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={20} color={colors.text.tertiary} />
            </Pressable>
          </View>
          <Text className="text-body-sm text-text-secondary mb-6">{description}</Text>
          <View className="flex-row gap-3">
            <Button variant="secondary" className="flex-1" onPress={onClose}>
              취소
            </Button>
            <Button variant="destructive" className="flex-1" onPress={onConfirm} loading={loading}>
              삭제
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}
