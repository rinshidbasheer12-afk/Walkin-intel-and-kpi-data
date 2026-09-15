import { Image } from "expo-image";
import { Text, View } from "react-native";

import { useColors } from "@/hooks/use-colors";
import type { Staff } from "@/lib/app-store";

export function StaffAvatar({ staff, size = 40 }: { staff?: Staff; size?: number }) {
  const colors = useColors();
  const name = staff?.name ?? "Team";
  return staff?.photoUri ? <Image source={{ uri: staff.photoUri }} contentFit="cover" transition={120} style={{ width: size, height: size, borderRadius: size * 0.34 }} /> : <View style={{ width: size, height: size, borderRadius: size * 0.34, backgroundColor: `${colors.primary}18`, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: `${colors.primary}30` }}><Text style={{ color: colors.primary, fontWeight: "900", fontSize: Math.max(11, size * 0.32) }}>{name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</Text></View>;
}
