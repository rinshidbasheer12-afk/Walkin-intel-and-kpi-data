import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { WalkInModal } from "@/components/walk-in-modal";
import { DotNumber, Pill, SectionHeader, ui } from "@/components/ui-kit";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { CATEGORIES, displayDate, staffName, useApp } from "@/lib/app-store";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

export default function WalkInsScreen() {
  const colors = useColors();
  const { walkIns, staff, bikes } = useApp();
  const [showNew, setShowNew] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const filtered = useMemo(() => walkIns.filter((row) => {
    const haystack = `${row.category} ${row.requirement} ${row.notes ?? ""} ${staffName(staff, row.staffId)}`.toLowerCase();
    return (category === "All" || row.category === category) && (!query.trim() || haystack.includes(query.toLowerCase()));
  }), [walkIns, staff, category, query]);

  return <ScreenContainer containerClassName="bg-background"><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={ui.between}><View><Text style={[ui.eyebrow, { color: colors.primary }]}>ACTIVITY LOG</Text><Text style={[ui.title, { color: colors.foreground, marginTop: 5 }]}>Walk-ins</Text><Text style={[ui.subtitle, { color: colors.muted, marginTop: 4 }]}>{walkIns.length} recorded interactions</Text></View><Pressable onPress={() => setShowNew(true)} style={({ pressed }) => [styles.addButton, { backgroundColor: colors.primary }, pressed && { opacity: 0.75 }]}><IconSymbol name="plus.circle.fill" size={18} color="#FFFFFF" /><Text style={{ color: "#FFFFFF", fontWeight: "900", fontSize: 12 }}>NEW</Text></Pressable></View>
    <View style={styles.summaryRow}><SummaryChip label="Recorded" value={String(walkIns.length)} color={colors.primary} /><SummaryChip label="Sales" value={String(walkIns.filter((row) => row.sold).length)} color="#A968E8" /><SummaryChip label="Conversion" value={`${walkIns.length ? Math.round(walkIns.filter((row) => row.sold).length / walkIns.length * 100) : 0}%`} color="#537CEB" /></View>
    <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}><IconSymbol name="magnifyingglass" size={18} color={colors.muted} /><TextInput value={query} onChangeText={setQuery} placeholder="Search people, bikes, notes…" placeholderTextColor={colors.muted} style={{ flex: 1, color: colors.foreground, fontSize: 13 }} returnKeyType="search" /></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}><Pressable onPress={() => setCategory("All")} style={[styles.filter, { backgroundColor: category === "All" ? colors.foreground : colors.surface, borderColor: category === "All" ? colors.foreground : colors.border }]}><Text style={{ color: category === "All" ? colors.background : colors.foreground, fontSize: 11, fontWeight: "800" }}>All</Text></Pressable>{CATEGORIES.slice(0, 7).map((item) => <Pressable key={item} onPress={() => setCategory(item)} style={[styles.filter, { backgroundColor: category === item ? colors.primary : colors.surface, borderColor: category === item ? colors.primary : colors.border }]}><Text style={{ color: category === item ? "#FFFFFF" : colors.foreground, fontSize: 11, fontWeight: "800" }}>{item}</Text></Pressable>)}</ScrollView>
    <SectionHeader title={`${filtered.length} interactions`} action="Filter" />
    <View style={{ gap: 9 }}>{filtered.slice(0, 60).map((row) => { const bike = bikes.find((item) => item.id === (row.soldBikeId ?? row.bikeId)); return <View key={row.id} style={[ui.card, styles.rowCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.categoryIcon, { backgroundColor: row.sold ? `${colors.success}16` : `${colors.warning}16` }]}><IconSymbol name={row.sold ? "checkmark.circle.fill" : "arrow.down.right"} size={18} color={row.sold ? colors.success : colors.warning} /></View><View style={{ flex: 1 }}><View style={ui.between}><Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "900" }}>{row.category} enquiry</Text><Pill color={row.sold ? colors.success : colors.warning} background={row.sold ? `${colors.success}16` : `${colors.warning}16`}>{row.sold ? "SOLD" : "LOST"}</Pill></View><Text style={{ color: colors.muted, fontSize: 11, marginTop: 4 }}>{row.requirement}{bike ? ` · ${bike.brand} ${bike.model}` : ""}</Text><View style={[ui.row, { gap: 6, marginTop: 8 }]}><Text style={{ color: colors.muted, fontSize: 10 }}>{displayDate(row.date)} · {row.time}</Text><View style={[styles.dot, { backgroundColor: colors.border }]} /><Text style={{ color: colors.muted, fontSize: 10 }}>{staffName(staff, row.staffId)}</Text>{row.followUpRequired && <><View style={[styles.dot, { backgroundColor: colors.border }]} /><Text style={{ color: colors.primary, fontSize: 10, fontWeight: "800" }}>FOLLOW-UP</Text></>}</View></View><IconSymbol name="chevron.right" size={18} color={colors.muted} /></View>; })}</View>{filtered.length > 60 && <Text style={{ color: colors.muted, fontSize: 11, textAlign: "center", marginTop: 14 }}>Showing the latest 60. Export the full dataset from More.</Text>}
  </ScrollView><WalkInModal visible={showNew} onClose={() => setShowNew(false)} /></ScreenContainer>;
}

function SummaryChip({ label, value, color }: { label: string; value: string; color: string }) { const colors = useColors(); return <View style={[styles.summaryChip, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={{ color: colors.muted, fontSize: 9, fontWeight: "900", letterSpacing: 0.8 }}>{label.toUpperCase()}</Text><DotNumber value={value} color={color} size={2.5} /></View>; }

const styles = StyleSheet.create({ content: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 28 }, addButton: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 5 }, summaryRow: { flexDirection: "row", gap: 8, marginTop: 20 }, summaryChip: { flex: 1, minHeight: 68, borderRadius: 15, borderWidth: 1, padding: 11, justifyContent: "space-between" }, search: { marginTop: 14, height: 48, borderRadius: 14, borderWidth: 1, paddingHorizontal: 13, flexDirection: "row", alignItems: "center", gap: 8 }, filters: { gap: 7, paddingVertical: 13 }, filter: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 8 }, rowCard: { flexDirection: "row", alignItems: "center", gap: 11, padding: 13 }, categoryIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" }, dot: { width: 3, height: 3, borderRadius: 2 },
});
