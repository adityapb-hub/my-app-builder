# CoopConnect — build roadmap

## Locked decisions
- Theme: primary #2563EB, secondary #10B981, white background, #F8FAFC cards
- Audience: general public, sign-in required for personal data
- Three roles: Service Seeker, Service Provider, Community
- AI Smart Assistant for "describe your problem" → category + cost estimate + nearby experts

## Tasks
- [x] Lovable Cloud backend enabled
- [ ] Design tokens + fonts in src/styles.css
- [ ] Database migration: profiles, roles, providers, requests, reviews, community tasks, votes, messages + GRANTs + RLS + seed directory data
- [ ] Private storage bucket for request photos / ID proofs
- [ ] Auth: email + password and Google sign-in at /auth
- [ ] Role selection + profile setup
- [ ] Seeker flow: service picker → job details (photos, date, location) → nearby providers → hire
- [ ] Booking screen: confirmation, status, live tracking, chat, review
- [ ] Provider flow: registration (skills, experience, ID, certificates) → dashboard → incoming requests → earnings
- [ ] Community tab: create task, join, vote
- [ ] AI Smart Assistant screen
- [ ] Per-route head() metadata
- [ ] Build check + Playwright smoke test

## Blocked / needs the user
- Phone-number sign-in: needs the project's own SMS provider credentials (not provisioned automatically). Not built yet.
