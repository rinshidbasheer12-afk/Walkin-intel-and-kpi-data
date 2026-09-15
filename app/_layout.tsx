import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AppProvider } from "@/lib/app-store";
import { AppearanceProvider } from "@/lib/appearance";
import { ThemeProvider } from "@/lib/theme-provider";
import "../global.css";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppearanceProvider>
        <ThemeProvider>
          <AppProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
            </Stack>
          </AppProvider>
        </ThemeProvider>
      </AppearanceProvider>
    </GestureHandlerRootView>
  );
}
