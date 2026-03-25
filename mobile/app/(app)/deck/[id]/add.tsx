import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { X } from "lucide-react-native";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useCreateCard } from "@/hooks/useCards";
import { colors } from "@/lib/theme";

export default function AddCardPage() {
  const { id: deckId } = useLocalSearchParams<{ id: string }>();
  const createCard = useCreateCard();

  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [example, setExample] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [synonyms, setSynonyms] = useState("");
  const [tags, setTags] = useState("");

  const loading = createCard.isPending;

  const handleSubmit = () => {
    if (!word.trim() || !meaning.trim()) return;
    createCard.mutate(
      {
        deck_id: deckId!,
        word: word.trim(),
        meaning: meaning.trim(),
        example: example.trim() || null,
        pronunciation: pronunciation.trim() || null,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        synonyms: synonyms.split(",").map((s) => s.trim()).filter(Boolean),
      },
      {
        onSuccess: () => {
          Alert.alert("완료", `${word.trim()} 추가 완료`);
          setWord(""); setMeaning(""); setExample("");
          setPronunciation(""); setSynonyms(""); setTags("");
        },
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <X size={24} color={colors.text.primary} />
        </Pressable>
        <Text className="text-body-md font-semibold text-text-primary">카드 추가</Text>
        <Pressable onPress={handleSubmit} disabled={loading}>
          <Text className="text-caption font-semibold text-accent">
            {loading ? "저장 중..." : "저장"}
          </Text>
        </Pressable>
      </View>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerClassName="px-6 pb-8 gap-[10px]" keyboardShouldPersistTaps="handled">
          <View><Label>단어 *</Label><Input value={word} onChangeText={setWord} placeholder="apple" autoFocus /></View>
          <View><Label>뜻 *</Label><Input value={meaning} onChangeText={setMeaning} placeholder="사과" /></View>
          <View><Label>예문</Label><Input value={example} onChangeText={setExample} placeholder="I ate an apple." /></View>
          <View><Label>발음</Label><Input value={pronunciation} onChangeText={setPronunciation} placeholder="/ˈæp.əl/" /></View>
          <View><Label>유의어</Label><Input value={synonyms} onChangeText={setSynonyms} placeholder="쉼표로 구분" /></View>
          <View><Label>태그</Label><Input value={tags} onChangeText={setTags} placeholder="쉼표로 구분" /></View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
