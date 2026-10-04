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
| Industrial AI and computer vision | Professional record and reviewed anomaly-detection, segmentation, data-curation and inference implementations | Method selection, data quality and human review; explain tools in the CV rather than crowding the homepage |
| Measurement and experimental validation | Polimi sensing/DAQ work, public patent application, experimental engineering record | Hardware–software integration, signal processing, calibration and repeatability |
| Diagnostics and measurement design | Gas-path research and inspected modelling/measurement-selection implementation | Sensitivity, identifiability and useful observations; simulations do not certify field performance |
| Scientific imaging and 3D workflows | HyperLab plus reviewed reconstruction development and public-control records | Colour/spectral analysis and reconstruction prototypes; industrial accuracy requires separate evidence |
| Engineering software and delivery | Reviewed Python backends, Qt and web interfaces, data contracts, tests and handover documentation | Hands-on development and integration; distinguish reused libraries from original methods |

## Applied tools and methods

The CV groups tools by engineering purpose and includes both current development
and earlier professional use. It conveys applied experience, not an equal expert
rating for every tool. Retain the links between methods, data and practical use;
do not reduce this section to either a short generic stack or a list of names
without context.

| Area | Tools and methods suitable for the public CV | Basis and scope |
| --- | --- | --- |
| Scientific computing | Python, MATLAB, NumPy/SciPy, C/C++, C#, Fortran, SQL; numerical modelling, optimisation and signal processing | Supplied CV and inspected numerical implementations; languages span different career stages |
| AI and anomaly detection | PyTorch, Lightning, Anomalib with PatchCore and EfficientAD, Ultralytics YOLO, U-Net/U-Net++; normal-image modelling, heatmaps, detection and segmentation | Owner account and reviewed model adapters, training/data workflows and model registry; integration and experiment experience, not a claim of validated production detection |
| Model export and inference | OpenVINO, ONNX, ONNX Runtime; export/loading, preprocessing and CPU inference integration | Inspected OpenVINO inference adapter, model export implementation and local ONNX Runtime execution records; no implied speedup or validated GPU deployment |
| Colour and spectral analysis | OpenCV, Colour Science, Matplotlib, PyQtGraph; CIE Lab/CIEDE2000, region statistics and spectral PCA | Reviewed image-analysis implementations and scientific workbench; colour-derived measures do not establish calibrated temperature |
| 3D reconstruction and registration | Open3D, CloudCompare, COLMAP/OpenMVS, PyVista/VTK; SIFT, ALIKED/LightGlue, SfM/MVS, ICP and scale/pose alignment | Owner explicitly described earlier Open3D/CloudCompare registration; newer reconstruction, matching and viewer implementations were inspected; physical accuracy remains separately assessed |
| Synthetic imaging and photometric stereo | Blender, NumPy; controlled rendering, least squares and Huber-IRLS | Local rendering and numerical research implementations; synthetic experiments do not establish real-world inspection performance |
| Data curation and evaluation | CLIP/Qwen embeddings, YOLO/COCO formats, SQLite; reviewed annotation, similarity search and precision/recall/MRR/nDCG | Inspected dataset-curation workflows and evaluation records; weak model labels remain separate from accepted human annotations |
| Gas-turbine modelling and CFD | NPSS, pyCycle/OpenMDAO, ANSYS Fluent, STAR-CCM+, XFlow; cycle/off-design analysis, sensitivity and measurement design | Professional CV plus inspected current physical-model and measurement-selection implementation; this does not imply completed AI integration |
| CAD and aircraft design | SolidWorks, CATIA V5, Pro/E, XFOIL, QPROP, JavaProp, SUAVE | Owner-supplied historical CV and aircraft/propeller engineering experience; explicitly presented as earlier work |
| Measurement and embedded systems | LabVIEW, FlexLogger, Arduino, PlatformIO; DAQ, I2C, SPI, UART, Modbus and BLE | Professional CV, sensing research and reviewed embedded work; a new prototype's software checks do not establish bench performance |
| Applications and delivery | Qt/PySide6, FastAPI, React/TypeScript, Git, pytest, GitHub Actions; versioned data, checks and technical handover | Reviewed applications, interfaces and development workflows; AI-assisted development remains subject to technical review and testing |

Use **Anomalib**, **PatchCore**, **Open3D** and **OpenVINO** consistently.
Keep LeRobot/LeLab and ACT training in the separately labelled physical-AI
learning example below, with its existing limits.

Evidence depth differs within a category. In particular, an EfficientAD adapter
or preflight is not proof that the full GPU training path has been validated;
a checkpoint reload or full-image segmentation run does not establish independent
generalisation. Do not turn these distinctions into public achievement metrics.

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
and selected implementation files. Local records and relevant non-default
development branches were checked because several active implementations had
progressed beyond their default GitHub branches. Default-branch code search
alone can miss this work.

For tool claims, use the owner's explicit account, historical CV, inspected
implementation and available execution records together. A dependency declaration,
an assistant's past recommendation or a future specification alone does not
establish hands-on use. Do not infer that every implemented backend has been
validated on the intended real data or hardware.

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
