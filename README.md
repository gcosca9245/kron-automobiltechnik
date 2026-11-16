# Kron Automobiltechnik – One-Page-Website (Demo)

Website für einen Kfz-Meisterbetrieb: Hero mit Werkstattvideo, Leistungen, scrollbasierte Firmengeschichte, Zusagen, Kundenstimmen, Terminanfrage und Footer.

**Live:** https://gcosca9245.github.io/kron-automobiltechnik/

> Alle Firmendaten sind fiktiv: Name, Adresse, Telefonnummer, Öffnungszeiten, Firmengeschichte und Kundenstimmen sind Platzhalter und vor einem Livegang zu ersetzen. Impressum und Datenschutz sind Platzhalterseiten.

## Technik

- HTML, Tailwind CSS 3.4 (kompiliert, kein CDN), Vanilla JS
- [Lenis](https://github.com/darkroomengineering/lenis) 1.3.4 für weiches Scrollen
- [GSAP](https://gsap.com) 3.13.0 mit ScrollTrigger für Reveals, dezente Parallaxe und die Timeline
- Alle Bibliotheken, Schriften und Medien liegen im Repository; die Seite lädt nichts von fremden Servern
- Animiert werden nur `transform` und `opacity`
- `prefers-reduced-motion`: kein Lenis, keine Parallaxe, Inhalte sofort sichtbar, Video pausiert (Poster bleibt)
- Hero-Video mit Pause-Schalter, eigener Hochformat-Variante für Smartphones und Pause außerhalb des Sichtbereichs
- Terminformular mit Validierung im Browser; ohne Backend wird nach dem Absenden eine vorbereitete E-Mail (mailto) angeboten

## Struktur

```
index.html              One-Pager
impressum.html          Platzhalter
datenschutz.html        Platzhalter
src/input.css           Quell-CSS (Tailwind + Komponenten)
assets/css/styles.css   kompiliertes CSS
assets/js/main.js       Scroll-Choreografie, Menü, Video, Formular
assets/vendor/          gsap.min.js, ScrollTrigger.min.js, lenis.min.js
assets/fonts/           Manrope (variabel), JetBrains Mono 500
assets/media/           Hero-Video (Desktop/Mobil), Poster, Standbilder
```

## Entwicklung

```bash
npm install
npm run build:css   # CSS neu bauen
npx serve .         # oder: python3 -m http.server
```

## Medien und Lizenzen

| Datei | Quelle | Lizenz |
| --- | --- | --- |
| `assets/media/hero-1600.mp4`, `hero-mobile.mp4`, `hero-poster*.webp`, `still-hall.webp`, `still-lift.webp` | Video von Artem Podrez, [Pexels 8987215](https://www.pexels.com/video/8987215/) – geschnitten, nahtlos geloopt, farblich angepasst, auf 1600×900 bzw. 608×1080 komprimiert | [Pexels-Lizenz](https://www.pexels.com/license/) |
| `assets/media/still-engine.webp`, `still-detail.webp` | Standbilder aus Video von Vitaliy Izonin, [Pexels 32329382](https://www.pexels.com/video/32329382/) | Pexels-Lizenz |
| `assets/media/still-mechanic.webp` | Standbild aus Video von Gustavo Fring, [Pexels 6685051](https://www.pexels.com/video/6685051/) | Pexels-Lizenz |
| Manrope, JetBrains Mono | via Fontsource | SIL Open Font License 1.1 |
| GSAP 3.13 | GreenSock | GSAP Standard License (kostenlos) |
| Lenis | darkroom.engineering | MIT |
| Tailwind CSS | Tailwind Labs | MIT |

Die Pexels-Lizenz erlaubt kostenlose kommerzielle Nutzung und Bearbeitung ohne Namensnennung (Nennung erfolgt freiwillig). Die abgebildeten Personen sind Stock-Darsteller und nicht das Team des Betriebs; vor einem Livegang durch eigene Fotos ersetzen.

## Deployment

GitHub Pages aus dem Branch `gh-pages`, aktualisiert durch `.github/workflows/deploy.yml` bei jedem Push auf `main`.
