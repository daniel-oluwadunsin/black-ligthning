<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# AGENTS.md

## Project Overview

This project is called **Black Lightning**.

It is a high-end, Awwwards-style music recognition web app (Shazam-like) with a strong **dark + electric energy theme**.

The UI must feel:

- premium
- minimal
- cinematic
- highly polished

This is NOT a CRUD dashboard. Prioritize design quality and UX.

---

## Tech Stack

- Next.js (App Router)
- React (functional components only)
- Tailwind CSS (for styling)
- Framer Motion (for animations)

---

## Design System Rules

- Background: near-black
- Accent: electric yellow
- Avoid excessive colors
- Borders: subtle, NOT overly rounded (6px–10px max)
- No glassmorphism
- No generic UI

Typography:

- Strong hierarchy
- Large headings
- Clean spacing

---

## UI/UX Principles

- Minimal and intentional layout
- Smooth animations (no janky motion)
- Use micro-interactions (hover, focus, click feedback)
- Prioritize spacing and alignment

---

## Pages to Maintain

### Landing Page (/)

- Hero with strong headline
- Two CTAs: Add Song, Identify Song
- Subtle animated background

---

### Add Song Page (/add-song)

Form fields:

- title (string)
- artist (string)
- artwork (file)
- song (file)

Requirements:

- Drag-and-drop upload
- Artwork preview
- Show file name + size
- Simulated upload (progress bar)

---

### Identify Page (/identify)

Flow (SIMULATED):

1. Idle → "Tap to Scan"
2. Recording → show animation ("Listening...")
3. Processing → show loader ("Analyzing Signal...")
4. Result → show song (artwork, title, artist)

Use timeouts to simulate backend behavior.

---

## Components Guidelines

Create reusable components:

- Button (with subtle glow on hover)
- FileUpload (drag & drop + preview)
- Loader / EnergyIndicator
- SongCard

---

## Animation Rules

Use Framer Motion:

- Page transitions
- Recording pulse animation
- Result reveal (fade + slight upward motion)

Animations should feel:

- smooth
- intentional
- premium

Avoid:

- excessive bouncing
- flashy effects

---

## Code Style

- TypeScript strict mode

- Functional components only

- Clean folder structure:
  - /app
  - /components
  - /lib

- Use descriptive variable names

- Avoid unnecessary complexity

---

## Behavior Rules for Agent

When implementing features:

- Do NOT generate basic or generic UI
- Always prioritize design quality
- Keep components reusable
- Avoid overengineering

If unsure:

- choose simpler but cleaner solution

---

## Performance

- Avoid unnecessary re-renders
- Keep components lightweight
- Lazy load where appropriate

---

## Final Goal

The output should look like:

- Awwwards-level frontend
- Cinematic product experience
- Premium interaction design

NOT:

- dashboard
- template UI
- generic SaaS

<!-- END:nextjs-agent-rules -->
