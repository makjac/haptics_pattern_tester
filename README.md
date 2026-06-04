# Haptics Pattern Tester

<p align="center">
  <img src="favicon.svg" width="64" height="64" alt="Haptics Pattern Tester logo">
</p>

<p align="center">
  <strong>Free online haptic pattern editor with draggable timeline, live preview, and multi-platform export.</strong>
</p>

<p align="center">
  <a href="https://maks.github.io/Haptics_Pattern_Tester/" target="_blank"><strong>🚀 Live Demo</strong></a> ·
  <a href="#features">Features</a> ·
  <a href="#usage">Usage</a> ·
  <a href="#export">Export</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="License: MIT">
  <img src="https://img.shields.io/badge/platform-web-blueviolet.svg?style=flat-square" alt="Platform: Web">
  <img src="https://img.shields.io/badge/vanilla-js-ff69b4.svg?style=flat-square&logo=javascript" alt="Vanilla JS">
  <img src="https://img.shields.io/badge/flutter-export-02569B.svg?style=flat-square&logo=flutter" alt="Flutter Export">
  <img src="https://img.shields.io/badge/webaudio-supported-orange.svg?style=flat-square" alt="WebAudio">
  <img src="https://img.shields.io/badge/responsive-yes-success.svg?style=flat-square" alt="Responsive">
  <img src="https://img.shields.io/badge/build-none-ff4757.svg?style=flat-square" alt="No Build Step">
  <img src="https://img.shields.io/github/languages/top/maks/Haptics_Pattern_Tester.svg?style=flat-square" alt="Top Language">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome">
</p>

---

## Features

| Feature | Description |
| --------- | ------------- |
| 🎚️ **Draggable Timeline** | Click and drag segments horizontally to change duration, vertically to change intensity (0–255). |
| 🔊 **Live Preview** | Hear and feel the pattern instantly using the Web Audio API and Vibration API. |
| ⚡ **Total Time Scaler** | Drag the **Total ms** dashboard card to proportionally scale the entire pattern. |
| 🎛️ **Intensity Presets** | One-click intensity adjustments: `off` / `soft` / `med` / `hard` / `max`. |
| 📋 **Multi-Platform Export** | Copy-ready code for Flutter, Extended JSON, and Shareable URLs. |
| 🔗 **Deep Linking** | Share patterns via URL — anyone opening the link sees your exact pattern. |
| 📱 **Mobile First** | Fully responsive with touch-friendly controls and larger targets on phones. |
| 🎨 **Dark Theme** | Easy on the eyes with a carefully tuned dark color palette. |
| 🚫 **Zero Build Step** | Pure HTML/CSS/JS — clone and open in a browser. |

---

## Usage

### Quick Start

1. **Open the app** — visit the [live demo](https://maks.github.io/Haptics_Pattern_Tester/) or open `index.html` locally.
2. **Pick a preset** — choose from `message`, `error`, `call`, `success`, `double tap`, or `heartbeat`.
3. **Edit the pattern** — drag timeline segments or edit the JSON directly.
4. **Preview** — hit **Play** to hear/feel the pattern.
5. **Export** — copy code for your target platform.

### Pattern Formats

The editor accepts two JSON formats:

#### Simple List (uniform intensity)

```json
[0, 100, 50, 200, 80, 150]
```

- `0` = initial delay
- alternating values = vibration duration, pause duration
- All segments use maximum intensity (`255`).

#### Extended Objects (per-segment intensity)

```json
[{"d":100,"p":255},{"d":50,"p":0},{"d":200,"p":180}]
```

- `d` = duration (ms)
- `p` = power/intensity (`0` = pause, `1–255` = vibration strength)

### Timeline Controls

| Action | How |
|--------|-----|
| Add segment/pause | Click the **+ add** button on the right side of the timeline |
| Remove last | Click the **− rm** button |
| Change duration | Drag a segment **horizontally** |
| Change intensity | Drag a segment **vertically** |
| Scale entire pattern | Drag the **Total ms** dashboard card left/right |

---

## Export

Click any export tab to generate and copy code instantly:

### Flutter

```dart
// Flutter – Vibration package
Vibration.vibrate(
  pattern: [0, 100, 50, 200],
  intensities: [255, 255, 0, 180],
);
```

- Automatically includes `intensities:` when any segment has custom power.

### Extended JSON

```json
[{"d":100,"p":255},{"d":50,"p":0},{"d":200,"p":180}]
```

- Portable format with full per-segment control.

### Share Link

```url
https://maks.github.io/Haptics_Pattern_Tester/?p=%5B0%2C100%2C50%2C200%5D
```

- Copy a clean URL anyone can open to see your exact pattern.

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `Esc` | Stop |
| `L` | Toggle Loop |
| Click value labels (Volume, Speed) | Inline edit |

---

## Tech Stack

- **Vanilla JavaScript** (ES6+) — no frameworks, no build step
- **Canvas API** — custom timeline rendering
- **Web Audio API** — audio preview generation
- **Vibration API** — native vibration on supported devices
- **CSS3 Flexbox & Grid** — responsive layout

---

## Self-Host / GitHub Pages

No build step required.

```bash
# Clone
git clone https://github.com/maks/Haptics_Pattern_Tester.git

# Open locally
cd Haptics_Pattern_Tester
open index.html        # macOS
xdg-open index.html    # Linux
start index.html       # Windows

# Or serve with any static server
python3 -m http.server 8000
npx serve .
```

### Deploy to GitHub Pages

1. Fork or push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Select **Deploy from a branch** → `main` → `/ (root)`.
4. Your site will be live at `https://<username>.github.io/Haptics_Pattern_Tester/`.

> **SEO ready** — includes `robots.txt`, `sitemap.xml`, Open Graph tags, Twitter Cards, and JSON-LD structured data.

---

## Browser Support

| Browser | Audio | Vibration | Notes |
|---------|-------|-----------|-------|
| Chrome / Edge | ✅ | ✅ (Android) | Full support |
| Firefox | ✅ | ✅ (Android) | Full support |
| Safari | ✅ | ❌ | Audio only on iOS/macOS |
| Samsung Internet | ✅ | ✅ | Full support |

> **Note:** The Vibration API requires a physical device. It does not work on desktop browsers.

---

## Project Structure

```
Haptics_Pattern_Tester/
├── index.html          # Main application
├── favicon.svg         # App icon
├── robots.txt          # SEO: allow all crawlers
├── sitemap.xml         # SEO: sitemap for Google
├── css/
│   └── style.css       # All styles, responsive breakpoints
└── js/
    ├── presets.js      # Built-in pattern presets
    ├── parser.js       # JSON parsing & textarea sync
    ├── timeline.js     # Canvas renderer & drag handles
    ├── playback.js     # Audio + vibration playback engine
    ├── controls.js     # UI controls & inline editing
    ├── export.js       # Code generation for all formats
    └── app.js          # App init, state, deep linking
```

---

## Contributing

Contributions are welcome! Feel free to open an issue or submit a PR.

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request
