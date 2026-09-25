export const design = {
  colors: {
    ink: "#172033",
    background: "#F0FAFC",
    surface: "#FFFFFF",
    mist: "#E5F7F8",
    line: "#E3EAF3",
    muted: "#7B8799",
    blue: "#3E6FF5",
    cyan: "#41C9DE",
    purple: "#8B55E8",
    pink: "#F34C82",
    green: "#42C995",
    amber: "#E8B969",
    navy: "#172033",
  },
  gradients: {
    blue: ["#DDEBFF", "#D8FBF7"],
    purple: ["#E7D9FF", "#F7D9F5"],
    pink: ["#FFE0EC", "#FFE9D8"],
    green: ["#D8FAEF", "#E0F2FF"],
  },
  glass: {
    frost: {
      crystal: { backgroundAlpha: "42", blurHint: 8 },
      balanced: { backgroundAlpha: "80", blurHint: 24 },
      frosted: { backgroundAlpha: "B8", blurHint: 40 },
      deep: { backgroundAlpha: "E0", blurHint: 64 },
    },
    light: {
      border: "#0F172A14",
      topEdge: "#FFFFFFF2",
      inset: "#FFFFFFE6",
      shadow: "#60708C",
    },
    dim: {
      border: "#FFFFFF1F",
      topEdge: "#FFFFFF38",
      inset: "#FFFFFF14",
      shadow: "#000000",
    },
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

export function isLightPalette(background: string) {
  return background.toLowerCase() === design.colors.background.toLowerCase();
}

export function glassSurface(background: string, frost: keyof typeof design.glass.frost = "balanced") {
  const alpha = design.glass.frost[frost].backgroundAlpha;
  return `${background}${alpha}`;
}

export function glassEdge(background: string) {
  const light = isLightPalette(background);
  return {
    borderColor: light ? design.glass.light.border : design.glass.dim.border,
    borderTopColor: light ? design.glass.light.topEdge : design.glass.dim.topEdge,
    shadowColor: light ? design.glass.light.shadow : design.glass.dim.shadow,
    insetColor: light ? design.glass.light.inset : design.glass.dim.inset,
  };
}
