import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { design } from "@/constants/design";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 10 : Math.max(insets.bottom, 8);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: design.colors.blue,
        tabBarInactiveTintColor: colors.muted,
        tabBarButton: HapticTab,
        tabBarStyle: { height: 62 + bottomPadding, paddingTop: 8, paddingBottom: bottomPadding, backgroundColor: `${colors.surface}F5`, borderTopColor: colors.border, shadowColor: "#93A5BA", shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: -5 }, elevation: 12 },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "800", letterSpacing: 0.1 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color }) => <IconSymbol size={23} name="house.fill" color={color} /> }} />
      <Tabs.Screen name="walk-ins" options={{ title: "Walk-ins", tabBarIcon: ({ color }) => <IconSymbol size={23} name="person.2.fill" color={color} /> }} />
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard", tabBarIcon: ({ color }) => <IconSymbol size={23} name="chart.bar.fill" color={color} /> }} />
      <Tabs.Screen name="follow-ups" options={{ title: "Follow-ups", tabBarIcon: ({ color }) => <IconSymbol size={23} name="calendar.badge.clock" color={color} /> }} />
      <Tabs.Screen name="more" options={{ title: "More", tabBarIcon: ({ color }) => <IconSymbol size={23} name="ellipsis.circle.fill" color={color} /> }} />
    </Tabs>
  );
}
