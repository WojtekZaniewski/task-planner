# iOS Setup Guide

## Prerequisites
- Xcode installed (free from Mac App Store)
- Apple Developer account ($99/year) — needed for WidgetKit and App Store

---

## Step 1 — Generate the iOS project

```bash
npx cap add ios
npx cap open ios     # opens Xcode
```

---

## Step 2 — Configure signing in Xcode

1. Select the `App` target → Signing & Capabilities
2. Set **Bundle Identifier** to `com.yourname.tasks` (or whatever you used in capacitor.config.ts)
3. Set **Team** to your Apple Developer account

---

## Step 3 — Add App Group capability

Add this capability to **both** the main App target and the widget target:

1. `App` target → Signing & Capabilities → `+` → **App Groups**
2. Add group: `group.com.yourname.tasks`
3. Repeat for the Widget target once you add it (Step 5)

---

## Step 4 — Add the TokenBridge plugin

1. Drag `ios-widget-templates/TokenBridgePlugin.swift` into the **App** target in Xcode
2. Make sure "Add to target: App" is checked

---

## Step 5 — Add the WidgetKit extension

1. File → New → Target → **Widget Extension**
2. Name: `TasksWidget`
3. Uncheck "Include Configuration App Intent"
4. Drag `ios-widget-templates/TasksWidget.swift` into the **TasksWidget** target
5. Delete the template Swift file Xcode generated (replace it with yours)

---

## Step 6 — Fill in your Supabase credentials

Open `TasksWidget.swift` and replace:
- `YOUR_SUPABASE_URL` → your project ref (e.g. `abcdefghij`)
- `YOUR_ANON_KEY` → from Supabase → Settings → API → anon/public key

---

## Step 7 — Update capacitor.config.ts

Replace `https://your-app.vercel.app` with your actual Vercel deployment URL.

---

## Step 8 — Run on device

```bash
npm run ios:sync    # sync any web changes
npm run ios         # open Xcode
```

Then in Xcode: select your device → Run (▶)

---

## Testing the widget

1. Long-press the home screen → Edit
2. Tap `+` → search "tasks"
3. Add the widget (small or medium size)
4. Log in to the app — the widget will refresh within 10 minutes
