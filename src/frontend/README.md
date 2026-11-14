# src/frontend/

Frontend del proyecto: blink player, slider de épocas, modo diferencia, slider de 102 bandas y ficha de objeto.

## Stack propuesto
- React + Vite
- Tailwind CSS
- Canvas para el blink
- Plotly o Chart.js para el espectro
- Aladin Lite (opcional) para HiPS

## Instalación
```bash
cd src/frontend
npm install
npm run dev
```

## Componentes planeados
```text
src/
├── components/
│   ├── SearchBar.jsx
│   ├── TargetPresets.jsx
│   ├── BlinkPlayer.jsx
│   ├── EpochSlider.jsx
│   ├── DiffToggle.jsx
│   ├── BandSlider.jsx
│   ├── ObjectCard.jsx
│   ├── SpectrumChart.jsx
│   └── ShareButton.jsx
├── hooks/
├── api.js
└── App.jsx
```

## Reglas
- No llamar a IRSA directamente; usar `/api/*`.
- Precargar los primeros frames.
- Mostrar estados de carga y error.
- Responsive básico; mobile no es prioridad.
- Créditos NASA/IRSA visibles.
