/** Tailwind-Konfiguration – Farben und Schriften als Design-Tokens */
module.exports = {
  content: ['./index.html', './impressum.html', './datenschutz.html', './assets/js/**/*.js'],
  theme: {
    extend: {
      colors: {
        navy: '#0A3D62',      // Markenblau dunkel
        blue: '#0055A4',      // Markenblau hell (Links, Fokus)
        yellow: '#FFC107',    // Akzent – nur CTA und Leitlinien
        sun: '#FFD700',       // Akzent Hover
        ink: '#0C1B2A',       // Text
        steel: '#4A5A6A',     // Sekundärtext (AA auf Weiß und Paper)
        paper: '#F5F6F7',     // Off-White
        line: '#DDE2E7',      // Haarlinien
        deep: '#06263D',      // Footer
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};
