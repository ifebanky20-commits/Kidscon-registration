# Landing page design

The selected direction is the user's third reference: a split hero, a soft green background and logo-derived green and orange accents, and a spacious page without an enclosing card or frame. The hero combines left-aligned copy with classroom photography and a registration preview that uses the next available event. It does not invent event details when none are available.

## Brand and implementation

- Use the actual `src/assets/logo.jpeg` mascot artwork through `KidsconLogo`. Preserve its aspect ratio and original colors; do not crop or invert it or substitute a Lucide symbol for the brand.
- Lucide icons are interface accents, not a replacement logo.
- All authored web styling uses Tailwind utilities and shared theme tokens.
- The navigation and footer sit on full-width page sections. The registration walkthrough uses open columns rather than a row of boxed cards.
- Light and dark themes share the same design tokens.

## Behavior

- Navigation links target the events, registration guide, welcome, and FAQ sections.
- Upcoming events come from Supabase, with separate loading, empty, and retry states.
- The hero registration preview links to the featured event's registration route. Without event data it links to the events section.
- Event cards retain countdown timers and registration links.
- Mobile navigation uses an accessible disclosure control.

## Logo-derived palette

The mascot artwork is the source of the site's identity: green leads actions and navigation accents, orange provides warm highlights, red is reserved for alerts, and charcoal anchors typography. Warm white and soft mint keep page sections open. Text and button shades are deepened for contrast; dark mode uses lighter green and orange foregrounds on deep green neutrals. Theme tokens live in `src/styles/index.css`.

The same palette applies to registration screens, admin charts, PDF tickets, and Word exports. PDF and Word document colors use their existing renderer APIs, as documented in the styling policy.

## Hero photo

- Local asset: `src/assets/hero-classroom.jpg` (1400 × 788 JPEG).
- Photographer: Doug Linstedt, via [Unsplash](https://unsplash.com/photos/children-sitting-on-chairs-inside-classroom-jEEYZsaxbH4).
- Location: Lagos, Nigeria, as identified on the source page.
- Source image: https://images.unsplash.com/photo-1473649085228-583485e6e4d7
- The source page identifies this photo as free to use under the Unsplash License.
- This is illustrative classroom photography, not a photo of a KIDSCON event. The alternative text describes the scene accordingly.
- The hero uses a Tailwind object-position utility to keep the main subject visible in its responsive crop.
