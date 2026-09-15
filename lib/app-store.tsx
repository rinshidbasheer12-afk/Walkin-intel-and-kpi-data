import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

type Category = "Road" | "MTB" | "Gravel" | "Kids" | "Hybrid" | "Service" | "Tyres" | "Looking Around" | "Collection" | "Other";
type FollowUpStatus = "pending" | "completed" | "converted" | "lost" | "rescheduled";
export type DateRange = "today" | "yesterday" | "week" | "month";

export const CATEGORIES: Category[] = ["Road", "MTB", "Gravel", "Kids", "Hybrid", "Service", "Tyres", "Looking Around", "Collection", "Other"];
export const LOST_REASONS = ["Too expensive", "Wanted to think", "Comparing with another bike", "No suitable bike", "Wrong size", "Wrong specification", "Didn't like the bike", "Just browsing", "Will come later", "Found cheaper elsewhere", "Timing problem", "Other"];

export type Staff = { id: string; name: string; role: "Admin" | "Staff"; active: boolean; joinedAt: string; photoUri?: string; jobTitle?: string; phone?: string; email?: string; employeeId?: string; status?: "Active" | "On leave" | "Inactive"; notes?: string };
export type Bike = { id: string; brand: string; model: string; type: Category; size: string; price: number; status: "Available" | "Reserved" | "Sold"; sku: string };
export type WalkIn = {
  id: string;
  date: string;
  time: string;
  staffId: string;
  category: Category;
  requirement: string;
  bikeType: string;
  bikeId?: string;
  sold: boolean;
  soldBikeId?: string;
  lostReason?: string;
  intent: "Browsing" | "Considering" | "Ready to buy" | "Service request";
  leadSource: "Walk-in" | "Instagram" | "Google" | "Referral" | "Returning customer";
  budget?: number;
  followUpRequired: boolean;
  followUpDate?: string;
  followUpStatus?: FollowUpStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  demo?: boolean;
};
export type FollowUp = { id: string; walkInId: string; dueDate: string; status: FollowUpStatus; note: string; createdAt: string };

type AppState = { walkIns: WalkIn[]; followUps: FollowUp[]; staff: Staff[]; bikes: Bike[]; isDemo: boolean };

type AppContextValue = AppState & {
  hydrated: boolean;
  currentStaff: Staff;
  addWalkIn: (input: Omit<WalkIn, "id" | "staffId" | "createdAt" | "updatedAt" | "demo"> & { staffId?: string }) => void;
  updateFollowUp: (id: string, status: FollowUpStatus) => void;
  addStaff: (name: string, role?: "Admin" | "Staff") => void;
  addEmployee: (employee: Omit<Staff, "id" | "joinedAt"> & { joinedAt?: string }) => void;
  updateEmployee: (id: string, patch: Partial<Omit<Staff, "id">>) => void;
  addBike: (bike: Omit<Bike, "id">) => void;
  importCsv: (csv: string) => { imported: number; skipped: number };
  clearDemoData: () => void;
  resetDemoData: () => void;
};

const STORAGE_KEY = "cycleintel-local-v1";
const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const pad = (n: number) => String(n).padStart(2, "0");
export const dateKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
export const displayDate = (date: string) => {
  const [y, m, d] = date.split("-").map(Number);
  return Number.isFinite(y) ? `${pad(d)}/${pad(m)}/${y}` : date;
};
export const money = (value?: number) => value ? `£${Math.round(value).toLocaleString("en-GB")}` : "—";

export function conversionRate(rows: WalkIn[]) {
  return rows.length ? Math.round(rows.filter((row) => row.sold).length / rows.length * 1000) / 10 : 0;
}

export function recordedRevenue(rows: WalkIn[]) {
  return rows.filter((row) => row.sold && typeof row.budget === "number").reduce((sum, row) => sum + (row.budget ?? 0), 0);
}

export function lossReasonRows(rows: WalkIn[]) {
  const lost = rows.filter((row) => !row.sold);
  return Object.entries(lost.reduce<Record<string, number>>((acc, row) => {
    const reason = row.lostReason ?? "Not specified";
    acc[reason] = (acc[reason] ?? 0) + 1;
    return acc;
  }, {})).map(([label, value]) => ({ label, value, meta: `${Math.round(value / Math.max(lost.length, 1) * 100)}%` })).sort((a, b) => b.value - a.value);
}

export function sampleConfidence(rows: WalkIn[]) {
  if (rows.length < 5) return "early signal";
  if (rows.length < 15) return "directional signal";
  return "reliable signal";
}

const demoStaff: Staff[] = ["Rinshid", "Aaron", "Farhan", "Khalid", "Arbaz", "Ernest", "Ahmed"].map((name, index) => ({
  id: `staff-${name.toLowerCase()}`,
  name,
  role: index === 0 ? "Admin" : "Staff",
  active: true,
  joinedAt: "2025-01-01",
}));

const demoBikes: Bike[] = [
  { id: "bike-cannondale", brand: "Cannondale", model: "Synapse Carbon 3", type: "Road", size: "M", price: 2199, status: "Available", sku: "CND-SYN-03" },
  { id: "bike-specialized", brand: "Specialized", model: "Stumpjumper EVO", type: "MTB", size: "L", price: 2899, status: "Available", sku: "SPZ-STP-EVO" },
  { id: "bike-cervelo", brand: "Cervélo", model: "Áspero GRX", type: "Gravel", size: "54", price: 3199, status: "Reserved", sku: "CVL-ASP-GRX" },
  { id: "bike-trek", brand: "Trek", model: "Domane AL 5", type: "Road", size: "54", price: 1499, status: "Available", sku: "TRK-DOM-AL5" },
  { id: "bike-giant", brand: "Giant", model: "Talon 1", type: "MTB", size: "M", price: 899, status: "Available", sku: "GNT-TAL-01" },
  { id: "bike-boardman", brand: "Boardman", model: "ADV 8.9", type: "Gravel", size: "M", price: 1299, status: "Sold", sku: "BRD-ADV-89" },
  { id: "bike-raleigh", brand: "Raleigh", model: "Array", type: "Hybrid", size: "M", price: 699, status: "Available", sku: "RAL-ARR-01" },
];

const demoRequirements: Record<Category, string[]> = {
  Road: ["Fast weekend road bike", "Comfortable endurance setup", "First road bike"],
  MTB: ["Trail-ready hardtail", "Full suspension for local trails", "Upgrade from an entry bike"],
  Gravel: ["Mixed-surface adventure bike", "Bikepacking setup", "Fast commute with wider tyres"],
  Kids: ["Bike for a 9 year old", "First pedal bike", "Lightweight kids bike"],
  Hybrid: ["Reliable daily commute", "Comfortable city bike", "Low-maintenance transport"],
  Service: ["Brake adjustment", "Annual service", "Gear indexing"],
  Tyres: ["Tubeless replacement", "Winter tyre options", "Puncture-resistant tyres"],
  "Looking Around": ["Exploring options", "Just browsing the range", "Comparing bike styles"],
  Collection: ["Collecting a reserved bike", "Pickup for online order", "Collection query"],
  Other: ["Accessory advice", "Gift card query", "General question"],
};

function seededWalkIns(): { walkIns: WalkIn[]; followUps: FollowUp[] } {
  const now = new Date();
  const rows: Array<{ offset: number; hour: number; staff: string; category: Category; sold: boolean; lostReason?: string; followUp?: boolean; intent: WalkIn["intent"]; bike?: string; budget?: number }> = [
    { offset: 0, hour: 10, staff: "Rinshid", category: "Road", sold: true, intent: "Ready to buy", bike: "bike-trek", budget: 1600 },
    { offset: 0, hour: 11, staff: "Aaron", category: "MTB", sold: false, lostReason: "Wanted to think", followUp: true, intent: "Considering", budget: 1800 },
    { offset: 0, hour: 13, staff: "Farhan", category: "Service", sold: false, intent: "Ready to buy" },
    { offset: 0, hour: 15, staff: "Rinshid", category: "Gravel", sold: true, intent: "Ready to buy", bike: "bike-boardman", budget: 1400 },
    { offset: 0, hour: 17, staff: "Khalid", category: "Road", sold: false, lostReason: "Too expensive", followUp: true, intent: "Considering", budget: 1200 },
    { offset: 1, hour: 10, staff: "Rinshid", category: "MTB", sold: true, intent: "Ready to buy", bike: "bike-giant", budget: 1000 },
    { offset: 1, hour: 12, staff: "Ahmed", category: "Kids", sold: false, lostReason: "Wrong size", intent: "Considering" },
    { offset: 1, hour: 16, staff: "Aaron", category: "Road", sold: false, lostReason: "Comparing with another bike", followUp: true, intent: "Considering", budget: 2000 },
    { offset: 2, hour: 11, staff: "Farhan", category: "Gravel", sold: false, lostReason: "Too expensive", intent: "Considering", budget: 1300 },
    { offset: 2, hour: 14, staff: "Khalid", category: "MTB", sold: true, intent: "Ready to buy", bike: "bike-specialized", budget: 3000 },
    { offset: 3, hour: 15, staff: "Rinshid", category: "Hybrid", sold: false, lostReason: "Will come later", followUp: true, intent: "Considering", budget: 800 },
    { offset: 4, hour: 17, staff: "Arbaz", category: "Road", sold: false, lostReason: "No suitable bike", intent: "Considering", budget: 1000 },
    { offset: 5, hour: 12, staff: "Ernest", category: "MTB", sold: false, lostReason: "Wanted to think", intent: "Considering" },
    { offset: 6, hour: 13, staff: "Rinshid", category: "Road", sold: true, intent: "Ready to buy", bike: "bike-cannondale", budget: 2400 },
    { offset: 7, hour: 10, staff: "Aaron", category: "Looking Around", sold: false, lostReason: "Just browsing", intent: "Browsing" },
    { offset: 8, hour: 18, staff: "Farhan", category: "Gravel", sold: true, intent: "Ready to buy", bike: "bike-cervelo", budget: 3200 },
    { offset: 9, hour: 11, staff: "Ahmed", category: "Tyres", sold: false, intent: "Service request" },
    { offset: 10, hour: 14, staff: "Khalid", category: "Road", sold: false, lostReason: "Wrong specification", intent: "Considering" },
    { offset: 12, hour: 16, staff: "Rinshid", category: "MTB", sold: true, intent: "Ready to buy", bike: "bike-giant", budget: 950 },
    { offset: 14, hour: 12, staff: "Arbaz", category: "Kids", sold: false, lostReason: "Too expensive", intent: "Considering", budget: 400 },
    { offset: 16, hour: 17, staff: "Ernest", category: "Hybrid", sold: false, lostReason: "Comparing with another bike", intent: "Considering" },
    { offset: 18, hour: 11, staff: "Aaron", category: "Road", sold: true, intent: "Ready to buy", bike: "bike-trek", budget: 1500 },
    { offset: 20, hour: 15, staff: "Farhan", category: "Collection", sold: true, intent: "Ready to buy", bike: "bike-boardman" },
    { offset: 22, hour: 10, staff: "Rinshid", category: "Gravel", sold: false, lostReason: "Wanted to think", followUp: true, intent: "Considering", budget: 2200 },
  ];
  const walkIns = rows.map((row, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() - row.offset);
    date.setHours(row.hour, index % 4 * 10, 0, 0);
    const dateValue = dateKey(date);
    const staff = demoStaff.find((item) => item.name === row.staff) ?? demoStaff[0];
    const bike = row.bike ? demoBikes.find((item) => item.id === row.bike) : undefined;
    return {
      id: `demo-walkin-${index}`,
      date: dateValue,
      time: `${pad(row.hour)}:${pad(index % 4 * 10)}`,
      staffId: staff.id,
      category: row.category,
      requirement: demoRequirements[row.category][index % demoRequirements[row.category].length],
      bikeType: row.category,
      bikeId: bike?.id,
      sold: row.sold,
      soldBikeId: bike?.id,
      lostReason: row.lostReason,
      intent: row.intent,
      leadSource: index % 5 === 0 ? "Instagram" : index % 4 === 0 ? "Referral" : "Walk-in",
      budget: row.budget,
      followUpRequired: Boolean(row.followUp),
      followUpDate: row.followUp ? dateKey(new Date(date.getTime() + 2 * 86400000)) : undefined,
      followUpStatus: row.followUp ? "pending" : undefined,
      notes: row.sold ? `Demo sale: ${bike?.brand ?? "bike"} ${bike?.model ?? "selected model"}.` : "Demo interaction for analytics preview.",
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
      demo: true,
    } satisfies WalkIn;
  });
  const followUps = walkIns.filter((item) => item.followUpRequired).map((item) => ({
    id: `demo-followup-${item.id}`,
    walkInId: item.id,
    dueDate: item.followUpDate ?? item.date,
    status: item.followUpStatus ?? "pending",
    note: item.lostReason ?? "Reconnect with customer",
    createdAt: item.createdAt,
  }));
  return { walkIns, followUps };
}

export function createDemoState(): AppState {
  const seeded = seededWalkIns();
  return { ...seeded, staff: demoStaff, bikes: demoBikes, isDemo: true };
}

function parseCsvLine(line: string) {
  const result: string[] = [];
  let current = "";
  let quoted = false;
  for (const char of line) {
    if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { result.push(current.trim()); current = ""; }
    else current += char;
  }
  result.push(current.trim());
  return result.map((item) => item.replace(/^"|"$/g, ""));
}

function normaliseImportedDate(value: string) {
  if (!value) return dateKey(new Date());
  const iso = value.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (iso) return `${iso[1]}-${pad(Number(iso[2]))}-${pad(Number(iso[3]))}`;
  const uk = value.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (uk) return `${uk[3]}-${pad(Number(uk[2]))}-${pad(Number(uk[1]))}`;
  return dateKey(new Date());
}

export const rangeLabel = (range: DateRange) => ({ today: "Today", yesterday: "Yesterday", week: "This week", month: "This month" }[range]);
export function rangeBounds(range: DateRange) {
  const today = new Date();
  const start = new Date(today);
  const end = new Date(today);
  if (range === "yesterday") { start.setDate(start.getDate() - 1); end.setDate(end.getDate() - 1); }
  if (range === "week") { start.setDate(start.getDate() - 6); }
  if (range === "month") { start.setDate(1); }
  return { start: dateKey(start), end: dateKey(end) };
}
export function inRange(date: string, range: DateRange) { const bounds = rangeBounds(range); return date >= bounds.start && date <= bounds.end; }

export function toCsv(rows: WalkIn[], staff: Staff[], bikes: Bike[]) {
  const header = ["DATE", "TIME", "ATTENDED", "ENQUIRY", "REQUIREMENT", "BIKE", "SOLD", "LOST REASON", "INTENT", "LEAD SOURCE", "BUDGET", "FOLLOW-UP", "FOLLOW-UP DATE", "NOTES"];
  const lines = rows.map((row) => {
    const staffName = staff.find((item) => item.id === row.staffId)?.name ?? "Unknown";
    const bikeName = bikes.find((item) => item.id === (row.soldBikeId ?? row.bikeId));
    const values = [row.date, row.time, staffName, row.category, row.requirement, bikeName ? `${bikeName.brand} ${bikeName.model}` : "", row.sold ? "Yes" : "No", row.lostReason ?? "", row.intent, row.leadSource, row.budget ?? "", row.followUpRequired ? "Yes" : "No", row.followUpDate ?? "", row.notes ?? ""];
    return values.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",");
  });
  return [header.join(","), ...lines].join("\n");
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(createDemoState);
  const [hydrated, setHydrated] = useState(false);
  const hydratedRef = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value) {
        try { setState(JSON.parse(value)); } catch { setState(createDemoState()); }
      }
      hydratedRef.current = true;
      setHydrated(true);
    }).catch(() => { hydratedRef.current = true; setHydrated(true); });
  }, []);

  useEffect(() => {
    if (hydratedRef.current) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => undefined);
  }, [state]);

  const value = useMemo<AppContextValue>(() => ({
    ...state,
    hydrated,
    currentStaff: state.staff.find((staff) => staff.active) ?? state.staff[0],
    addWalkIn: (input) => setState((prev) => {
      const now = new Date().toISOString();
      const walkIn: WalkIn = { ...input, id: uid("walkin"), staffId: input.staffId ?? prev.staff.find((staff) => staff.active)?.id ?? "", createdAt: now, updatedAt: now, demo: false };
      const followUp = walkIn.followUpRequired ? [{ id: uid("followup"), walkInId: walkIn.id, dueDate: walkIn.followUpDate ?? walkIn.date, status: "pending" as FollowUpStatus, note: walkIn.lostReason ?? "Reconnect with customer", createdAt: now }] : [];
      return { ...prev, walkIns: [walkIn, ...prev.walkIns], followUps: [...followUp, ...prev.followUps], isDemo: false };
    }),
    updateFollowUp: (id, status) => setState((prev) => {
      const followUp = prev.followUps.find((item) => item.id === id);
      return {
        ...prev,
        followUps: prev.followUps.map((item) => item.id === id ? { ...item, status } : item),
        walkIns: followUp ? prev.walkIns.map((item) => item.id === followUp.walkInId ? { ...item, followUpStatus: status, sold: status === "converted" ? true : item.sold, updatedAt: new Date().toISOString() } : item) : prev.walkIns,
      };
    }),
    addStaff: (name, role = "Staff") => setState((prev) => ({ ...prev, staff: [...prev.staff, { id: uid("staff"), name: name.trim(), role, active: true, joinedAt: dateKey(new Date()) }], isDemo: false })),
    addEmployee: (employee) => setState((prev) => ({ ...prev, staff: [...prev.staff, { ...employee, id: uid("staff"), joinedAt: employee.joinedAt ?? dateKey(new Date()), active: employee.status ? employee.status === "Active" : employee.active }], isDemo: false })),
    updateEmployee: (id, patch) => setState((prev) => ({ ...prev, staff: prev.staff.map((person) => person.id === id ? { ...person, ...patch, active: patch.status ? patch.status === "Active" : patch.active ?? person.active } : person), isDemo: false })),
    addBike: (bike) => setState((prev) => ({ ...prev, bikes: [...prev.bikes, { ...bike, id: uid("bike") }], isDemo: false })),
    importCsv: (csv) => {
      const lines = csv.split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) return { imported: 0, skipped: 0 };
      const headers = parseCsvLine(lines[0]).map((header) => header.toLowerCase().replace(/[^a-z0-9]/g, ""));
      let imported = 0; let skipped = 0;
      setState((prev) => {
        const newRows: WalkIn[] = [];
        const newStaff = [...prev.staff];
        const newBikes = [...prev.bikes];
        const indexOf = (names: string[]) => headers.findIndex((header) => names.includes(header));
        const get = (cells: string[], names: string[]) => { const index = indexOf(names); return index >= 0 ? cells[index] ?? "" : ""; };
        for (const line of lines.slice(1)) {
          const cells = parseCsvLine(line);
          const category = (get(cells, ["enquiry", "category", "enquirytype"]) || "Other") as Category;
          const staffName = get(cells, ["attended", "staff", "staffmember"]) || "Imported staff";
          let staff = newStaff.find((item) => item.name.toLowerCase() === staffName.toLowerCase());
          if (!staff) { staff = { id: uid("staff"), name: staffName, role: "Staff", active: true, joinedAt: dateKey(new Date()) }; newStaff.push(staff); }
          const date = normaliseImportedDate(get(cells, ["date", "day"]));
          const time = get(cells, ["time"]) || "12:00";
          const bikeName = get(cells, ["bikename", "bike", "bikemodel"]);
          const sold = /^(yes|y|true|1|sold)$/i.test(get(cells, ["sold", "sold?"]));
          const duplicate = prev.walkIns.some((item) => item.date === date && item.time === time && item.staffId === staff?.id && item.category === category);
          if (duplicate) { skipped += 1; continue; }
          let bike = newBikes.find((item) => `${item.brand} ${item.model}`.toLowerCase() === bikeName.toLowerCase());
          if (bikeName && !bike) { bike = { id: uid("bike"), brand: "Imported", model: bikeName, type: category, size: "—", price: 0, status: sold ? "Sold" : "Available", sku: `IMP-${Date.now()}-${imported}` }; newBikes.push(bike); }
          const now = new Date().toISOString();
          newRows.push({ id: uid("walkin"), date, time, staffId: staff.id, category: CATEGORIES.includes(category) ? category : "Other", requirement: get(cells, ["requirement", "specificrequirement"]) || "Imported historical interaction", bikeType: category, bikeId: bike?.id, sold, soldBikeId: sold ? bike?.id : undefined, lostReason: sold ? undefined : get(cells, ["lostreason", "reasonfornosale"]) || "Other", intent: "Considering", leadSource: "Walk-in", budget: Number(get(cells, ["budget", "estimatedbudget"])) || undefined, followUpRequired: /^(yes|y|true|1)$/i.test(get(cells, ["followup", "followuprequired"])), followUpDate: get(cells, ["followupdate"]), notes: get(cells, ["notes", "note"]), createdAt: now, updatedAt: now });
          imported += 1;
        }
        return { ...prev, walkIns: [...newRows, ...prev.walkIns], staff: newStaff, bikes: newBikes, isDemo: false };
      });
      return { imported, skipped };
    },
    clearDemoData: () => setState((prev) => ({ ...prev, walkIns: prev.walkIns.filter((item) => !item.demo), followUps: prev.followUps.filter((item) => !item.id.startsWith("demo-")), isDemo: false })),
    resetDemoData: () => setState(createDemoState()),
  }), [state, hydrated]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}

export function staffName(staff: Staff[], id: string) { return staff.find((item) => item.id === id)?.name ?? "Unknown"; }
