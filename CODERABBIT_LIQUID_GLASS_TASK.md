# Liquid Glass UI Fix

## Repository task

Implement the rendering-only liquid-glass redesign in this Expo Router SDK 54 app. Preserve all routes, navigation, copy, data storage, KPI calculations, and interaction logic.

### 1. Dependency

Run:

```bash
pnpm expo install expo-blur
```

Commit the resulting `package.json` and `pnpm-lock.yaml` changes. Do not hand-edit the lockfile if the command can update it.

### 2. Shared atmosphere

Update `components/screen-container.tsx`:

- Add `atmosphere?: boolean`, defaulting to `true`.
- Add `atmosphereTones?: string[]`, defaulting to `[design.colors.blue, design.colors.purple, design.colors.pink]`.
- Use `useColors()` and `isLightPalette(colors.background)`.
- When enabled, render three large, soft `LinearGradient` blobs behind the safe-area content, absolutely positioned and with `pointerEvents="none"`.
- Use approximately 35% alpha for light mode and 20% for dark mode.
- Keep the wrapper API and existing className/style behavior compatible.

### 3. Real GlassCard blur

Update `components/ui-kit.tsx`:

- Import `BlurView` from `expo-blur`.
- Keep `GlassCard`'s existing radius, overflow clipping, edge highlight, tint, shadow, and optional press behavior.
- Put a full-size `BlurView` behind the existing translucent `glassSurface()` layer.
- Use intensity 60 in light mode and 40 in dark mode.
- Use `tint="light"` or `tint="dark"` based on `isLightPalette(colors.background)`.
- Use `experimentalBlurMethod="dimezisBlurView"`.
- Ensure the blur and tint remain clipped to rounded corners.

### 4. Replace flat cards

Use `GlassCard` for card surfaces, preserving all children and logic, in:

- `app/(tabs)/index.tsx`: Today's follow-ups and Demand signal panels.
- `app/(tabs)/dashboard.tsx`: overview, activity, improve, and insight card surfaces.
- `app/(tabs)/team.tsx`.
- `app/(tabs)/follow-ups.tsx`.
- `app/(tabs)/more.tsx`.
- `app/(tabs)/walk-ins.tsx`.
- `app/analysis.tsx`.
- `app/employee/[id].tsx`.

Do not replace intentionally colored controls, banners, search fields, KPI tiles, chart internals, or modal surfaces unless they are clearly flat content cards. Import `GlassCard` wherever required. Avoid nested duplicate card padding or borders when moving the style to `GlassCard`.

### 5. Home KPI tiles

Update `MetricCard` in `components/ui-kit.tsx`:

- Use `design.radius.xl`.
- Add a `glow` color to the existing accent map, matching each tile gradient's first stop.
- Set tile shadow color to its glow, opacity around 0.35, radius around 20, with a soft downward offset.
- Add a subtle translucent rounded glow blob inside a corner of the tile.
- Preserve DotNumber numerals and the existing icon circle exactly.
- Preserve existing label-to-accent behavior and press behavior.

### 6. Dashboard duplicate atmosphere

Remove dashboard's bespoke atmosphere/glow background block and its related unused styles/imports. Let `ScreenContainer` be the single source of ambient background rendering. Keep dashboard content layout unchanged.

### 7. Validation

Run:

```bash
pnpm check
pnpm lint
```

Verify that `GlassCard` is imported and used in all eight listed files. Run the app and capture actual Home and Dashboard screenshots at approximately 390px and 1280px widths. Confirm visually:

- soft blue/purple/pink ambient blobs are visible behind content;
- panels are translucent and visibly frosted rather than flat opaque rectangles;
- Home KPI tiles have saturated gradients and colored halos;
- Dashboard no longer renders a second bespoke atmosphere layer.

Report screenshot dimensions and what was visibly confirmed. Do not report the task as complete based only on TypeScript, lint, or build success.
