# Portfolio UI audit — July 2026

## Scope

Combined UX, visual-design and accessibility review of the bilingual portfolio home page and public CV. The review covered hierarchy, typography, spacing, colour, interaction states, navigation logic, responsive behaviour and public-safe professional positioning.

Primary visitor goals:

1. Understand Yang Liu's identity, engineering focus and professional standing within five seconds.
2. Reach selected engineering work, experience, research evidence or the public CV without searching.
3. Move between English and Chinese equivalents without losing context.
4. Use the site with keyboard, touch, zoom or reduced motion.

## Reference patterns

- [Brittany Chiang](https://brittanychiang.com/): restrained one-page hierarchy, selected work and clear résumé exit.
- [Eugene Yan](https://eugeneyan.com/): concise positioning and visitor-intent routes.
- [Andrej Karpathy](https://karpathy.ai/): fast identity, chronological evidence and selected public output.
- [MIT MechE portfolio guidance](https://mitcommlab.mit.edu/meche/commkit/portfolio/): three to four priority projects, fast scanning and contribution-first project narratives.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/): contrast, focus, reflow and target-size acceptance criteria.

These references informed the hierarchy and interaction rules; their visual styles were not copied.

## Findings and decisions

### P1 — implemented

- Reduced the English hero scale and vertical padding so identity, proposition and primary actions form one readable first-screen hierarchy.
- Made `Dr Yang Liu`, `PhD`, `CEng` and IMechE explicit without repeating the same credential in every hero element.
- Reduced primary navigation to four content anchors; language and CV remain separate utilities.
- Self-hosted Inter Variable to remove cross-platform typography drift; retained local Noto Sans SC for Chinese.
- Raised meaningful small text to at least `0.75rem`, increased muted-text contrast and shortened long reading lines.
- Reduced section spacing and made card density content-led while preserving the editorial rhythm.
- Reframed selected work as three priority cases plus two visually subordinate supporting cases.
- Removed lift animation from non-clickable cards; strengthened the real text links and publication actions.
- Replaced arrow-only research controls with visible, content-specific publication and patent pills.
- Normalised institution-logo containers while retaining below-fold lazy loading to protect first-screen performance.
- Improved tablet work-card reflow and rebuilt the mobile experience timeline around the content rather than a wide date column.

### Interaction and accessibility fixes — implemented

- Distinct hover and current-section navigation states.
- Stable active-section tracking, with Expertise grouped under About, and same-section bilingual switching.
- `44px` target height for navigation, core links and research actions.
- Touch pressed states and retained tap feedback.
- Mobile-menu focus loop includes the visible brand; same-page mobile navigation moves focus to the destination heading.
- Print control is hidden when JavaScript is unavailable; the PDF download remains available.
- Chinese CV brand and contact links return to `/zh/`, not the English home page.
- Decision-loop semantics contain four real list items; arrows are visual separators only.
- Existing skip links, visible focus outlines, reduced-motion handling, responsive image dimensions and bilingual `lang` metadata remain intact.

## Acceptance criteria

- Identity, engineering focus, `CEng` / IMechE and the main action are immediately visible.
- No more than four primary content anchors appear in a header.
- Meaningful visible text is at least `12px`; normal text contrast targets WCAG AA `4.5:1`.
- Primary interactive targets are designed to at least `44px` high.
- Hover, focus, active and current-location states are visually distinct.
- English and Chinese routes preserve equivalent structure and destination logic.
- The site has no broken internal references, duplicate IDs, invalid HTML or JavaScript syntax errors.
- The CV print layout and both downloadable PDFs remain unchanged unless separately approved.

## Later opportunity

The next meaningful content upgrade is not another styling pass. It is to create three public-safe engineering case-study pages following the MIT contribution-first structure: objective, personal contribution, method, validation and result. Real public-safe diagrams or test evidence should replace decorative graphics only when those assets are available and cleared for publication.
