# Task: Landing Page Hero Integration

### Status: [x] Planning | [ ] In Progress | [ ] Complete

### Objective
Integrate the animated-shader-hero component as a landing page with sign up, sign in, and onboarding connections.

### Plan
1. **Copy component** — Save `animated-shader-hero.tsx` to `src/components/ui/`, fixing JSX syntax (the provided code has broken JSX with bare text instead of proper elements)
2. **Create Landing page** — Create `src/pages/Landing.tsx` using the Hero component, configured with News2Flow AI branding, current color palette, and CTA buttons linking to `/signup` and `/login`
3. **Update routing** — Change `App.tsx` so `/` renders the Landing page (no layout), move Dashboard to `/dashboard`
4. **Wire navigation** — Ensure sign up/login buttons navigate correctly, and post-login/signup flows redirect to `/dashboard` or `/onboarding`

### Reasoning
- The hero component uses WebGL shaders — no external deps needed beyond React
- The provided JSX is malformed (missing actual HTML tags, just text descriptions). I'll reconstruct proper JSX based on the structure described
- Landing page should be standalone (no sidebar layout) like auth pages
- Keep existing color palette and design tokens

### Changes Made
<!-- Updated after implementation -->
