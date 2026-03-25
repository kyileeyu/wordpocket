import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { ArrowLeft, FileText } from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { parseCsv, type CsvRow } from "@/lib/csvParser";
import { colors } from "@/lib/theme";

export default function FolderCsvImportPage() {
  const { id: folderId } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const groups = useMemo(() => {
    const map = new Map<string, CsvRow[]>();
    rows.forEach((r) => {
      const key = r.deck || "기본";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    });
    return Array.from(map.entries()).sort(([a], [b]) => {
      const na = parseInt(a.match(/\d+/)?.[0] ?? "999");
      const nb = parseInt(b.match(/\d+/)?.[0] ?? "999");
      return na - nb;
    });
  }, [rows]);

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: "text/comma-separated-values" });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    setFileName(asset.name);
    const content = await FileSystem.readAsStringAsync(asset.uri);
    setRows(parseCsv(content));
  };

  const handleImport = async () => {
    if (groups.length === 0 || !user) return;
    setImporting(true);
    let totalCards = 0;
    for (const [deckName, deckRows] of groups) {
      const { data: deck, error: deckErr } = await supabase
        .from("decks")
        .insert({ user_id: user.id, folder_id: folderId!, name: deckName })
        .select()
        .single();
      if (deckErr || !deck) continue;

      const cards = deckRows.map((r) => ({
        deck_id: deck.id,
        word: r.word,
        meaning: r.meaning,
        example: r.example ?? null,
        pronunciation: r.pronunciation ?? null,
        tags: r.tags?.split(";").map((t) => t.trim()).filter(Boolean) ?? [],
        synonyms: r.synonyms?.split(";").map((s) => s.trim()).filter(Boolean) ?? [],
      }));
      const { error: cardsErr } = await supabase.from("cards").insert(cards);
      if (!cardsErr) totalCards += cards.length;
    }
    setImporting(false);
    Alert.alert("완료", `${groups.length}개 카드뭉치, ${totalCards}장 가져오기 완료`, [
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
        <Pressable onPress={pickFile} className="border-2 border-dashed border-border rounded-xl p-8 items-center">
          <FileText size={40} color={colors.text.tertiary} />
          <Text className="text-body-md text-text-secondary mt-3">{fileName ?? "CSV 파일 선택"}</Text>
          <Text className="text-caption text-text-tertiary mt-1">word, meaning, deck 열 필수</Text>
        </Pressable>

        {groups.length > 0 && (
          <>
            <Text className="text-body-sm text-text-secondary">
              {groups.length}개 카드뭉치 · {rows.length}장
            </Text>
            {groups.map(([name, deckRows]) => (
              <View key={name} className="rounded-xl bg-bg-elevated p-4">
                <Text className="text-body-md font-semibold text-text-primary">{name}</Text>
                <Text className="text-caption text-text-secondary">{deckRows.length}장</Text>
              </View>
            ))}
            <Button variant="solid" size="lg" className="w-full" onPress={handleImport} loading={importing}>
              {importing ? "가져오는 중..." : "가져오기"}
            </Button>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
