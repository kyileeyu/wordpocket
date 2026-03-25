import React from "react";
import { Text, type TextProps } from "react-native";
import { cn } from "@/lib/utils";

export interface LabelProps extends TextProps {
  children: React.ReactNode;
}

export function Label({ className, children, ...props }: LabelProps) {
  return (
    <Text
      className={cn("text-overline font-mono tracking-[2px] uppercase text-text-secondary", className)}
      {...props}
    >
      {children}
    </Text>
  );
}
