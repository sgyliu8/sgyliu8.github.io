# Yang Liu — public website content context

Editorial baseline: 4 October 2026. This document maintains the positioning and
evidence boundaries for the bilingual portfolio and public CV. It is public
repository content; confidential project records do not belong here.

## Positioning

**Gas-turbine expertise. AI for engineering.**

Yang's professional foundation is gas-turbine engine performance and
thermodynamics. His current work connects that domain depth with measurement,
industrial AI, computer vision and scientific software. The value to communicate
is his ability to carry an engineering problem through requirements, data,
methods, validation and usable tools, alongside technical project leadership.

Chinese headline: **深耕燃气轮机，让 AI 解决工程问题。**

Keep these three aspects visible together:

- **Domain depth:** thermodynamics, component matching, off-design performance,
  operability, diagnostics and model–test correlation.
- **Practical development:** measurement and data workflows, industrial image
  analysis, scientific computing, desktop/web tools and reproducible analysis.
- **Engineering delivery:** problem definition, technical roadmaps, proof of
  concept, university collaboration, industrial PhD supervision and handover.

Preferred personal statement:

> My focus is simple: understand the physics, measure the system, learn from the
> data, and turn that knowledge into better engineering decisions.

Chinese counterpart:

> 我的目标很直接：理解物理，测量系统，从数据中学习，再将这些认识转化为更好的工程决策。

## Career facts

| Period | Organisation | Role and scope |
| --- | --- | --- |
| Sep 2026–present | Siemens Energy, AI & Enterprise | AI Consultant for Engineering; primary lead for AI4Engineering; complex engineering AI projects |
| Jun 2024–Sep 2026 | Siemens Energy, Core Engineering & Development | Senior Engineer – R&D; performance, diagnostics, experimental measurement, industrial imaging and research collaboration |
| May 2022–May 2024 | Politecnico di Milano, DMEC | Postdoctoral Researcher; wireless sensing, DAQ and rotating-machinery measurements |
| Nov 2016–Aug 2021 | Cranfield University, collaborative programme with AVIC | Aero-engine performance, diagnostics, prognostics, life assessment and integrated platform delivery |
| Oct 2015–Oct 2016 | XAG | Control and algorithms / aerodynamic R&D; propeller–motor matching, CFD, aeroacoustics and vibration control |

Both Siemens Energy roles belong to one employer. The homepage uses one company
logo and two nested roles with their own dates. The printable CV retains separate
dated entries. The role transition and organisation names are owner-supplied.
Use the exact English title; 工程 AI 顾问 is its explanatory Chinese translation.
Do not invent global programme authority, reporting lines, budgets or team size.

Retain the established education and qualification records: Cranfield PhD in
Aerospace Propulsion, Imperial MSc in Advanced Aeronautical Engineering,
Liverpool BEng with First-Class Honours, and Chartered Engineer (CEng).
Chief Engineer and Principal Expert are stated interests, not current titles.

## Capability map

| Website capability | Evidence informing the wording | Appropriate emphasis |
| --- | --- | --- |
| Gas-turbine performance and thermodynamics | Doctoral work, published cycle/off-design research, Cranfield–AVIC delivery, professional record | Core discipline; physical models and whole-engine understanding |
| Industrial AI and computer vision | Professional record and reviewed development workflows for images, data curation, review and model evaluation | Method selection, data quality and human review; avoid lists of model names |
| Measurement and experimental validation | Polimi sensing/DAQ work, public patent application, experimental engineering record | Hardware–software integration, signal processing, calibration and repeatability |
| Diagnostics and measurement design | Gas-path research and inspected modelling/measurement-selection implementation | Sensitivity, identifiability and useful observations; simulations do not certify field performance |
| Scientific imaging and 3D workflows | HyperLab plus reviewed reconstruction development and public-control records | Colour/spectral analysis and reconstruction prototypes; industrial accuracy requires separate evidence |
| Engineering software and delivery | Reviewed Python backends, Qt and web interfaces, data contracts, tests and handover documentation | Hands-on development and integration; distinguish reused libraries from original methods |

The working-tool list is intentionally selective: Python, MATLAB, C/C++, C#,
SQL, OpenCV, PyTorch, Qt/PySide6, React/TypeScript and Git. It conveys applied
experience, not an equal expert rating for every tool. AI-assisted development
is part of the workflow and remains subject to technical review and testing.

## Public development examples

### HyperLab

[Public repository](https://github.com/sgyliu8/Hyper)

An implemented local imaging and spectral-data workbench: region comparison,
statistics, scientific figures and source-linked exports. Public examples use
synthetic data. Do not infer calibrated camera performance, material-state
accuracy, temperature measurement or a validated hyperspectral instrument from
the existence of the software or its screenshots.

### SO101 learning lab

[Public repository](https://github.com/sgyliu8/LeRobot)

An integration and learning project using LeLab and LeRobot. The reviewed project
records support supervised teleoperation, real dual-camera recording, dataset
readback and ACT training-checkpoint recovery. Autonomous manipulation and
sorting performance remain unvalidated. Do not present this as deployed
robotics expertise, successful autonomous sorting, or authorship of the upstream
robotics/training frameworks.

These examples sit separately from the Siemens Energy description. Public
availability does not establish employer ownership, endorsement or an open-source
licence; call them public repositories, not licensed open-source releases.

## Source and status policy

The October 2026 refresh used the owner's stated role change, supplied CV and
professional-profile material, prior explicit writing preferences, GitHub MCP
repository records, and read-only MCP access to current local project documents
and selected implementation files. Local records were checked because several
working versions had progressed beyond their default GitHub branches.

The portfolio review inspected evidence; it did not rerun scientific experiments,
drive hardware or independently reproduce project test suites. Describe statuses
as supported by the reviewed project records, and recheck them before future
updates. A specification, code implementation, software test, public benchmark,
physical validation and production deployment are different evidence levels.

Publish transferable capabilities and already public examples. Keep private
repository identities, internal paths, equipment/data identifiers, unpublished
employer IP and project-specific private results out of both the site and this
document. A planned project is not an achievement. A software check is not a
measurement-accuracy result. Thermal-paint interpretation is not interchangeable
with thermal imaging or radiometric thermography.

Preserve the established public DOI and patent records in the site; older CV
copies contain superseded identifiers. Never restore private addresses, phone
numbers, compensation or unpublished patent details from source documents.

## Bilingual maintenance

- Change the English and Chinese homepages and CVs together.
- Keep dates, role hierarchy, project status and public links equivalent.
- Explain skills through engineering tasks and outputs. Keep detailed libraries
  in the CV; avoid model-name lists or unsupported numerical impact claims.
- Keep the core gas-turbine discipline prominent while explaining the current
  AI4Engineering role and broader delivery skills.
- Author in `public/`, run `npm run sync:root` and `npm run check`, then verify
  the published English/Chinese pages and the one-logo Siemens timeline.
