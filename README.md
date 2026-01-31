# Clansfolk Idle Prototype

Simple Electron + React prototype with a readable project layout.

## Structure
- `index.html` - Vite renderer entry
- `vite.config.js` - Vite config
- `src/main.js` - Electron main process
- `src/preload.js` - Safe IPC bridge (currently minimal)
- `src/renderer/main.jsx` - Renderer bootstrap
- `src/renderer/app.jsx` - UI presentation + interactions
- `src/renderer/models.js` - Data models and initial state
- `src/renderer/systems.js` - Pure simulation functions
- `src/renderer/sim.js` - Tick loop state evolution
- `src/renderer/data.js` - Data tables (buildings/techs/memories)
- `src/renderer/styles.css` - UI styles

## Run
```bash
npm install
npm run dev
```

In another terminal:
```bash
npm run dev:electron
```

Build for production:
```bash
npm run build
npm start
```

## Notes
- Uses Vite + React (no CDN/Babel).
- Saves to `localStorage` every 6s.
