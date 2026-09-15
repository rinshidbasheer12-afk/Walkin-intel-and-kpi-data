import { Tabs } from "expo-router";
import { Platform, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { design } from "@/constants/design";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const desktop = Platform.OS === "web" && width >= 900;
  const bottomPadding = Platform.OS === "web" ? 10 : Math.max(insets.bottom, 8);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: design.colors.blue,
        tabBarInactiveTintColor: colors.muted,
        tabBarButton: HapticTab,
        tabBarPosition: desktop ? "left" : "bottom",
        tabBarVariant: desktop ? "material" : "uikit",
        tabBarStyle: desktop ? { width: 220, paddingTop: 28, paddingBottom: 28, paddingHorizontal: 12, backgroundColor: `${colors.surface}E8`, borderRightColor: `${colors.border}CC`, borderRightWidth: 1, shadowColor: "#9AAAC0", shadowOpacity: 0.12, shadowRadius: 24, shadowOffset: { width: 6, height: 0 }, elevation: 8 } : { height: 68 + bottomPadding, paddingTop: 10, paddingBottom: bottomPadding, backgroundColor: `${colors.surface}F2`, borderTopColor: `${colors.border}CC`, borderTopWidth: 1, shadowColor: "#9AAAC0", shadowOpacity: 0.14, shadowRadius: 22, shadowOffset: { width: 0, height: -6 }, elevation: 10 },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "800", letterSpacing: 0.1 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color }) => <IconSymbol size={23} name="house.fill" color={color} /> }} />
      <Tabs.Screen name="walk-ins" options={{ title: "Walk-ins", tabBarIcon: ({ color }) => <IconSymbol size={23} name="person.2.fill" color={color} /> }} />
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard", tabBarIcon: ({ color }) => <IconSymbol size={23} name="chart.bar.fill" color={color} /> }} />
      <Tabs.Screen name="team" options={{ title: "Team", tabBarIcon: ({ color }) => <IconSymbol size={23} name="person.3.fill" color={color} /> }} />
      <Tabs.Screen name="follow-ups" options={{ title: "Follow-ups", tabBarIcon: ({ color }) => <IconSymbol size={23} name="calendar.badge.clock" color={color} /> }} />
      <Tabs.Screen name="more" options={{ title: "More", tabBarIcon: ({ color }) => <IconSymbol size={23} name="ellipsis.circle.fill" color={color} /> }} />
    </Tabs>
  );
}
