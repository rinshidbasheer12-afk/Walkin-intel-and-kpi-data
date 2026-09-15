export const design = {
  colors: {
    ink: "#172033",
    background: "#F7F9FC",
    surface: "#FFFFFF",
    mist: "#EEF4FB",
    line: "#E3EAF3",
    muted: "#7B8799",
    blue: "#5A8FF2",
    cyan: "#63C9D8",
    purple: "#9B7CE8",
    pink: "#E98BAF",
    green: "#63D59B",
    amber: "#E8B969",
    navy: "#172033",
  },
  gradients: {
    blue: ["#EAF3FF", "#DFF7F7"],
    purple: ["#F0EAFF", "#F8EAF5"],
    pink: ["#FFF0F5", "#FDE9E0"],
    green: ["#E8FAF1", "#EDF8FF"],
  },
  radius: { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 },
  spacing: { xs: 6, sm: 10, md: 14, lg: 18, xl: 24, xxl: 32 },
  shadow: { color: "#9AAAC0", opacity: 0.12, radius: 22, y: 8 },
  typography: {
    display: 30,
    headline: 22,
    body: 14,
    caption: 11,
    eyebrow: 10,
    tracking: 1.3,
  },
} as const;

export const accentFor = (index: number) => [design.colors.blue, design.colors.purple, design.colors.pink, design.colors.green, design.colors.cyan, design.colors.amber][index % 6];
