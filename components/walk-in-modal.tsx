import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { CATEGORIES, LOST_REASONS, useApp } from "@/lib/app-store";
import { design } from "@/constants/design";
import { DotNumber } from "@/components/ui-kit";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

const CATEGORY_META: Record<string, { icon: string; short: string }> = {
  Road: { icon: "bicycle", short: "Road" }, MTB: { icon: "landscape", short: "MTB" }, Gravel: { icon: "terrain", short: "Gravel" }, Kids: { icon: "child-care", short: "Kids" }, Hybrid: { icon: "directions-bike", short: "Hybrid" }, Service: { icon: "build", short: "Service" }, Tyres: { icon: "tire-repair", short: "Tyres" }, "Looking Around": { icon: "visibility", short: "Browse" }, Collection: { icon: "inventory-2", short: "Pickup" }, Other: { icon: "more-horiz", short: "Other" },
};
const MODAL_COLORS = ["#5B5FEF", "#A968E8", "#537CEB", "#EF5C8B", "#31D96B", "#F3B83F"];

export function WalkInModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const colors = useColors();
  const { bikes, currentStaff, addWalkIn } = useApp();
  const [category, setCategory] = useState<typeof CATEGORIES[number]>("Road");
  const [sold, setSold] = useState<boolean | null>(null);
  const [lostReason, setLostReason] = useState(LOST_REASONS[0]);
  const [bikeId, setBikeId] = useState<string | undefined>();
  const [followUp, setFollowUp] = useState(false);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const today = new Date();
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const time = `${String(today.getHours()).padStart(2, "0")}:${String(today.getMinutes()).padStart(2, "0")}`;
  const relevantBikes = useMemo(() => bikes.filter((bike) => bike.type === category || bike.status === "Available").slice(0, 5), [bikes, category]);

  const reset = () => { setCategory("Road"); setSold(null); setLostReason(LOST_REASONS[0]); setBikeId(undefined); setFollowUp(false); setNotes(""); setSaving(false); };
  const close = () => { reset(); onClose(); };
  const save = () => {
    if (sold === null) { Alert.alert("One quick choice left", "Tap Sold or Lost to finish this walk-in."); return; }
    setSaving(true);
    addWalkIn({ date, time, category, requirement: category === "Road" ? "Road bike enquiry" : `${category} customer enquiry`, bikeType: category, bikeId, sold, soldBikeId: sold ? bikeId : undefined, lostReason: sold ? undefined : lostReason, intent: sold ? "Ready to buy" : "Considering", leadSource: "Walk-in", followUpRequired: !sold && followUp, followUpDate: !sold && followUp ? date : undefined, followUpStatus: !sold && followUp ? "pending" : undefined, notes });
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => { close(); }, 250);
  };

  return <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
    <View style={[styles.modal, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}><View><Text style={[styles.eyebrow, { color: colors.primary }]}>QUICK CAPTURE</Text><Text style={[styles.title, { color: colors.foreground }]}>New walk-in</Text><DotNumber value={time} color={colors.primary} size={2.5} /></View><Pressable onPress={close} style={({ pressed }) => [styles.close, { backgroundColor: colors.surface }, pressed && { opacity: 0.6 }]}><IconSymbol name="xmark" size={20} color={colors.foreground} /></Pressable></View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.infoRow, { backgroundColor: `${colors.primary}10` }]}><IconSymbol name="person.2.fill" size={17} color={colors.primary} /><Text style={{ color: colors.foreground, fontSize: 12, fontWeight: "700" }}>Attended by {currentStaff?.name ?? "Staff"} · {date}</Text></View>
        <Text style={[styles.label, { color: colors.foreground }]}>What are they here for?</Text>
        <View style={styles.categoryGrid}>{CATEGORIES.map((item) => { const active = category === item; const meta = CATEGORY_META[item]; return <Pressable key={item} onPress={() => setCategory(item)} style={({ pressed }) => [styles.category, { backgroundColor: active ? MODAL_COLORS[CATEGORIES.indexOf(item) % MODAL_COLORS.length] : colors.surface, borderColor: active ? MODAL_COLORS[CATEGORIES.indexOf(item) % MODAL_COLORS.length] : colors.border }, pressed && { transform: [{ scale: 0.97 }] }]}><IconSymbol name={meta.icon} size={20} color={active ? "#FFFFFF" : colors.muted} /><Text style={{ color: active ? "#FFFFFF" : colors.foreground, fontSize: 11, fontWeight: "800", marginTop: 4 }}>{meta.short}</Text></Pressable>; })}</View>
        <Text style={[styles.label, { color: colors.foreground, marginTop: 22 }]}>Outcome</Text>
        <View style={styles.outcomeRow}><Pressable onPress={() => setSold(true)} style={[styles.outcome, { backgroundColor: sold === true ? `${colors.success}18` : colors.surface, borderColor: sold === true ? colors.success : colors.border }]}><IconSymbol name="checkmark.circle.fill" size={21} color={sold === true ? colors.success : colors.muted} /><Text style={{ color: sold === true ? colors.success : colors.foreground, fontWeight: "800" }}>Sold</Text></Pressable><Pressable onPress={() => setSold(false)} style={[styles.outcome, { backgroundColor: sold === false ? `${colors.error}20` : colors.surface, borderColor: sold === false ? colors.error : colors.border }]}><IconSymbol name="arrow.down.right" size={21} color={sold === false ? colors.error : colors.muted} /><Text style={{ color: sold === false ? colors.error : colors.foreground, fontWeight: "800" }}>Not sold</Text></Pressable></View>
        {sold === true && <><Text style={[styles.label, { color: colors.foreground, marginTop: 22 }]}>Bike sold <Text style={{ color: colors.muted, fontWeight: "500" }}>(optional)</Text></Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>{relevantBikes.map((bike) => <Pressable key={bike.id} onPress={() => setBikeId(bike.id)} style={[styles.bikeChip, { backgroundColor: bikeId === bike.id ? MODAL_COLORS[0] : colors.surface, borderColor: bikeId === bike.id ? MODAL_COLORS[0] : colors.border }]}><Text style={{ color: bikeId === bike.id ? "#FFFFFF" : colors.foreground, fontSize: 12, fontWeight: "700" }}>{bike.brand} {bike.model}</Text></Pressable>)}</ScrollView></>}
        {sold === false && <><Text style={[styles.label, { color: colors.foreground, marginTop: 22 }]}>Why didn&apos;t they buy?</Text><View style={styles.reasonGrid}>{LOST_REASONS.slice(0, 8).map((reason) => <Pressable key={reason} onPress={() => setLostReason(reason)} style={[styles.reason, { backgroundColor: lostReason === reason ? `${colors.error}20` : colors.surface, borderColor: lostReason === reason ? colors.error : colors.border }]}><Text style={{ color: lostReason === reason ? colors.error : colors.foreground, fontSize: 11, fontWeight: "700" }}>{reason}</Text></Pressable>)}</View><Pressable onPress={() => setFollowUp(!followUp)} style={[styles.follow, { backgroundColor: followUp ? `${colors.primary}12` : colors.surface, borderColor: followUp ? colors.primary : colors.border }]}><IconSymbol name="calendar.badge.clock" size={18} color={followUp ? colors.primary : colors.muted} /><View style={{ flex: 1 }}><Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 12 }}>Create follow-up</Text><Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>Add to today&apos;s follow-up queue</Text></View><View style={[styles.toggle, { backgroundColor: followUp ? colors.primary : colors.border }]}><View style={[styles.toggleKnob, { alignSelf: followUp ? "flex-end" : "flex-start" }]} /></View></Pressable></>}
        <Text style={[styles.label, { color: colors.foreground, marginTop: 22 }]}>Note <Text style={{ color: colors.muted, fontWeight: "500" }}>(optional)</Text></Text><TextInput value={notes} onChangeText={setNotes} placeholder="Anything useful to remember?" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, backgroundColor: colors.surface, borderColor: colors.primary }]} returnKeyType="done" />
        <Pressable onPress={save} disabled={saving} style={({ pressed }) => [styles.save, { backgroundColor: colors.primary }, pressed && { transform: [{ scale: 0.98 }], opacity: 0.92 }, saving && { opacity: 0.6 }]}><IconSymbol name="checkmark" size={21} color="#FFFFFF" /><Text style={styles.saveText}>{saving ? "Saving…" : "Save walk-in"}</Text></Pressable>
      </ScrollView>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  modal: { flex: 1 }, header: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 15, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1 }, content: { padding: 20, paddingBottom: 36 }, eyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 1.2 }, title: { fontSize: 28, fontWeight: "900", marginTop: 2, letterSpacing: -0.6 }, close: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", shadowColor: design.shadow.color, shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }, infoRow: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 14, padding: 12, marginBottom: 23 }, label: { fontSize: 14, fontWeight: "900", marginBottom: 10 }, categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, category: { width: "18.3%", minWidth: 58, flexGrow: 1, alignItems: "center", justifyContent: "center", paddingVertical: 11, borderRadius: 15, borderWidth: 1, shadowColor: design.shadow.color, shadowOpacity: 0.05, shadowRadius: 7, shadowOffset: { width: 0, height: 3 } }, outcomeRow: { flexDirection: "row", gap: 10 }, outcome: { flex: 1, minHeight: 58, borderRadius: 16, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, shadowColor: design.shadow.color, shadowOpacity: 0.06, shadowRadius: 9, shadowOffset: { width: 0, height: 4 } }, bikeChip: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 }, reasonGrid: { flexDirection: "row", flexWrap: "wrap", gap: 7 }, reason: { borderWidth: 1, borderRadius: 11, paddingHorizontal: 10, paddingVertical: 9 }, follow: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 15, padding: 13, marginTop: 13 }, toggle: { width: 38, height: 22, borderRadius: 12, justifyContent: "center", paddingHorizontal: 3 }, toggleKnob: { width: 16, height: 16, borderRadius: 8, backgroundColor: "#FFFFFF" }, input: { borderWidth: 1, borderRadius: 14, minHeight: 50, paddingHorizontal: 14, fontSize: 13 }, save: { marginTop: 25, minHeight: 58, borderRadius: 17, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, shadowColor: design.colors.blue, shadowOpacity: 0.25, shadowRadius: 14, shadowOffset: { width: 0, height: 7 } }, saveText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5 },
});
