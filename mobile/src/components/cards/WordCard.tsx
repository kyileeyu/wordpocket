import React from "react";
import { View, Text, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { shadows, gradients } from "@/lib/theme";

interface WordCardProps {
  word: string;
  phonetic?: string;
  meaning?: string;
  example?: string;
  synonyms?: string[];
  tags?: string[];
  flipped: boolean;
  onFlip: () => void;
}

export function WordCard({ word, phonetic, meaning, example, synonyms, tags, flipped, onFlip }: WordCardProps) {
  const fontSize = word.length > 40 ? 18 : word.length > 20 ? 22 : 32;

  return (
    <Pressable
      onPress={onFlip}
      className="bg-bg-elevated rounded-2xl p-8 items-center justify-center w-full"
      style={[shadows.md, { minHeight: 380 }]}
    >
      {/* Word */}
      <Text
        className="text-text-primary text-center font-bold mb-1"
        style={{ fontSize }}
      >
        {word}
      </Text>

      {/* Phonetic */}
      {phonetic && (
        <Text className="text-mono-md text-text-secondary mb-[14px]">{phonetic}</Text>
      )}

      {flipped ? (
        <>
          {/* Divider */}
          <LinearGradient
            colors={[gradients.progress[0], gradients.progress[1]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="w-9 h-[3px] rounded-full mt-[10px] mb-[14px]"
          />

          {/* Meaning */}
          <Text className="text-[18px] font-medium text-text-primary text-center font-korean">
            {meaning}
          </Text>

          {/* Example */}
          {example && (
            <Text className="text-body-md text-text-tertiary mt-[10px] text-center">
              {example}
            </Text>
          )}

          {/* Synonyms */}
          {synonyms && synonyms.length > 0 && (
            <View className="flex-row flex-wrap items-center justify-center gap-2 mt-[10px]">
              {synonyms.map((syn, i) => (
                <View
                  key={syn}
                  className={`px-3 py-1 rounded-full ${i === 0 ? "bg-text-primary" : "bg-bg-subtle"}`}
                >
                  <Text className={`text-body-sm ${i === 0 ? "text-white" : "text-text-primary"}`}>
                    {syn}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </>
      ) : (
        <Text className="text-mono-sm text-text-tertiary mt-4">탭하여 뜻 확인</Text>
      )}

      {/* Tags */}
      {tags && tags.length > 0 && (
        <Text className="absolute bottom-4 right-4 text-caption text-text-tertiary">
          {tags.join(", ")}
        </Text>
      )}
    </Pressable>
  );
}
