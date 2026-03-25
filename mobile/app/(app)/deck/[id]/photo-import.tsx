import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Image, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { ArrowLeft, Camera, ImageIcon } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { Button } from "@/components/ui/Button";
import { useExtractWords, type ExtractedWord } from "@/hooks/useExtractWords";
import { useCreateCard } from "@/hooks/useCards";
import { colors } from "@/lib/theme";

export default function PhotoImportPage() {
  const { id: deckId } = useLocalSearchParams<{ id: string }>();
  const extractWords = useExtractWords();
  const createCard = useCreateCard();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [words, setWords] = useState<ExtractedWord[]>([]);
  const [importing, setImporting] = useState(false);
  const [step, setStep] = useState<"upload" | "extracting" | "review">("upload");

  const pickImage = async (useCamera: boolean) => {
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ["images"],
      quality: 0.8,
      base64: true,
    };
    const result = useCamera
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    setImageUri(asset.uri);
    setStep("extracting");

    try {
      const extracted = await extractWords.mutateAsync(asset.base64!);
      setWords(extracted);
      setStep("review");
    } catch {
      Alert.alert("오류", "단어 추출에 실패했습니다.");
      setStep("upload");
    }
  };

  const handleImport = async () => {
    if (words.length === 0) return;
    setImporting(true);
    let count = 0;
    for (const word of words) {
      try {
        await createCard.mutateAsync({
          deck_id: deckId!,
          word: word.word,
          meaning: word.meaning,
          example: word.example || null,
          pronunciation: word.pronunciation || null,
          synonyms: word.synonyms?.filter(Boolean) ?? [],
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
          사진으로 가져오기
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-8 gap-5">
        {step === "upload" && (
          <View className="gap-3">
            <Pressable
              onPress={() => pickImage(true)}
              className="border-2 border-dashed border-border rounded-xl p-8 items-center"
            >
              <Camera size={40} color={colors.text.tertiary} />
              <Text className="text-body-md text-text-secondary mt-3">카메라로 촬영</Text>
            </Pressable>
            <Pressable
              onPress={() => pickImage(false)}
              className="border-2 border-dashed border-border rounded-xl p-8 items-center"
            >
              <ImageIcon size={40} color={colors.text.tertiary} />
              <Text className="text-body-md text-text-secondary mt-3">앨범에서 선택</Text>
            </Pressable>
          </View>
        )}

        {step === "extracting" && (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
            <Text className="text-body-md text-text-secondary mt-4">
              AI가 단어를 추출하고 있습니다...
            </Text>
            {imageUri && (
              <Image source={{ uri: imageUri }} className="w-48 h-48 rounded-xl mt-4" resizeMode="cover" />
            )}
          </View>
        )}

        {step === "review" && (
          <>
            <Text className="text-body-sm text-text-secondary">
              {words.length}개 단어 추출됨
            </Text>
            <View className="rounded-xl bg-bg-elevated overflow-hidden">
              {words.map((word, i) => (
                <View key={i} className={`px-4 py-3 ${i < words.length - 1 ? "border-b border-border" : ""}`}>
                  <Text className="text-body-md font-semibold text-text-primary">{word.word}</Text>
                  <Text className="text-caption text-text-secondary">{word.meaning}</Text>
                  {word.example && <Text className="text-caption text-text-tertiary mt-1">{word.example}</Text>}
                </View>
              ))}
            </View>
            <Button variant="solid" size="lg" className="w-full" onPress={handleImport} loading={importing}>
              {importing ? "가져오는 중..." : `${words.length}장 가져오기`}
            </Button>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
