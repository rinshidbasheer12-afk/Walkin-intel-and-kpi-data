import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconName = ComponentProps<typeof MaterialIcons>["name"];
const MAPPING: Record<string, IconName> = {
  "house.fill": "home",
  "person.2.fill": "people",
  "person.3.fill": "groups",
  "chart.bar.fill": "bar-chart",
  "calendar.badge.clock": "event",
  "ellipsis.circle.fill": "more-horiz",
  "plus.circle.fill": "add-circle",
  "arrow.up.right": "north-east",
  "arrow.down.right": "south-east",
  "checkmark.circle.fill": "check-circle",
  "exclamationmark.triangle.fill": "warning",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "bicycle": "directions-bike",
  "magnifyingglass": "search",
  "line.3.horizontal.decrease.circle": "filter-list",
  "square.and.arrow.up": "ios-share",
  "arrow.down.doc": "file-download",
  "person.badge.plus": "person-add",
  "shippingbox": "inventory-2",
  "gearshape.fill": "settings",
  "chart.pie.fill": "pie-chart",
  "arrow.clockwise": "refresh",
  "xmark": "close",
  "checkmark": "check",
  "flame.fill": "local-fire-department",
  "clock.fill": "schedule",
  "dollarsign.circle.fill": "paid",
  "target": "gps-fixed",
  "doc.text.fill": "description",
  "upload": "upload-file",
};

export function IconSymbol({ name, size = 24, color, style, weight: _weight }: { name: string; size?: number; color: string | OpaqueColorValue; style?: StyleProp<TextStyle>; weight?: string }) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name] ?? "circle"} style={style} />;
}
