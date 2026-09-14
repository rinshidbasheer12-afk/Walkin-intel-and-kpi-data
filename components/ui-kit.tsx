import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export const ui = StyleSheet.create({
  screen: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 28 },
  row: { flexDirection: "row", alignItems: "center" },
  between: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eyebrow: { fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", fontWeight: "800" },
  title: { fontSize: 28, lineHeight: 34, fontWeight: "800", letterSpacing: -0.5 },
  subtitle: { fontSize: 13, lineHeight: 19 },
  card: { borderRadius: 18, padding: 16, borderWidth: 1 },
  sectionTitle: { fontSize: 16, fontWeight: "800" },
  small: { fontSize: 11, lineHeight: 15 },
});

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const colors = useColors();
  return <View style={[ui.between, { marginTop: 24, marginBottom: 11 }]}><Text style={[ui.sectionTitle, { color: colors.foreground }]}>{title}</Text>{action && <Pressable onPress={onAction} style={({ pressed }) => [styles.action, pressed && { opacity: 0.55 }]}><Text style={{ color: colors.primary, fontSize: 12, fontWeight: "800" }}>{action}</Text><IconSymbol name="chevron.right" size={16} color={colors.primary} /></Pressable>}</View>;
}

export function MetricCard({ label, value, detail, icon, accent = "primary", onPress }: { label: string; value: string; detail?: string; icon: string; accent?: "primary" | "success" | "warning"; onPress?: () => void }) {
  const colors = useColors();
  const accentColor = colors[accent];
  const content = <View style={[ui.card, { flex: 1, minWidth: 145, backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[ui.between, { marginBottom: 13 }]}><Text style={[ui.eyebrow, { color: colors.muted }]}>{label}</Text><View style={[styles.iconCircle, { backgroundColor: `${accentColor}18` }]}><IconSymbol name={icon} size={17} color={accentColor} /></View></View><Text style={{ color: colors.foreground, fontSize: 27, fontWeight: "800", letterSpacing: -0.5 }}>{value}</Text>{detail && <Text style={[ui.small, { color: colors.muted, marginTop: 5 }]}>{detail}</Text>}</View>;
  return onPress ? <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.72 }]}>{content}</Pressable> : content;
}

export function Pill({ children, color, background }: { children: ReactNode; color?: string; background?: string }) {
  const colors = useColors();
  return <View style={[styles.pill, { backgroundColor: background ?? `${colors.primary}14` }]}><Text style={{ color: color ?? colors.primary, fontSize: 11, fontWeight: "800" }}>{children}</Text></View>;
}

export function BarList({ rows, max, color }: { rows: { label: string; value: number; meta?: string }[]; max?: number; color?: string }) {
  const colors = useColors();
  const maxValue = max ?? Math.max(...rows.map((row) => row.value), 1);
  return <View style={{ gap: 13 }}>{rows.map((row) => <View key={row.label}><View style={ui.between}><Text style={{ color: colors.foreground, fontSize: 12, fontWeight: "700", flex: 1 }}>{row.label}</Text><Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700" }}>{row.meta ?? row.value}</Text></View><View style={[styles.track, { backgroundColor: colors.background }]}><View style={[styles.fill, { width: `${Math.max(4, (row.value / maxValue) * 100)}%`, backgroundColor: color ?? colors.primary }]} /></View></View>)}</View>;
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  const colors = useColors();
  return <View style={[ui.card, { backgroundColor: colors.surface, borderColor: colors.border, alignItems: "center", paddingVertical: 28 }]}><IconSymbol name="chart.bar.fill" size={28} color={colors.muted} /><Text style={{ color: colors.foreground, fontWeight: "800", marginTop: 10 }}>{title}</Text><Text style={{ color: colors.muted, textAlign: "center", fontSize: 12, lineHeight: 18, marginTop: 5 }}>{description}</Text></View>;
}

const styles = StyleSheet.create({
  action: { flexDirection: "row", alignItems: "center", gap: 3 },
  iconCircle: { width: 32, height: 32, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  pill: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5, alignSelf: "flex-start" },
  track: { height: 7, borderRadius: 5, marginTop: 7, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 5 },
});
