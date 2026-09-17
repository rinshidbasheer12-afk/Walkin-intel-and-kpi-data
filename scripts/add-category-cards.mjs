import fs from "node:fs";
const path = "/home/ubuntu/cycleintel/app/(tabs)/dashboard.tsx";
let source = fs.readFileSync(path, "utf8");
source = source.replace('import { useMemo, useState } from "react";', 'import { useEffect, useMemo, useRef, useState } from "react";\nimport { Animated } from "react-native";');
const start = source.indexOf('    <SectionHeader title="Category performance"');
const end = source.indexOf('    <SectionHeader title="Where you&apos;re winning"', start);
if (start < 0 || end < 0) throw new Error("Category section markers not found");
const replacement = '    <SectionHeader title="Category performance" action="Real recorded data" />\n    <View style={styles.categoryGrid}>{categories.map((item, index) => <CategoryCard key={item.label} item={item} index={index} total={current.enquiries} />)}</View>\n';
source = source.slice(0, start) + replacement + source.slice(end);
const marker = 'function Insight({ icon, color, title, value, detail }';
const component = [
'function CategoryCard({ item, index, total }: { item: { label: string; enquiries: number; attended: number; sales: number; conversion: number; value: number; lost: number }; index: number; total: number }) {',
'  const progress = useRef(new Animated.Value(0)).current;',
'  const palette: [string, string][] = [["#4268F2", "#72B7FF"], ["#7351D5", "#B57AF0"], ["#E14F91", "#F79ABD"], ["#159FC7", "#68DCE4"], ["#2BA877", "#79D7A5"], ["#E1893E", "#F5BF70"], ["#5F76D8", "#A9B8FF"], ["#8B65C8", "#D09AF5"]];',
'  const gradient = palette[index % palette.length];',
'  useEffect(() => { Animated.timing(progress, { toValue: 1, duration: 520, delay: index * 55, useNativeDriver: true }).start(); }, [index, progress]);',
'  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", String(Math.max(item.enquiries ? 7 : 0, item.enquiries / Math.max(total, 1) * 100)) + "%"] });',
'  return <Animated.View style={[styles.categoryTile, { opacity: progress, transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }]}><LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.categoryGradient}><View style={ui.between}><View><Text style={styles.categoryEyebrow}>CATEGORY</Text><Text style={styles.categoryTitle}>{item.label}</Text></View><View style={styles.categoryOrb}><Text style={styles.categoryOrbText}>{item.label.slice(0, 2).toUpperCase()}</Text></View></View><View style={styles.categoryMain}><Text style={styles.categoryValue}>{item.enquiries}</Text><Text style={styles.categoryValueLabel}>enquiries</Text></View><View style={styles.categoryBarTrack}><Animated.View style={[styles.categoryBarFill, { width }]} /></View><View style={styles.categoryMetrics}><Metric label="Attended" value={String(item.attended)} /><Metric label="Sales" value={String(item.sales)} /><Metric label="Rate" value={item.enquiries ? String(item.conversion.toFixed(0)) + "%" : "—"} /><Metric label="Value" value={item.value ? money(item.value) : "—"} /></View></LinearGradient></Animated.View>;',
'}',
'function Metric({ label, value }: { label: string; value: string }) { return <View style={{ flex: 1 }}><Text style={styles.categoryMetricLabel}>{label}</Text><Text numberOfLines={1} style={styles.categoryMetricValue}>{value}</Text></View>; }',
].join('\n') + '\n';
if (!source.includes(marker)) throw new Error("Insight marker not found");
source = source.replace(marker, component + marker);
const styleMarker = 'categoryCard: { borderWidth: 1, borderRadius: 20, padding: 15 },';
const styles = 'categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 }, categoryTile: { width: "48.8%", minHeight: 184, borderRadius: 22, overflow: "hidden", shadowColor: "#7084B8", shadowOpacity: 0.2, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } }, categoryGradient: { flex: 1, padding: 14, borderWidth: 1, borderColor: "#FFFFFF45", borderRadius: 22 }, categoryEyebrow: { color: "#FFFFFFB8", fontSize: 8, fontWeight: "900", letterSpacing: 1.1 }, categoryTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "900", marginTop: 3 }, categoryOrb: { width: 31, height: 31, borderRadius: 12, backgroundColor: "#FFFFFF28", alignItems: "center", justifyContent: "center" }, categoryOrbText: { color: "#FFFFFF", fontSize: 9, fontWeight: "900" }, categoryMain: { marginTop: 22 }, categoryValue: { color: "#FFFFFF", fontSize: 31, fontWeight: "900", letterSpacing: -1 }, categoryValueLabel: { color: "#FFFFFFB8", fontSize: 10, marginTop: 1 }, categoryBarTrack: { height: 6, borderRadius: 5, backgroundColor: "#FFFFFF35", overflow: "hidden", marginTop: 13 }, categoryBarFill: { height: "100%", borderRadius: 5, backgroundColor: "#FFFFFFE8" }, categoryMetrics: { flexDirection: "row", gap: 7, marginTop: 13 }, categoryMetricLabel: { color: "#FFFFFFA8", fontSize: 8, fontWeight: "800" }, categoryMetricValue: { color: "#FFFFFF", fontSize: 11, fontWeight: "900", marginTop: 3 }, ';
if (!source.includes(styleMarker)) throw new Error("Category style marker not found");
source = source.replace(styleMarker, styleMarker + " " + styles);
fs.writeFileSync(path, source);
