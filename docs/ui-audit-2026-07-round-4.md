# UI audit — July 2026, round 4

## Objective

Reposition the bilingual portfolio around a single, coherent professional identity: gas-turbine whole-engine performance and systems-level technical leadership, strengthened by industrial imaging and deployable AI/ML. The update must improve senior-role conversion without presenting Yang Liu as a current Chief Engineer or separating engineering and AI into unrelated careers.

## Professional positioning decision

- **Primary identity:** Gas-turbine whole-engine performance and systems-level technical leadership.
- **Differentiator:** Industrial imaging and deployable AI/ML.
- **Connecting method:** First-principles engineering, qualified evidence and validated deployment.

The hierarchy demonstrates readiness for Chief Engineer or Principal Expert responsibilities through technical breadth, engineering judgement, experimental validation, traceability and leadership evidence. It does not claim an unverified current job title.

## Whole-engine versus AI/ML hierarchy

Whole-engine performance leads the Hero, Profile, Expertise, Selected Work, Experience, metadata and structured data. Industrial AI/ML appears alongside it as a major differentiator grounded in physical systems, model architecture, algorithm development, validation and deployable engineering workflows. First-principles physics, applied mathematics, real-machine testing and qualified evidence connect the two strengths.

## Information architecture changes

The homepage sequence is:

1. Hero identity and dual technical strengths;
2. Professional Profile;
3. Core Expertise;
4. Selected Work;
5. Experience and education;
6. Research, publications and patents;
7. Engineering Decision Framework;
8. Beyond Engineering;
9. Contact and senior-role conversion.

The Data-to-Decision pathway moves out of the Hero and remains a four-step engineering framework. Personal material follows the professional evidence rather than interrupting it.

## Hero strategy

The left column communicates identity, whole-engine scope, current AI/ML focus, location and primary actions. The right column contains one dual-strength card with two semantic technical panels:

- whole-engine performance and systems engineering;
- industrial imaging and deployable AI/ML.

A concise bridge statement connects both panels through first principles, qualified evidence and deployment. On narrow screens the content column comes first, followed by the stacked strength panels. The card must not communicate meaning through colour alone.

## Bilingual terminology decisions

English follows British engineering usage, including *modelling*, *optimisation*, *programme*, *synchronised*, *behaviour* and *colour*. Compound terminology is standardised as *gas turbine* when used as a noun, *gas-turbine* as an adjective, *whole-engine*, *aero-engine*, *model–test correlation*, *control–performance interaction* and *off-design*.

Chinese is professionally rewritten rather than mechanically translated. Key choices include:

- whole-engine performance → 整机性能;
- performance architecture → 性能架构;
- component matching → 部件匹配;
- off-design performance and operability → 非设计工况与可运行性;
- control–performance interaction → 控制—性能耦合;
- model–test correlation → 模型—试验关联;
- experimental validation → 工程试验验证;
- research translation → 科研成果工程化 / 科研成果转化;
- technical authority → 技术决策职责 / 技术把关.

The English and Chinese pages preserve equivalent role order, dates, institutions, technical responsibilities and calls to action while allowing natural sentence structure in each language.

## Visual changes

- Preserve the established dark Hero, warm paper background, restrained orange and teal accents, border radii and shadow system.
- Replace the former Hero process card with the dual-strength technical card.
- Make the whole-engine Expertise card the full-width lead capability.
- Keep Selected Work evidence-led and control visual density across desktop, laptop and mobile layouts.
- Group Publications separately from Patents and published applications within the existing Research section.
- Keep Beyond Engineering after all professional evidence.
- Preserve institution logo proportions and real-image evidence without duplicating assets.

## Accessibility checks

Implementation requirements include a working skip link, focusable main target, logical heading hierarchy, visible focus, keyboard-operable navigation, a trapped mobile-menu focus loop with Escape recovery, controls at least 44 px high, semantic lists, meaningful image alternative text, empty alternative text for decorative logos, bilingual `lang` and `hreflang`, sufficient contrast, intrinsic image dimensions, 200% zoom reflow and narrow-screen reflow.

The implementation now preserves all content in reduced-motion mode and also removes the residual hover/active displacement from interactive controls. Static responsive review covers the 1020 px, 700 px and 420 px breakpoints, including the dual-strength Hero, Featured Expertise card, research rows, Beyond Engineering media and CV grids. Exact captured checks at 1440 px, 1024 px, 390 px and 320 px, 200% zoom and mobile keyboard navigation remain pending the final deployed-browser pass.

## Print and PDF checks

Browser Print / Save as PDF remains the only supported CV export path. Static downloadable PDFs and PDF-generation dependencies remain excluded. The print layout must retain A4 portrait, email, clickable canonical Public CV URL and readable English and Chinese typography while hiding navigation and actions.

Target minimum sizes are 8.5–9 pt for body copy, 7.5–8 pt for Experience bullets, 7–7.5 pt for section labels, 8–8.5 pt for the Hero summary and at least 7.5 pt for contact metadata. A readable three-page CV is preferable to a compressed two-page CV.

The print stylesheet now uses 8.5 pt body copy, 8.3 pt Hero summary, 7.8 pt Experience bullets, 7.25 pt section labels and 7.5 pt contact metadata, with A4 pagination guards and page-specific canonical CV links. Final English and Chinese print-preview checks for clipping, blank pages, orphaned headings, split Capability cards, font fallback, punctuation and link visibility remain pending browser print-preview access.

## Confidentiality boundaries

The public-information boundary remains strict. The site must not expose home addresses, private phone numbers, compensation, internal employer organisation details, internal project names or results, unpublished employer IP, private repositories, confidential diagrams, unverified team sizes, invented metrics or unpublished patent details. Current-employer work remains deliberately high-level, and the employer/collaborator confidentiality and image-rights cautions remain in place. Verified publication and patent identifiers must not change.

## Validation commands

The release candidate must run:

```text
npm run sync:root
npm run check
git diff --check
node --check public/assets/js/site.js
node --check scripts/check-site.mjs
```

Release-candidate results:

- `npm run sync:root` — passed; 19 top-level canonical entries synchronised;
- `npm run check` — passed; 15 HTML files and 188 public files, with 0 broken internal references;
- `git diff --check` — passed;
- `node --check public/assets/js/site.js` — passed;
- `node --check scripts/check-site.mjs` — passed;
- `html-validate` — passed across canonical and mirrored HTML with `long-title` disabled because the task mandates an exact English SEO title longer than the generic 70-character editorial rule. All structural validation rules remain enabled.

## Browser and screenshot record

Required deployed-site evidence:

- English and Chinese desktop at 1440 × 1000;
- English and Chinese laptop at 1024 px wide;
- English and Chinese mobile at 390 × 844;
- narrow mobile at 320 px;
- 200% zoom;
- reduced motion;
- keyboard-only navigation;
- English and Chinese print previews.

Baseline English and Chinese desktop screenshots were captured from the pre-upgrade deployed site in the browser audit session. Matched post-deployment screenshots and the final browser results are pending release publication. No mobile or print acceptance is claimed until those states are directly captured.

## Unresolved limitations

- Exact 1024 px, 390 px, 320 px, 200% zoom and mobile keyboard capture is pending because the selected cloud browser does not expose viewport emulation.
- English and Chinese print-preview pagination is pending.
- Existing social-card binaries have no documented reproducible regeneration workflow; metadata text may be updated without manually altering those binaries.
- Employer- or collaborator-originated engineering images retain the existing rights caution.
- Source records describe Cranfield–AVIC research through 2021 and the PhD award in 2022; the site preserves both dates rather than silently reconciling them.
