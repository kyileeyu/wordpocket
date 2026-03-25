import React from "react";
import { Pressable, Text, ActivityIndicator, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { gradients } from "@/lib/theme";

const sizeStyles = {
  default: { height: 48, paddingHorizontal: 16 },
  sm: { height: 36, paddingHorizontal: 12 },
  lg: { height: 52, paddingHorizontal: 16 },
  icon: { height: 36, width: 36 },
} as const;

const buttonVariants = cva(
  "flex-row items-center justify-center gap-2 rounded-full",
  {
    variants: {
      variant: {
        default: "",
        solid: "bg-accent",
        secondary: "bg-bg-subtle",
        ghost: "",
        destructive: "bg-danger",
        outline: "border border-border bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const textVariants = cva("font-semibold text-center", {
  variants: {
    variant: {
      default: "text-text-primary",
      solid: "text-white",
      secondary: "text-text-secondary",
      ghost: "text-text-secondary",
      destructive: "text-white",
      outline: "text-text-primary",
    },
    size: {
      default: "text-body-sm",
      sm: "text-caption",
      lg: "text-body-lg",
      icon: "text-body-sm",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface ButtonProps
  extends Omit<PressableProps, "children">,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  loading?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
}

export function Button({
  className,
  variant = "default",
  size = "default",
  loading = false,
  disabled,
  children,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const sizeStyle = sizeStyles[size ?? "default"];
  const isFull = className?.includes("w-full");

  const content = (
    <>
      {loading && <ActivityIndicator size="small" color={variant === "solid" || variant === "destructive" ? "#fff" : "#7C6CE7"} />}
      {typeof children === "string" ? (
        <Text className={cn(textVariants({ variant, size }))}>
          {children}
        </Text>
      ) : (
        children
      )}
    </>
  );

  if (variant === "default") {
    return (
      <Pressable
        disabled={isDisabled}
        className={cn(isDisabled && "opacity-50")}
        style={[{ borderRadius: 9999, overflow: "hidden" }, sizeStyle, isFull && { width: "100%" }, style as StyleProp<ViewStyle>]}
        {...props}
      >
        <LinearGradient
          colors={[gradients.glass[0], gradients.glass[1]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            borderRadius: 9999,
          }}
        >
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      disabled={isDisabled}
      className={cn(
        buttonVariants({ variant }),
        isDisabled && "opacity-50",
      )}
      style={[sizeStyle, { borderRadius: 9999 }, isFull && { width: "100%" }, style as StyleProp<ViewStyle>]}
      {...props}
    >
      {content}
    </Pressable>
  );
}
