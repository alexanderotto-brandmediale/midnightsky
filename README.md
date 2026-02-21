# alexanderotto.de

Personal landing page for Alexander Otto.

## Overview

A futuristic, dark-themed single-page website with smooth animations, particle effects, and responsive design.

## Tech Stack

- **HTML5** / **CSS3** / **Vanilla JS** — no frameworks, no build step
- **Google Fonts** — Inter + Space Grotesk
- Canvas-based particle system with connecting lines
- IntersectionObserver scroll reveal animations
- CSS custom properties for theming

## Structure

```
index.html    — Page markup and structure
styles.css    — All styles, animations, responsive breakpoints
script.js     — Particle system, scroll reveals, nav behavior
```

## Sections

1. **Hero** — Name, tagline, animated particle background
2. **About** — Bio text with rotating geometric rings
3. **Expertise** — Skill cards (Development, Design, Strategy)
4. **Contact** — Links to email, LinkedIn, GitHub, X/Twitter

## Development

Open `index.html` in a browser. No build tools required.

For local development with live reload:

```bash
npx serve .
```

## Customization

- **Colors** — Edit CSS custom properties in `:root` (styles.css)
- **Content** — Update text directly in index.html
- **Links** — Replace placeholder URLs in the Contact section
- **Particles** — Adjust `PARTICLE_COUNT` and `CONNECT_DIST` in script.js

## Deployment

Static files — deploy to any hosting provider (Netlify, Vercel, GitHub Pages, traditional web hosting).
