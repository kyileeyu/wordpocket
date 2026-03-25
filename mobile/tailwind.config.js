/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "bg-primary": "#FAFAFE",
        "bg-elevated": "#FFFFFF",
        "bg-subtle": "#F3F2FA",

        "text-primary": "#1A1A2E",
        "text-secondary": "#6E6B7B",
        "text-tertiary": "#B8B5C6",

        accent: "#7C6CE7",
        "accent-hover": "#6A58D6",
        "accent-light": "#A99BF0",
        "accent-lighter": "#D4CEFA",
        "accent-bg": "#EDEAFC",
        "accent-bg-soft": "#F3F2FA",

        danger: "#E55B5B",
        "danger-bg": "#FDECEC",

        warning: "#E5A04B",
        "warning-bg": "#FDF3E8",

        again: "#E55B7A",
        "again-bg": "#FDE8EE",

        success: "#4BA882",
        "success-bg": "#E8F5EE",

        border: "#E8E6F0",
        "border-subtle": "#F0EEF6",
      },
      fontFamily: {
        display: ["Outfit"],
        body: ["Outfit"],
        korean: ["Pretendard"],
        mono: ["JetBrainsMono"],
      },
      fontSize: {
        "display-xl": ["32px", { lineHeight: "1.2", fontWeight: "700" }],
        "display-lg": ["30px", { lineHeight: "1.2", fontWeight: "700" }],
        "display-md": ["20px", { lineHeight: "1.25", fontWeight: "600" }],
        "stat-value": ["18px", { lineHeight: "1.2", fontWeight: "700" }],
        "body-lg": ["14px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["13px", { lineHeight: "1.5", fontWeight: "400" }],
        "body-sm": ["12px", { lineHeight: "1.4", fontWeight: "500" }],
        caption: ["11px", { lineHeight: "1.4", fontWeight: "400" }],
        "mono-md": ["12px", { lineHeight: "1.4", fontWeight: "400" }],
        "mono-sm": ["10px", { lineHeight: "1.4", fontWeight: "400" }],
        overline: ["8px", { lineHeight: "1.2", fontWeight: "400", letterSpacing: "2px" }],
        nav: ["9px", { lineHeight: "1.2", fontWeight: "500" }],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "32px",
        icon: "10px",
      },
    },
  },
  plugins: [],
};
