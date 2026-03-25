import React from "react";
import { Pressable, Text, ActivityIndicator, type PressableProps } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { gradients } from "@/lib/theme";

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
      size: {
        default: "h-12 px-4 py-3",
        sm: "h-9 px-3",
        lg: "h-[52px] px-4 py-[14px]",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
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
}

export function Button({
  className,
  variant = "default",
  size = "default",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

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
        className={cn("rounded-full overflow-hidden", isDisabled && "opacity-50")}
        {...props}
      >
        <LinearGradient
          colors={[gradients.glass[0], gradients.glass[1]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className={cn(buttonVariants({ variant: "default", size }), className)}
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
        buttonVariants({ variant, size }),
        isDisabled && "opacity-50",
        className,
      )}
      {...props}
    >
      {content}
    </Pressable>
  );
}
