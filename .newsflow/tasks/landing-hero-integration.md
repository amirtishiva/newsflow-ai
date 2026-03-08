# Task: Landing Page Hero Integration

### Status: [ ] Planning | [ ] In Progress | [x] Complete

### Objective
Integrate the animated-shader-hero component as a landing page with sign up, sign in, and onboarding connections.

### Plan
1. Copy component to `src/components/ui/animated-shader-hero.tsx` — fixed broken JSX from provided code
2. Create `src/pages/Landing.tsx` with News2Flow AI branding
3. Update `App.tsx` routing: `/` → Landing, `/dashboard` → Dashboard
4. Wire auth redirects: Login → `/dashboard`, Signup → `/onboarding`, Onboarding → `/dashboard`
5. Update sidebar Dashboard link to `/dashboard`

### Changes Made
- **`src/components/ui/animated-shader-hero.tsx`** — Created WebGL shader hero component with proper JSX, simplified renderer (removed pointer tracking complexity), uses project design tokens for font classes
- **`src/pages/Landing.tsx`** — Landing page using Hero component with News2Flow AI branding, trust badge with lucide icons, CTA buttons routing to `/signup` and `/login`
- **`src/App.tsx`** — Added Landing import, `/` route renders Landing (no layout), Dashboard moved to `/dashboard`
- **`src/pages/Login.tsx`** — Post-login redirect changed from `/` to `/dashboard`
- **`src/pages/Signup.tsx`** — Post-signup redirect changed from `/login` to `/onboarding`
- **`src/pages/Onboarding.tsx`** — Post-onboarding redirect changed from `/` to `/dashboard`
- **`src/components/AppSidebar.tsx`** — Dashboard nav link updated from `/` to `/dashboard`
