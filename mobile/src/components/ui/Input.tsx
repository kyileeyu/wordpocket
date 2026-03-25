import React from "react";
import { TextInput, type TextInputProps } from "react-native";
import { cn } from "@/lib/utils";

export interface InputProps extends TextInputProps {}

export function Input({ className, ...props }: InputProps) {
  return (
    <TextInput
      className={cn(
        "h-11 w-full rounded-md border border-border bg-bg-subtle px-[14px] py-[11px] text-body-md text-text-primary",
        className,
      )}
      placeholderTextColor="#B8B5C6"
      {...props}
    />
  );
}
