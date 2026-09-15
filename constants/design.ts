export const design = {
  colors: {
    ink: "#111A2E",
    background: "#F4F6FA",
    surface: "#FFFFFF",
    mist: "#EEF3FA",
    line: "#E4EAF2",
    muted: "#7D8798",
    blue: "#4E7CF0",
    cyan: "#2BC7D4",
    purple: "#A866E6",
    pink: "#EE5C8B",
    green: "#31D66B",
    amber: "#F2B744",
    navy: "#0B1526",
  },
  gradients: {
    blue: ["#4A78EE", "#5FC8DC"],
    purple: ["#9874E8", "#C66AE5"],
    pink: ["#EF6A91", "#F4A9B8"],
    green: ["#31D66B", "#7AE2A0"],
  },
  radius: { sm: 10, md: 14, lg: 18, xl: 24, pill: 999 },
  spacing: { xs: 6, sm: 10, md: 14, lg: 18, xl: 24, xxl: 32 },
  shadow: { color: "#93A5BA", opacity: 0.12, radius: 16, y: 7 },
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
