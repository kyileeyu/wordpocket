import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { ArrowLeft, FileText } from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Button } from "@/components/ui/Button";
import { useCreateCard } from "@/hooks/useCards";
import { parseCsv } from "@/lib/csvParser";
import { colors } from "@/lib/theme";

export default function CsvImportPage() {
  const { id: deckId } = useLocalSearchParams<{ id: string }>();
  const createCard = useCreateCard();
  const [rows, setRows] = useState<ReturnType<typeof parseCsv>>([]);
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: "text/comma-separated-values" });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    setFileName(asset.name);
    const content = await FileSystem.readAsStringAsync(asset.uri);
    const parsed = parseCsv(content);
    setRows(parsed);
  };

  const handleImport = async () => {
    if (rows.length === 0) return;
    setImporting(true);
    let count = 0;
    for (const row of rows) {
      try {
        await createCard.mutateAsync({
          deck_id: deckId!,
          word: row.word,
          meaning: row.meaning,
          example: row.example ?? null,
          pronunciation: row.pronunciation ?? null,
          tags: row.tags?.split(";").map((t) => t.trim()).filter(Boolean) ?? [],
          synonyms: row.synonyms?.split(";").map((s) => s.trim()).filter(Boolean) ?? [],
        });
        count++;
      } catch {}
    }
    setImporting(false);
    Alert.alert("완료", `${count}장 가져오기 완료`, [
      { text: "확인", onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text className="text-body-md font-semibold text-text-primary flex-1 text-center">
          CSV 가져오기
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-8 gap-5">
        <Pressable
          onPress={pickFile}
          className="border-2 border-dashed border-border rounded-xl p-8 items-center"
        >
          <FileText size={40} color={colors.text.tertiary} />
          <Text className="text-body-md text-text-secondary mt-3">
            {fileName ?? "CSV 파일 선택"}
          </Text>
          <Text className="text-caption text-text-tertiary mt-1">
            word, meaning 열 필수
          </Text>
        </Pressable>

        {rows.length > 0 && (
          <>
            <Text className="text-body-sm text-text-secondary">
              {rows.length}개 단어 발견 (미리보기: 처음 3개)
            </Text>
            <View className="rounded-xl bg-bg-elevated overflow-hidden">
              {rows.slice(0, 3).map((row, i) => (
                <View key={i} className={`px-4 py-3 ${i < 2 ? "border-b border-border" : ""}`}>
                  <Text className="text-body-md font-semibold text-text-primary">{row.word}</Text>
                  <Text className="text-caption text-text-secondary">{row.meaning}</Text>
                </View>
              ))}
            </View>

            <Button
              variant="solid"
              size="lg"
              className="w-full"
              onPress={handleImport}
              loading={importing}
            >
              {importing ? "가져오는 중..." : `${rows.length}장 가져오기`}
            </Button>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
