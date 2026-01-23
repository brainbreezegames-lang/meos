# MeOS

A personal "web desktop" builder that lets users create an explorable macOS-style portfolio and link-in-bio experience.

## Workflow Rules

**Always commit and push**: After completing any code changes, immediately commit and push to git. Never ask "would you like me to commit?" - just do it automatically.

**Demo URL**: https://meos-delta.vercel.app/goos-v2 (auto-deploys from git push)

## Design Context

### Users
Creative professionals (designers, artists, photographers) building memorable online portfolios. They want to showcase their work in a way that feels unique and reflects their personality—not another generic template. The experience should invite exploration and leave a lasting impression on visitors.

### Brand Personality
**Playful, polished, personal.**

MeOS is fun without being childish, crafted without being cold, and expressive without being overwhelming. It's the digital equivalent of a beautifully designed home office—where everything has its place, but personality shines through in the details.

### Aesthetic Direction

**Visual Tone:** Premium macOS-inspired design with attention to craft. Glass morphism, subtle shadows, smooth animations, and spatial depth create an immersive "desktop" feeling.

**Primary Reference:** Apple/macOS design language—specifically the balance of playfulness (bouncy dock animations, traffic lights) with professional polish (typography, spacing, glass effects).

**Anti-References (what to avoid):**
- Generic website builder templates (Squarespace/Wix defaults)
- Stiff, corporate enterprise software aesthetics
- Cluttered, busy, overwhelming layouts
- Cheap gradients, clip art, or amateur visual treatments

**Theme Support:** Four themes with distinct personalities:
1. **Monterey** (default) - Classic macOS: rounded, soft, glossy, vibrant
2. **Dark** - Premium tech: sharp edges, neon glows, futuristic
3. **Bluren** - Ultra-minimal Apple: paper-thin, airy, geometric precision
4. **Refined** - Editorial luxury: serif typography, warm, sophisticated

### Design Principles

1. **Craft in the details** - Every shadow, animation, and spacing decision should feel intentional. The magic is in the micro-interactions.

2. **Invite exploration** - The desktop metaphor should make people want to click around. Reward curiosity with delightful discoveries.

3. **Personal, not generic** - Every design choice should support self-expression. Avoid anything that feels like a template.

4. **Polish over features** - A few things done beautifully beats many things done adequately. Prioritize refinement.

5. **Accessible delight** - Animations and effects should enhance, not exclude. Support reduced motion, maintain contrast, ensure keyboard navigation works everywhere.

### Accessibility Requirements
- WCAG AA compliance minimum (color contrast, keyboard navigation)
- Full `prefers-reduced-motion` support for all animations
- Semantic HTML and comprehensive ARIA labels
- Screen reader friendly interactions
- Focus states visible on all interactive elements
