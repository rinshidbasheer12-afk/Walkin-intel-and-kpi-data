import React, { ReactNode, useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Platform, Pressable, StyleProp, Text, TextStyle, useWindowDimensions, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
export { nextScrollVisibility } from "@/lib/awwwards-motion";

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled?.().then((value) => { if (mounted) setReduced(value); });
    const subscription = AccessibilityInfo.addEventListener?.("reduceMotionChanged", setReduced);
    return () => { mounted = false; subscription?.remove?.(); };
  }, []);
  return reduced;
}

export function RevealTitle({ text, style }: { text: string; style?: StyleProp<TextStyle> }) {
  const reduced = useReducedMotion();
  const words = text.split(" ");
  const values = useRef(words.map(() => new Animated.Value(reduced ? 1 : 0))).current;
  useEffect(() => {
    values.forEach((value, index) => {
      value.stopAnimation();
      value.setValue(reduced ? 1 : 0);
      if (!reduced) Animated.timing(value, { toValue: 1, duration: 240, delay: index * 42, useNativeDriver: true }).start();
    });
  }, [reduced, values]);
  return <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: 7 }} accessibilityRole="header"><Text style={[style, { position: "absolute", opacity: 0 }]}>{text}</Text>{words.map((word, index) => <Animated.Text key={`${word}-${index}`} style={[style, { opacity: values[index], transform: [{ translateY: values[index].interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }, { rotateX: values[index].interpolate({ inputRange: [0, 1], outputRange: ["-32deg", "0deg"] }) }] }]}>{word}</Animated.Text>)}</View>;
}

export function DesktopHoverCard({ children, style, onPress, glow = false }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; glow?: boolean }) {
  const reduced = useReducedMotion();
  const { width } = useWindowDimensions();
  const enabled = Platform.OS === "web" && width >= 900 && !reduced;
  const lift = useRef(new Animated.Value(0)).current;
  const sheen = useRef(new Animated.Value(0)).current;
  const animate = (toValue: number) => Animated.parallel([
    Animated.timing(lift, { toValue, duration: 180, useNativeDriver: true }),
    Animated.timing(sheen, { toValue, duration: 220, useNativeDriver: true }),
  ]).start();
  const content = <Animated.View style={[style, enabled && { transform: [{ perspective: 700 }, { translateY: lift.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }, { rotateY: lift.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "0.8deg"] }) }] }]}>{glow && <Animated.View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: enabled ? sheen : 0, transform: [{ scale: sheen.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }] }}><LinearGradient colors={["#FFFFFF72", "#FFFFFF18", "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }} /></Animated.View>}{children}</Animated.View>;
  if (!onPress) return <Pressable disabled={!enabled} onHoverIn={() => animate(1)} onHoverOut={() => animate(0)}>{content}</Pressable>;
  return <Pressable onPress={onPress} onHoverIn={() => animate(1)} onHoverOut={() => animate(0)} style={({ pressed }) => [pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] }]}>{content}</Pressable>;
}

export function SpotlightAction({ children, onPress, style }: { children: ReactNode; onPress?: () => void; style?: StyleProp<ViewStyle> }) {
  const reduced = useReducedMotion();
  const glow = useRef(new Animated.Value(0)).current;
  const enabled = Platform.OS === "web" && !reduced;
  const pulse = (toValue: number) => Animated.timing(glow, { toValue, duration: 160, useNativeDriver: true }).start();
  return <Pressable onPress={onPress} onHoverIn={() => pulse(1)} onHoverOut={() => pulse(0)} style={({ pressed }) => [style, pressed && { opacity: 0.86, transform: [{ scale: 0.985 }] }]}><View style={{ position: "relative", overflow: "hidden", borderRadius: 18 }}><Animated.View style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF", opacity: enabled ? glow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.16] }) : 0 }} />{children}</View></Pressable>;
}
