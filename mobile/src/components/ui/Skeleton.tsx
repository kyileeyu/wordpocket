import React, { useEffect, useRef } from "react";
import { Animated, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends ViewProps {
  className?: string;
}

export function Skeleton({ className, style, ...props }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      className={cn("rounded-md bg-bg-subtle", className)}
      style={[{ opacity }, style]}
      {...props}
    />
  );
}
