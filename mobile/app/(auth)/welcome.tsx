import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { gradients } from "@/lib/theme";

export default function WelcomePage() {
  return (
    <LinearGradient
      colors={[
        gradients.brandVivid[0],
        gradients.brandVivid[1],
        gradients.brandVivid[2],
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1, justifyContent: "center", paddingHorizontal: 32 }}
    >
      <View style={{ alignItems: "center", marginBottom: 48 }}>
        <Image
          source={require("../../assets/mascot.png")}
          style={{ width: 300, height: 300 }}
          resizeMode="contain"
        />
        <Text
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.8)",
            textAlign: "center",
            lineHeight: 20,
          }}
        >
          두꺼운 단어장 대신, 어느새 다 외워봄.
        </Text>
      </View>

      <View style={{ gap: 10 }}>
        {/* 시작하기 */}
        <Pressable
          onPress={() => router.push("/(auth)/signup")}
          style={{
            height: 52,
            borderRadius: 9999,
            backgroundColor: "#fff",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#7C6CE7" }}>
            시작하기
          </Text>
        </Pressable>

        {/* 로그인 */}
        <Pressable
          onPress={() => router.push("/(auth)/login")}
          style={{ alignItems: "center", paddingVertical: 12 }}
        >
          <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>
            이미 계정이 있나요?{" "}
            <Text style={{ color: "#fff", fontWeight: "700" }}>로그인</Text>
          </Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}
