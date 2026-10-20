# Research and experiment data — version 4

The existing post, snapshot and image records remain in place. No destructive SQL migration or new table is required: the existing versioned document storage gains an independent research document. Goals in the existing strategy board are preserved.

Research contains typed sources, five strategy evaluations, experiment definitions, post research metadata, account observations, third-party cases and explicit missing-data interpretations. Updates require the document revision, rejecting stale edits. Editing a strategy can pause or reopen it for assessment.

## Missing data and attribution

New snapshot counts, source percentages and observation age may be null. Forms leave unobserved fields blank. A displayed rounded value is stored separately from its unknown exact count. Account-level follower observations never enter post-attribution metrics.

Historical values are not rewritten. Where the original note explicitly identifies an inferred count or unknown placeholder, a separate, reasoned override presents it as unknown in analysis. Raw values and original evidence remain in the backup. A new partial snapshot may reference existing images without copying older missing fields.

## Analysis rules

One post contributes at most one snapshot to a selected window. The closest actual observation is used within ±5% of the target age, with a minimum tolerance of two minutes; actual times remain visible. No interpolation is performed. Unsupported windows remain missing.

Ratios require observed numerator and denominator from the same snapshot, and a positive denominator. Aggregate ratios use only matched rows and report their sample counts. Category medians disclose valid n for each metric. View growth uses an actual 30-minute observation as baseline and an actual 24-hour or seven-day observation as endpoint. Missing endpoints or decreases do not produce invented growth rates.

Intervals use exact publication times; approximate dates do not qualify. Time since a viral post starts at its explicitly recorded threshold-confirmation time, not its eventual total. Reply experiments require observed author reply counts, separate from reader replies. Repeated snapshots do not increase the independent sample size. Sample thresholds are a screening rule, not proof of statistical power or causality.

## Backups and preservation

Version 4 backups include posts, original images, the prior strategy board and research. Versions 1–3 remain readable; a backup lacking research leaves current research intact. Research validation occurs before restoring post records, and the database changes are committed together. Restores issue a new research revision. Resetting example posts preserves strategies and research; missing post links remain visible.

Third-party cases and account observations are separate collections and never enter the owner's post totals. Source dates, company attribution, patent publication year and the reported legal-status limitations are retained individually. Patent documents are not evidence that Threads implemented the described method.

## Validation

Run the existing integration suite and strategy renderer checks, plus `node tests/research-math.mjs`, `node tests/research-storage.mjs`, and `node tests/research-ui.mjs`. Public code and fixtures contain no user screenshots, private performance data or credentials.
