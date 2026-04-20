# Custom Design System (based on Notion)

## 1. Visual Theme & Atmosphere

Notion's website embodies the philosophy of the tool itself: a blank canvas that gets out of your way. The design system is built on warm neutrals rather than cold grays, creating a distinctly approachable minimalism that feels like quality paper rather than sterile glass. The page canvas is pure white (`#ffffff`) but the text isn't pure black -- it's a warm near-black (`rgba(0,0,0,0.95)`) that softens the reading experience imperceptibly. The warm gray scale (`#f6f5f4`, `#31302e`, `#615d59`, `#a39e98`) carries subtle yellow-brown undertones, giving the interface a tactile, almost analog warmth.

The custom NotionInter font (a modified Inter) is the backbone of the system. At display sizes (64px), it uses aggressive negative letter-spacing (-2.125px), creating headlines that feel compressed and precise. The weight range is broader than typical systems: 400 for body, 500 for UI elements, 600 for semi-bold labels, and 700 for display headings. OpenType features `"lnum"` (lining numerals) and `"locl"` (localized forms) are enabled on larger text, adding typographic sophistication that rewards close reading.

What makes Notion's visual language distinctive is its border philosophy. Rather than heavy borders or shadows, Notion uses ultra-thin `1px solid rgba(0,0,0,0.1)` borders -- borders that exist as whispers, barely perceptible division lines that create structure without weight. The shadow system is equally restrained: multi-layer stacks with cumulative opacity never exceeding 0.05, creating depth that's felt rather than seen.

**Key Characteristics:**
- NotionInter (modified Inter) with negative letter-spacing at display sizes (-2.125px at 64px)
- Warm neutral palette: grays carry yellow-brown undertones (`#f6f5f4` warm white, `#31302e` warm dark)
- Near-black text via `rgba(0,0,0,0.95)` -- not pure black, creating micro-warmth
- Ultra-thin borders: `1px solid rgba(0,0,0,0.1)` throughout -- whisper-weight division
- Multi-layer shadow stacks with sub-0.05 opacity for barely-there depth
- Notion Blue (`#171717`) as the singular accent color for CTAs and interactive elements
- Pill badges (9999px radius) with tinted blue backgrounds for status indicators
- 8px base spacing unit with an organic, non-rigid scale

### Do's and Don'ts

- **DO** use warm near-black for text via `rgba(0,0,0,0.95)` — pure `#000000` reads as cold and clinical against Notion's warm canvas.
- **DON'T** use cold grays (`#9ca3af`, `#6b7280`) — they break the warm yellow-brown undertone that defines Notion's analog feel.
- **DO** apply aggressive negative tracking (-2.125px at 64px) on display headlines using NotionInter (or standard Inter).
- **DON'T** use default tracking on display sizes — Notion's typography is precisely engineered, not casual.
- **DO** use ultra-thin `1px solid rgba(0,0,0,0.1)` borders as the dominant separation pattern — they exist as whispers.
- **DON'T** use heavy borders, opaque colors, or visible shadows — Notion's depth is felt, not seen.
- **DO** stack multi-layer shadows with each layer below 0.05 opacity for cumulative depth.
- **DON'T** use single-layer drop shadows over 0.1 opacity — they read as heavy and break the analog warmth.
- **DO** reserve Notion Blue `#171717` for CTAs and interactive elements only — it's the singular accent.
- **DON'T** scatter blue across borders, dividers, or decorative elements — the brand uses blue surgically.
- **DO** enable OpenType `"lnum"` and `"locl"` features on larger text — they reward close reading.
- **DON'T** disable these features for Latin-only contexts — they're part of Notion's typographic refinement.

## 2. Color Palette & Roles

### Primary
- **Notion Black** (`rgba(0,0,0,0.95)` / `#000000f2`): Primary text, headings, body copy. The 95% opacity softens pure black without sacrificing readability.
- **Pure White** (`#ffffff`): Page background, card surfaces, button text on blue.
- **Notion Blue** (`#171717`): Primary CTA, link color, interactive accent -- the only saturated color in the core UI chrome.

### Brand Secondary
- **Deep Navy** (`#213183`): Secondary brand color, used sparingly for emphasis and dark feature sections.
- **Active Blue** (`#005bab`): Button active/pressed state -- darker variant of Notion Blue.

### Warm Neutral Scale
- **Warm White** (`#f6f5f4`): Background surface tint, section alternation, subtle card fill. The yellow undertone is key.
- **Warm Dark** (`#31302e`): Dark surface background, dark section text. Warmer than standard grays.
- **Warm Gray 500** (`#615d59`): Secondary text, descriptions, muted labels.
- **Warm Gray 300** (`#a39e98`): Placeholder text, disabled states, caption text.

### Semantic Accent Colors
- **Teal** (`#2a9d99`): Success states, positive indicators.
- **Green** (`#1aae39`): Confirmation, completion badges.
- **Orange** (`#dd5b00`): Warning states, attention indicators.
- **Pink** (`#ff64c8`): Decorative accent, feature highlights.
- **Purple** (`#391c57`): Premium features, deep accents.
- **Brown** (`#523410`): Earthy accent, warm feature sections.

### Interactive
- **Link Blue** (`#171717`): Primary link color with underline-on-hover.
- **Link Light Blue** (`#62aef0`): Lighter link variant for dark backgrounds.
- **Focus Blue** (`#097fe8`): Focus ring on interactive elements.
- **Badge Blue Bg** (`#f2f9ff`): Pill badge background, tinted blue surface.
- **Badge Blue Text** (`#097fe8`): Pill badge text, darker blue for readability.

### Shadows & Depth
- **Card Shadow** (`rgba(0,0,0,0.04) 0px 4px 18px, rgba(0,0,0,0.027) 0px 2.025px 7.84688px, rgba(0,0,0,0.02) 0px 0.8px 2.925px, rgba(0,0,0,0.01) 0px 0.175px 1.04062px`): Multi-layer card elevation.
- **Deep Shadow** (`rgba(0,0,0,0.01) 0px 1px 3px, rgba(0,0,0,0.02) 0px 3px 7px, rgba(0,0,0,0.02) 0px 7px 15px, rgba(0,0,0,0.04) 0px 14px 28px, rgba(0,0,0,0.05) 0px 23px 52px`): Five-layer deep elevation for modals and featured content.
- **Whisper Border** (`1px solid rgba(0,0,0,0.1)`): Standard division border -- cards, dividers, sections.

## 3. Typography Rules

### Font Family
- **Primary**: `NotionInter`, with fallbacks: `Inter, -apple-system, system-ui, Segoe UI, Helvetica, Apple Color Emoji, Arial, Segoe UI Emoji, Segoe UI Symbol`
- **OpenType Features**: `"lnum"` (lining numerals) and `"locl"` (localized forms) enabled on display and heading text.

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display Hero | NotionInter | 64px (4.00rem) | 700 | 1.00 (tight) | -2.125px | Maximum compression, billboard headlines |
| Display Secondary | NotionInter | 54px (3.38rem) | 700 | 1.04 (tight) | -1.875px | Secondary hero, feature headlines |
| Section Heading | NotionInter | 48px (3.00rem) | 700 | 1.00 (tight) | -1.5px | Feature section titles, with `"lnum"` |
| Sub-heading Large | NotionInter | 40px (2.50rem) | 700 | 1.50 | normal | Card headings, feature sub-sections |
| Sub-heading | NotionInter | 26px (1.63rem) | 700 | 1.23 (tight) | -0.625px | Section sub-titles, content headers |
| Card Title | NotionInter | 22px (1.38rem) | 700 | 1.27 (tight) | -0.25px | Feature cards, list titles |
| Body Large | NotionInter | 20px (1.25rem) | 600 | 1.40 | -0.125px | Introductions, feature descriptions |
| Body | NotionInter | 16px (1.00rem) | 400 | 1.50 | normal | Standard reading text |
| Body Medium | NotionInter | 16px (1.00rem) | 500 | 1.50 | normal | Navigation, emphasized UI text |
| Body Semibold | NotionInter | 16px (1.00rem) | 600 | 1.50 | normal | Strong labels, active states |
| Body Bold | NotionInter | 16px (1.00rem) | 700 | 1.50 | normal | Headlines at body size |
| Nav / Button | NotionInter | 15px (0.94rem) | 600 | 1.33 | normal | Navigation links, button text |
| Caption | NotionInter | 14px (0.88rem) | 500 | 1.43 | normal | Metadata, secondary labels |
| Caption Light | NotionInter | 14px (0.88rem) | 400 | 1.43 | normal | Body captions, descriptions |
| Badge | NotionInter | 12px (0.75rem) | 600 | 1.33 | 0.125px | Pill badges, tags, status labels |
| Micro Label | NotionInter | 12px (0.75rem) | 400 | 1.33 | 0.125px | Small metadata, timestamps |

### Principles
- **Compression at scale**: NotionInter at display sizes uses -2.125px letter-spacing at 64px, progressively relaxing to -0.625px at 26px and normal at 16px. The compression creates density at headlines while maintaining readability at body sizes.
- **Four-weight system**: 400 (body/reading), 500 (UI/interactive), 600 (emphasis/navigation), 700 (headings/display). The broader weight range compared to most systems allows nuanced hierarchy.
- **Warm scaling**: Line height tightens as size increases -- 1.50 at body (16px), 1.23-1.27 at sub-headings, 1.00-1.04 at display. This creates denser, more impactful headlines.
- **Badge micro-tracking**: The 12px badge text uses positive letter-spacing (0.125px) -- the only positive tracking in the system, creating wider, more legible small text.

## 4. Component Stylings

### Buttons

**Primary Blue**
- Background: `#171717` (Notion Blue)
- Text: `#ffffff`
- Padding: 8px 16px
- Radius: 8px (subtle)
- Border: `1px solid transparent`
- Hover: background darkens to `#005bab`
- Active: scale(0.9) transform
- Focus: `2px solid` focus outline, `var(--shadow-level-200)` shadow
- Use: Primary CTA ("Get Notion free", "Try it")

**Secondary / Tertiary**
- Background: `rgba(0,0,0,0.05)` (translucent warm gray)
- Text: `#000000` (near-black)
- Padding: 8px 16px
- Radius: 8px
- Hover: text color shifts, scale(1.05)
- Active: scale(0.9) transform
- Use: Secondary actions, form submissions

**Ghost / Link Button**
- Background: transparent
- Text: `rgba(0,0,0,0.95)`
- Decoration: underline on hover
- Use: Tertiary actions, inline links

**Pill Badge Button**
- Background: `#f2f9ff` (tinted blue)
- Text: `#097fe8`
- Padding: 4px 8px
- Radius: 8px (full pill)
- Font: 12px weight 600
- Use: Status badges, feature labels, "New" tags

### Cards & Containers
- Background: `#ffffff`
- Border: `1px solid rgba(0,0,0,0.1)` (whisper border)
- Radius: 8px (standard cards), 16px (featured/hero cards)
- Shadow: none -- use border for definition, flat hierarchy
- Hover: subtle shadow intensification
- Image cards: 12px top radius, image fills top half

### Inputs & Forms
- Style: Underline -- bottom border only, no side or top borders
- Border-bottom: 2px solid border color, no border-radius on the field itself
- Focus: bottom border thickens or shifts to primary color
- Text: foreground color, Placeholder: muted-foreground
- No background fill -- transparent base

### Navigation
- Style: Glass & Floating -- transparent background with backdrop-filter: blur(12px)
- Border-bottom only (1px border color), no solid fill
- Header floats above content, text inherits foreground color
- CTA button uses primary color, right-aligned
- Mobile: hamburger menu collapse

### Image Treatment
- Product screenshots with `1px solid rgba(0,0,0,0.1)` border
- Top-rounded images: `12px 12px 0px 0px` radius
- Dashboard/workspace preview screenshots dominate feature sections
- Warm gradient backgrounds behind hero illustrations (decorative character illustrations)

### Distinctive Components

**Feature Cards with Illustrations**
- Large illustrative headers (The Great Wave, product UI screenshots)
- 12px radius card with whisper border
- Title at 22px weight 700, description at 16px weight 400
- Warm white (`#f6f5f4`) background variant for alternating sections

**Trust Bar / Logo Grid**
- Company logos (trusted teams section) in their brand colors
- Horizontal scroll or grid layout with team counts
- Metric display: large number + description pattern

**Metric Cards**
- Large number display (e.g., "$4,200 ROI")
- NotionInter 40px+ weight 700 for the metric
- Description below in warm gray body text
- Whisper-bordered card container

## 5. Layout Principles

### Spacing System
- Base unit: 8px
- Scale: 2px, 3px, 4px, 5px, 6px, 7px, 8px, 11px, 12px, 14px, 16px, 24px, 32px
- Non-rigid organic scale with fractional values (5.6px, 6.4px) for micro-adjustments

### Grid & Container
- Max content width: approximately 1200px
- Hero: centered single-column with generous top padding (80-120px)
- Feature sections: 2-3 column grids for cards
- Full-width warm white (`#f6f5f4`) section backgrounds for alternation
- Code/dashboard screenshots as contained with whisper border

### Whitespace Philosophy
- **Compact & dense**: Optimize for information density and scanning speed. Tight padding (8-12px), small gaps (4-8px between related items).
- **Reduced section spacing**: Use ~70% of the reference spacing values for a data-focused, efficient layout.
- **Screen real estate**: Maximize visible content per viewport -- users should see more items without scrolling.

### Border Radius Scale
- Micro (4px): Buttons, inputs, functional interactive elements
- Subtle (5px): Links, list items, menu items
- Standard (8px): Small cards, containers, inline elements
- Comfortable (12px): Standard cards, feature containers, image tops
- Large (16px): Hero cards, featured content, promotional blocks
- Full Pill (9999px): Badges, pills, status indicators
- Circle (100%): Tab indicators, avatars

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow, no border | Page background, text blocks |
| Whisper (Level 1) | `1px solid rgba(0,0,0,0.1)` | Standard borders, card outlines, dividers |
| Soft Card (Level 2) | 4-layer shadow stack (max opacity 0.04) | Content cards, feature blocks |
| Deep Card (Level 3) | 5-layer shadow stack (max opacity 0.05, 52px blur) | Modals, featured panels, hero elements |
| Focus (Accessibility) | `2px solid var(--focus-color)` outline | Keyboard focus on all interactive elements |

**Shadow Philosophy**: Notion's shadow system uses multiple layers with extremely low individual opacity (0.01 to 0.05) that accumulate into soft, natural-looking elevation. The 4-layer card shadow spans from 1.04px to 18px blur, creating a gradient of depth rather than a single hard shadow. The 5-layer deep shadow extends to 52px blur at 0.05 opacity, producing ambient occlusion that feels like natural light rather than computer-generated depth. This layered approach makes elements feel embedded in the page rather than floating above it.

### Decorative Depth
- Hero section: decorative character illustrations (playful, hand-drawn style)
- Section alternation: white to warm white (`#f6f5f4`) background shifts
- No hard section borders -- separation comes from background color changes and spacing

## 7. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile Small | <400px | Tight single column, minimal padding |
| Mobile | 400-600px | Standard mobile, stacked layout |
| Tablet Small | 600-768px | 2-column grids begin |
| Tablet | 768-1080px | Full card grids, expanded padding |
| Desktop Small | 1080-1200px | Standard desktop layout |
| Desktop | 1200-1440px | Full layout, maximum content width |
| Large Desktop | >1440px | Centered, generous margins |

### Touch Targets
- Buttons use comfortable padding (8px-16px vertical)
- Navigation links at 15px with adequate spacing
- Pill badges have 8px horizontal padding for tap targets
- Mobile menu toggle uses standard hamburger button

### Collapsing Strategy
- Hero: 64px display -> scales to 40px -> 26px on mobile, maintains proportional letter-spacing
- Navigation: horizontal links + blue CTA -> hamburger menu
- Feature cards: 3-column -> 2-column -> single column stacked
- Product screenshots: maintain aspect ratio with responsive images
- Trust bar logos: grid -> horizontal scroll on mobile
- Footer: multi-column -> stacked single column
- Section spacing: 80px+ -> 48px on mobile

### Image Behavior
- Workspace screenshots maintain whisper border at all sizes
- Hero illustrations scale proportionally
- Product screenshots use responsive images with consistent border radius
- Full-width warm white sections maintain edge-to-edge treatment

## 8. Accessibility & States

### Focus System
- All interactive elements receive visible focus indicators
- Focus outline: `2px solid` with focus color + shadow level 200
- Tab navigation supported throughout all interactive components
- High contrast text: near-black on white exceeds WCAG AAA (>14:1 ratio)

### Interactive States
- **Default**: Standard appearance with whisper borders
- **Hover**: Color shift on text, scale(1.05) on buttons, underline on links
- **Active/Pressed**: scale(0.9) transform, darker background variant
- **Focus**: Blue outline ring with shadow reinforcement
- **Disabled**: Warm gray (`#a39e98`) text, reduced opacity

### Color Contrast
- Primary text (rgba(0,0,0,0.95)) on white: ~18:1 ratio
- Secondary text (#615d59) on white: ~5.5:1 ratio (WCAG AA)
- Blue CTA (#171717) on white: ~4.6:1 ratio (WCAG AA for large text)
- Badge text (#097fe8) on badge bg (#f2f9ff): ~4.5:1 ratio (WCAG AA for large text)

## 9. Agent Prompt Guide

### Quick Color Reference
- Primary CTA: Notion Blue (`#171717`)
- Background: Pure White (`#ffffff`)
- Alt Background: Warm White (`#f6f5f4`)
- Heading text: Near-Black (`rgba(0,0,0,0.95)`)
- Body text: Near-Black (`rgba(0,0,0,0.95)`)
- Secondary text: Warm Gray 500 (`#615d59`)
- Muted text: Warm Gray 300 (`#a39e98`)
- Border: `1px solid rgba(0,0,0,0.1)`
- Link: Notion Blue (`#171717`)
- Focus ring: Focus Blue (`#097fe8`)

### Example Component Prompts
- "Create a hero section on white background. Headline at 64px NotionInter weight 700, line-height 1.00, letter-spacing -2.125px, color rgba(0,0,0,0.95). Subtitle at 20px weight 600, line-height 1.40, color #615d59. Blue CTA button (#171717, 4px radius, 8px 16px padding, white text) and ghost button (transparent bg, near-black text, underline on hover)."
- "Design a card: white background, 1px solid rgba(0,0,0,0.1) border, 12px radius. Use shadow stack: rgba(0,0,0,0.04) 0px 4px 18px, rgba(0,0,0,0.027) 0px 2.025px 7.85px, rgba(0,0,0,0.02) 0px 0.8px 2.93px, rgba(0,0,0,0.01) 0px 0.175px 1.04px. Title at 22px NotionInter weight 700, letter-spacing -0.25px. Body at 16px weight 400, color #615d59."
- "Build a pill badge: #f2f9ff background, #097fe8 text, 9999px radius, 4px 8px padding, 12px NotionInter weight 600, letter-spacing 0.125px."
- "Create navigation: white header. NotionInter 15px weight 600 for links, near-black text. Blue pill CTA 'Get Notion free' right-aligned (#171717 bg, white text, 4px radius)."
- "Design an alternating section layout: white sections alternate with warm white (#f6f5f4) sections. Each section has 64-80px vertical padding, max-width 1200px centered. Section heading at 48px weight 700, line-height 1.00, letter-spacing -1.5px."

### Iteration Guide
1. Always use warm neutrals -- Notion's grays have yellow-brown undertones (#f6f5f4, #31302e, #615d59, #a39e98), never blue-gray
2. Letter-spacing scales with font size: -2.125px at 64px, -1.875px at 54px, -0.625px at 26px, normal at 16px
3. Four weights: 400 (read), 500 (interact), 600 (emphasize), 700 (announce)
4. Borders are whispers: 1px solid rgba(0,0,0,0.1) -- never heavier
5. Shadows use 4-5 layers with individual opacity never exceeding 0.05
6. The warm white (#f6f5f4) section background is essential for visual rhythm
7. Pill badges (9999px) for status/tags, 4px radius for buttons and inputs
8. Notion Blue (#171717) is the only saturated color in core UI -- use it sparingly for CTAs and links


---

## Included Components

The following components are part of this design system:

- Button
- Input
- Table
- Card
- Badge
- Tabs
- Dialog


---

## Iconography & SVG Guidelines

### Icon Library

Use a single, consistent icon library throughout the project. Recommended options:

- **Lucide React** (`lucide-react`): Default for shadcn/ui projects. 1,400+ icons, tree-shakeable, consistent 24x24 grid.
- **Radix Icons** (`@radix-ui/react-icons`): 300+ icons, 15x15 grid, minimal and geometric.
- **Heroicons** (`@heroicons/react`): 300+ icons by Tailwind team, outline and solid variants.

Pick ONE library and use it everywhere. Do not mix icon libraries within the same project.

### SVG Usage Rules

- All icons must be inline SVG components (not `<img>` tags) for color and size control.
- Icon size follows the type scale: 16px (inline), 20px (buttons), 24px (standalone).
- Icon color inherits from `currentColor` -- never hard-code fill/stroke colors.
- For custom/brand icons, export as SVG components with `currentColor` fills.
- Stroke width: 1.5px-2px for outline icons. Keep consistent across the project.

### Icon Sizing Scale

| Context | Size | Usage |
|---------|------|-------|
| Inline text | 16px (1rem) | Badges, labels, breadcrumbs |
| Button icon | 18px (1.125rem) | Icon buttons, CTA icons |
| Standalone | 24px (1.5rem) | Navigation, card icons |
| Feature | 32-48px | Hero sections, empty states |

### SVG Optimization

- Run all custom SVGs through SVGO before committing.
- Remove unnecessary attributes: `xmlns`, `xml:space`, editor metadata.
- Use `viewBox` instead of fixed `width`/`height` for scalability.


---

## 10. shadcn/ui Theme

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 4%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 4%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 4%;
    --primary: 0 0% 9%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 94%;
    --secondary-foreground: 240 10% 4%;
    --muted: 0 0% 96%;
    --muted-foreground: 240 10% 44%;
    --accent: 30 4% 36%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 10% 79%;
    --input: 240 10% 79%;
    --ring: 0 0% 9%;
    --radius: 0.5rem;
    --chart-1: 0 0% 9%;
    --chart-2: 0 0% 9%;
    --chart-3: 0 0% 9%;
    --chart-4: 0 0% 9%;
    --chart-5: 0 0% 9%;
  }

  .dark {
    --background: 0 17% 7%;
    --foreground: 0 0% 98%;
    --card: 0 18% 10%;
    --card-foreground: 0 0% 98%;
    --popover: 0 18% 12%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 9%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 16% 20%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 11% 15%;
    --muted-foreground: 0 0% 63%;
    --accent: 30 4% 36%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 10% 18%;
    --input: 0 10% 23%;
    --ring: 0 0% 9%;
    --chart-1: 0 0% 9%;
    --chart-2: 0 0% 9%;
    --chart-3: 0 0% 9%;
    --chart-4: 0 0% 9%;
    --chart-5: 0 0% 9%;
  }
}
```


---

## Document Policies

### No Emojis

This design system must not use emojis in any UI element, component, label, status indicator, or documentation.
Use SVG icons from the chosen icon library instead. Emojis render inconsistently across platforms and break visual coherence.

- Status indicators: use colored dots or icon components, not emoji.
- Section markers: use text prefixes ("DO:" / "DON'T:") or icons, not checkmark/cross emojis.
- Navigation: use icon components, not emoji.

### Format Compliance

This document follows the Google Stitch DESIGN.md 9-section format:
1. Visual Theme & Atmosphere
2. Color Palette & Roles
3. Typography Rules
4. Component Stylings
5. Layout Principles
6. Depth & Elevation
7. Do's and Don'ts
8. Responsive Behavior
9. Agent Prompt Guide

Extended with:
- Iconography & SVG Guidelines
- shadcn/ui Theme (CSS variables block)
- Document Policies

Total target length: 250-400 lines. Keep sections concise and actionable.
