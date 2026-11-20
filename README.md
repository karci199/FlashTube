# FlashTube

A fast, customizable layer over youtube.com, as a browser extension (Edge and Chrome, Manifest V3).
It changes how YouTube looks and works without taking anything away: the real site stays underneath,
so every feature of your account keeps working.

Status: infrastructure. The first feature (hide Shorts) proves the pipeline; the UI comes next.

## Build

Requires Node.js 20 or newer.

```powershell
npm install
npm run check
```

Then load `dist/` in `edge://extensions` or `chrome://extensions` with developer mode on ("Load unpacked").
