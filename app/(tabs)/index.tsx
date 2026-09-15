import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { WalkInModal } from "@/components/walk-in-modal";
import { StaffAvatar } from "@/components/staff-avatar";
import { BarList, MetricCard, Pill, SectionHeader, ui } from "@/components/ui-kit";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { dateKey, staffName, useApp } from "@/lib/app-store";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { walkIns, followUps, staff, currentStaff, isDemo } = useApp();
  const [showNew, setShowNew] = useState(false);
  const today = dateKey(new Date());
  const todayRows = useMemo(() => walkIns.filter((row) => row.date === today), [walkIns, today]);
  const sales = todayRows.filter((row) => row.sold).length;
  const conversion = todayRows.length ? Math.round((sales / todayRows.length) * 100) : 0;
  const followUpRows = followUps.filter((row) => row.status === "pending").slice(0, 3);
  const categoryRows = useMemo(() => Object.entries(todayRows.reduce<Record<string, number>>((acc, row) => { acc[row.category] = (acc[row.category] ?? 0) + 1; return acc; }, {})).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 4), [todayRows]);
  const myRows = todayRows.filter((row) => row.staffId === currentStaff?.id);

  return <ScreenContainer className="flex-1" containerClassName="bg-background"><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={ui.between}><View><Text style={[ui.eyebrow, { color: colors.primary }]}>CYCLEINTEL · SALES OS</Text><Text style={[ui.title, { color: colors.foreground, marginTop: 6 }]}>Good morning, {currentStaff?.name ?? "there"}</Text><Text style={[ui.subtitle, { color: colors.muted, marginTop: 5 }]}>Here’s your shop floor pulse for today.</Text></View><StaffAvatar staff={currentStaff} size={42} /></View>
    {isDemo && <View style={[styles.demoBanner, { backgroundColor: `${colors.warning}18`, borderColor: `${colors.warning}40` }]}><IconSymbol name="exclamationmark.triangle.fill" size={16} color={colors.warning} /><Text style={{ color: colors.warning, fontSize: 11, fontWeight: "800", flex: 1 }}>DEMO DATA · Metrics are ready to explore. Add a real walk-in to start your own dataset.</Text></View>}
    <Pressable onPress={() => setShowNew(true)} style={({ pressed }) => [styles.newButton, { backgroundColor: colors.primary }, pressed && { transform: [{ scale: 0.98 }], opacity: 0.92 }]}><View style={styles.newIcon}><IconSymbol name="plus.circle.fill" size={26} color="#FFFFFF" /></View><View style={{ flex: 1 }}><Text style={styles.newTitle}>New walk-in</Text><Text style={styles.newSubtitle}>Capture the interaction in seconds</Text></View><IconSymbol name="chevron.right" size={23} color="#FFFFFF" /></Pressable>
    <SectionHeader title="Today at a glance" action="Full dashboard" onAction={() => router.push("/dashboard")} />
    <View style={styles.metricGrid}><MetricCard label="Walk-ins" value={String(todayRows.length)} detail="Recorded today" icon="person.2.fill" /><MetricCard label="Sales" value={String(sales)} detail={`${conversion}% conversion`} icon="checkmark.circle.fill" accent="success" /><MetricCard label="Follow-ups" value={String(followUps.filter((item) => item.dueDate <= today && item.status === "pending").length)} detail="Due today" icon="calendar.badge.clock" accent="warning" /><MetricCard label="My shift" value={String(myRows.length)} detail="Walk-ins handled" icon="target" /></View>
    <SectionHeader title="Today’s follow-ups" action="View queue" onAction={() => router.push("/follow-ups")} />
    <View style={[ui.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>{followUpRows.length ? followUpRows.map((item) => { const row = walkIns.find((walkIn) => walkIn.id === item.walkInId); return <View key={item.id} style={[ui.between, styles.followRow, { borderBottomColor: colors.border }]}><View style={[styles.followDot, { backgroundColor: colors.warning }]} /><View style={{ flex: 1 }}><Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 13 }}>{row?.category ?? "Customer"} follow-up</Text><Text style={{ color: colors.muted, fontSize: 11, marginTop: 3 }}>{item.note} · {staffName(staff, row?.staffId ?? "")}</Text></View><Pill color={colors.warning} background={`${colors.warning}16`}>{item.dueDate <= today ? "Due" : item.dueDate}</Pill></View>; }) : <View style={{ alignItems: "center", paddingVertical: 16 }}><Text style={{ color: colors.muted, fontSize: 12 }}>No pending follow-ups in the queue.</Text></View>}</View>
    <SectionHeader title="Demand signal" action="Analyse" onAction={() => router.push("/dashboard")} />
    <View style={[ui.card, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={ui.between}><View><Text style={{ color: colors.foreground, fontWeight: "900", fontSize: 15 }}>What’s moving today</Text><Text style={{ color: colors.muted, fontSize: 11, marginTop: 4 }}>{categoryRows.length ? "Enquiries by category" : "Not enough data yet"}</Text></View><View style={[styles.signalIcon, { backgroundColor: `${colors.primary}16` }]}><IconSymbol name="flame.fill" size={19} color={colors.primary} /></View></View>{categoryRows.length ? <View style={{ marginTop: 17 }}><BarList rows={categoryRows} color={colors.primary} /></View> : <Text style={{ color: colors.muted, marginTop: 17, fontSize: 12 }}>Create a few walk-ins to see category demand here.</Text>}</View>
    <View style={[styles.insight, { backgroundColor: colors.foreground }]}><View style={[styles.insightIcon, { backgroundColor: `${colors.primary}32` }]}><IconSymbol name="chart.bar.fill" size={18} color={colors.primary} /></View><View style={{ flex: 1 }}><Text style={{ color: colors.background, fontSize: 12, fontWeight: "900", letterSpacing: 0.6 }}>INTELLIGENCE NOTE</Text><Text style={{ color: `${colors.background}B8`, fontSize: 11, lineHeight: 17, marginTop: 4 }}>{todayRows.length ? `${sales} of ${todayRows.length} recorded walk-ins converted today. Keep logging every interaction to make the signal sharper.` : "Your first walk-in starts the performance signal."}</Text></View></View>
  </ScrollView><WalkInModal visible={showNew} onClose={() => setShowNew(false)} /></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 34 }, avatar: { width: 38, height: 38, borderRadius: 14, alignItems: "center", justifyContent: "center" }, demoBanner: { flexDirection: "row", alignItems: "center", gap: 8, padding: 11, borderWidth: 1, borderRadius: 13, marginTop: 18 }, newButton: { minHeight: 82, borderRadius: 19, paddingHorizontal: 17, marginTop: 22, flexDirection: "row", alignItems: "center", gap: 12, shadowColor: "#09A6B4", shadowOpacity: 0.2, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } }, newIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#FFFFFF24", alignItems: "center", justifyContent: "center" }, newTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.4 }, newSubtitle: { color: "#FFFFFFB8", fontSize: 11, marginTop: 3 }, metricGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 }, followRow: { paddingVertical: 11, gap: 10, borderBottomWidth: 1 }, followDot: { width: 8, height: 8, borderRadius: 4 }, signalIcon: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center" }, insight: { flexDirection: "row", gap: 11, borderRadius: 17, padding: 16, marginTop: 24 }, insightIcon: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center" },
});
