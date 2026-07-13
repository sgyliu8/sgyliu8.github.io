# Portfolio UI audit — round 3

Date: 2026-07-13

## Outcome

This release reframes the portfolio from a narrow “gas-turbine R&D + AI” profile into a physics-led engineering narrative spanning thermal-power and propulsion systems, applied mathematics, real machines, mechanical and aerodynamic design, CFD, vibration, experimental measurement, industrial imaging and deployable AI/ML.

## Identity and credential rules

- Primary identity: `Dr Yang Liu, CEng` / `刘杨博士，CEng`.
- `Dr` and `PhD` are never used together in the same name line.
- `PhD` remains in the education record where it describes the degree.
- IMechE is shown as a separate assessment/institutional reference, not as the phrase `CEng through IMechE` and not as an unverified membership post-nominal.
- Domain label: `Thermal Power & Propulsion Systems` / `热能动力与推进系统`.

## Information architecture

1. Hero: domain, value proposition, role summary and the four-step evidence-to-decision pathway.
2. About: the connection between mathematical models, physical machines, experiments and implementation.
3. Expertise: six balanced capability pillars.
4. Selected work: public-facing project summaries, with real engineering evidence for the Polimi and XAG cases.
5. Experience and education: employer/university timeline, partner logos and formative moments.
6. Research and IP: externally verifiable publications, patent application and granted utility model.
7. Beyond the lab: family cycling and tennis, positioned only after professional evidence.
8. Contact: a single clear professional next step.

## Media placement and safeguards

- Polimi gear-test bench: shown uncropped so the rig and measurement-chain diagram remain readable.
- XAG P20 CFD: primary XAG engineering image, rendered at native aspect ratio.
- XAG eVTOL: low-resolution archival crop kept as a small inset and not upscaled. Because annotations remain visible, external-use permission must be confirmed by the relevant rights holder before redistribution.
- PolimiRide: shown after professional sections, stripped of metadata, excluded from hero/OG/structured data and captioned without a child’s name, age or exact date.
- Tennis collection: cropped to 4:5 and used as a secondary personal image.
- University paper-aircraft result: text milestone records four wins—three at Cranfield and one at Liverpool—without invented artwork or unverified dates.
- Institution marks remain identification-only and do not imply endorsement.
- Employer- or collaborator-originated engineering images remain subject to the user's confirmation of publication rights; the site copy does not label them as “public-safe”.

## Visual system

- Retained the existing ink, warm-paper, brick-orange and muted-teal palette.
- Removed handcrafted SVG project illustrations where real evidence was available.
- Technical images use warm-white contained frames, 1 px borders and readable captions.
- Life images use the same 16 px radius and restrained shadow as the established journey cards.
- Desktop layout uses two-column evidence cards; mobile stacks all content with the eVTOL inset capped at its 414 px native width.
- All new images include intrinsic dimensions, responsive sources, lazy loading and meaningful bilingual alternative text.

## Content and accessibility checks

- English and Chinese pages preserve equivalent meaning rather than literal word-for-word translation.
- Header, hero, expertise, CV, metadata, social cards and footer use the same positioning system.
- The data-to-decision pathway retains a complete explanation of why evidence quality and model validity are separate gates.
- Links and controls remain at least 44 px high, keyboard focus remains visible and skip-link targets are focusable.
- Automated validation covers duplicate IDs, internal references, media assets, sensitive strings, identity rules and bilingual positioning requirements.

## Validation record

- `npm run check`
- `html-validate` across canonical and root-mirror HTML
- `node --check` for site and validation scripts
- `git diff --check`
- Live browser QA at 1363 × 936: English homepage, Chinese language switch, Chinese CV navigation, responsive image loading, horizontal overflow, 44 px control targets and site-origin console errors.
- Tablet and mobile behaviour was reviewed through the breakpoint CSS, intrinsic image sizing and automated mirror/reference checks. The available cloud browser had a fixed desktop viewport, so this record does not claim device-emulated visual testing.

The companion Figma audit board records the pre-release screenshot, media-placement decisions and publication safeguards. The production URL remains the source of truth for the implemented after-state.
