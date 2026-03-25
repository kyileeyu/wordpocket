export const colors = {
  bg: {
    primary: "#FAFAFE",
    elevated: "#FFFFFF",
    subtle: "#F3F2FA",
  },
  text: {
    primary: "#1A1A2E",
    secondary: "#6E6B7B",
    tertiary: "#B8B5C6",
  },
  accent: {
    DEFAULT: "#7C6CE7",
    hover: "#6A58D6",
    light: "#A99BF0",
    lighter: "#D4CEFA",
    bg: "#EDEAFC",
    bgSoft: "#F3F2FA",
  },
  danger: {
    DEFAULT: "#E55B5B",
    bg: "#FDECEC",
  },
  warning: {
    DEFAULT: "#E5A04B",
    bg: "#FDF3E8",
  },
  again: {
    DEFAULT: "#E55B7A",
    bg: "#FDE8EE",
  },
  success: {
    DEFAULT: "#4BA882",
    bg: "#E8F5EE",
  },
  border: {
    DEFAULT: "#E8E6F0",
    subtle: "#F0EEF6",
  },
} as const;

export const gradients = {
  brandSoft: ["#EDEAFC", "#F3F2FA"] as const,
  brandVivid: ["#7C6CE7", "#A99BF0", "#D4CEFA"] as const,
  progress: ["#EF74BB", "#AC89F6"] as const,
  glass: ["#EADFFD", "#FDE0EF"] as const,
} as const;

export const shadows = {
  sm: {
    shadowColor: "#1A1A2E",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: "#1A1A2E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: "#1A1A2E",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 6,
  },
  soft: {
    shadowColor: "#1A1A2E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
} as const;
