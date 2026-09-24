# Architecture and migration decisions

## Inspected sources

Data Submissions main is a small static repository. Its runnable app is `outputs/ohds-prototype/{index.html,styles.css,app.js}`; `docs/` and editable HTML/ZIPs are deployment/export copies. Its mutable global `state`, DOM listeners, rendering functions and global CSS are tightly coupled. There is no React application or existing design-criteria database.

PM Sandbox main and feature-contract-simulation-studio are Next.js App Router applications. The feature branch includes contract scenario calculations, contract configuration, population analysis, scorecard grouping and additional tests. The feature-vs-main comparison records 45 added files, 2 removed files and 63 changed files (see the machine-readable inventory for the exact list). The feature branch is the authoritative running implementation. Main was used as a reference; it is not duplicated or installed in this delivery.

## One application shell, preserved implementations

`UnionShell` is placed inside the existing theme and feature-flag providers. It renders the native React product switcher, shared criteria editor, original PM chrome and pages, and a same-origin Data Submissions frame. Switching changes visibility, not component identity. The static frame is mounted at startup and retained thereafter. The PM route and its client state remain mounted while Data Submissions is visible.

Data Submissions uses a frame because its global selectors, event handlers and styles are incompatible with direct insertion into React's DOM. Retaining this boundary preserves the actual v53 workflow and visual design without a broad rewrite. It is a deliberate integration seam, not a claim that the static app has been converted to React. A future component migration can replace the frame without changing the canonical criteria package.

The URL query `product=data-submissions` or `product=pm-sandbox` records the active product while preserving the PM pathname and other search parameters. Browser back/forward restores the selected product. No second server or separate origin is needed.

`prepare-submissions.mjs` copies only the runtime assets into Next's public directory and derives the scenario catalog from the original source. Generated public copies are excluded from the source archive/Git. The standalone source app continues to run independently.

## Canonical design criteria

`@austin/design-criteria` owns:

- Validated product, criterion, source and versioned JSON exchange schemas.
- A single IndexedDB database, `austin-ci-design-criteria-v1`, with the `criteria` object store keyed by criterion ID.
- Atomic write transactions, revision checks, adoption, source pulling, and validated export/import.
- Source adapters for Data Submissions and PM Sandbox.

Each criterion contains a title, requirement, acceptance criteria, category, status, origin, optional source provenance, `usedBy` product references, revision, timestamps and the latest 100 text revisions. Source IDs use `source:<product>:<source-key>`; custom records use UUIDs. Adoption adds a product reference to the existing record. It never creates a per-product copy.

Text refinements append history and increment the revision. Adoption increments the revision but does not append a text revision; revision numbers in the text history can therefore have gaps. A stale editor cannot overwrite a newer edit or adoption. Cross-tab notifications trigger a reread; the database, not the notification channel, is authoritative. Import validates the whole payload before writing, rejects duplicate IDs and forged source identities, adds unseen records and reports conflicts. It does not infer that a higher imported revision can safely replace a local record.

## Adapters and meaning

The Data Submissions adapter maps the six real `scenarioDefinitions` labels, goals and review signals into design requirements and acceptance criteria. A build-time generated snapshot makes the catalog available before the frame loads. Once loaded, the optional bridge publishes the live source catalog. The bridge does not hold or write a separate criteria store.

The PM adapter explicitly maps seven requirements from the supplied configuration-studio and scenario-presenter documents: KPI selection, configuration validation, draft retention, distinct financial presentations, visible assumptions, scenario isolation and keyboard behavior. These are curated summaries with file provenance, not automatic extraction of all product documentation or reverse-engineering of medical rules.

The editor is shared across both products. Users can pull, adopt, create and refine requirements while either product is active. Original clinical data, quality targets, contract configuration and simulation state retain their original domain meaning and storage.

## Trust and persistence

The frame and parent validate exact origin, sender window, channel and adapter message shape. Only the known Data Submissions frame can open the editor or publish source metadata. The bridge exchanges no credentials or domain records. Criterion text is rendered as React text, not executable HTML. Imported files have a size cap and schema validation. Source-path text is displayed, not treated as a navigable URL.

The current persistence boundary is a browser and origin, as in the source demos. Multi-user concurrency, server authorization, remote backups and authenticated synchronization are future work. They require a server repository implementation; IndexedDB alone is not a shared organizational database.

The Data Submissions header remains original: its View and Select Program dropdowns gain a PM Sandbox option via the optional bridge. The union header is hidden while Data Submissions is active, except while the shared criteria editor is open.
