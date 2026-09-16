import fs from "node:fs";
const path = "/home/ubuntu/cycleintel/app/(tabs)/dashboard.tsx";
const source = fs.readFileSync(path, "utf8");
const marker = 'heroGrid: { flexDirection: "row", gap: 10, marginTop: 18 },';
const insert = 'heroGridCompact: { flexDirection: "column" }, heroPanelCompact: { flex: 0, width: "100%" }, ';
if (!source.includes(marker)) throw new Error("Dashboard hero marker not found");
if (!source.includes("heroGridCompact:")) fs.writeFileSync(path, source.replace(marker, marker + " " + insert));
