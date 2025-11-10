# TSV format

This document describes the columns emitted in the `TSV` output of the action.

## Basic Columns

| Column name | Type | Description |
|-------------|------|-------------|
| `date_iso` | date (YYYY-MM-DD) | Start date of the grouping interval (e.g., Monday for ISO week, first day of month/quarter/year) |
| `date_iso_end` | date (YYYY-MM-DD) | End date of the grouping interval (e.g., Sunday for ISO week, last day of month/quarter/year) |
| `date` | string | Human-friendly group label used in the report (e.g., `2025-10`, `W01/2019`, `1/2025`) |
| `user` | string | User login or `total` for aggregated totals |
| `total_merged` | integer | Number of merged PRs in the interval for the user |
| `total_opened` | integer | Number of opened PRs in the interval for the user |
| `total_comments` | integer | Number of comments on PRs in the interval for the user |
| `total_reverted` | integer | Number of reverted PRs in the interval for the user |
| `prs_wo_review` | integer | Number of PRs without any review submitted in the interval for the user |
| `prs_wo_approval` | integer | Number of PRs without any approving review in the interval for the user |
| `additions` | integer | Total additions in the interval for the user |
| `deletions` | integer | Total deletions in the interval for the user |

## PR Size Columns

### Size Bucket Counts

| Column name | Type | Description |
|-------------|------|-------------|
| `pr_size_xs` | integer | Number of PRs sized `xs` (sizePoints ≤ SIZE_XS_THRESHOLD, default: 50) |
| `pr_size_s` | integer | Number of PRs sized `s` (SIZE_XS_THRESHOLD < sizePoints ≤ SIZE_S_THRESHOLD, default: 200) |
| `pr_size_m` | integer | Number of PRs sized `m` (SIZE_S_THRESHOLD < sizePoints ≤ SIZE_M_THRESHOLD, default: 400) |
| `pr_size_l` | integer | Number of PRs sized `l` (SIZE_M_THRESHOLD < sizePoints ≤ SIZE_L_THRESHOLD, default: 700) |
| `pr_size_xl` | integer | Number of PRs sized `xl` (sizePoints > SIZE_L_THRESHOLD) |

**Note:** PR size is calculated using the formula: `sizePoints = additions + deletions * DELETION_WEIGHT` (default DELETION_WEIGHT is 0.2). The thresholds can be customized via input parameters.

### Size Statistical Measures (Conditional)

The following columns are included based on the `AGGREGATE_VALUE_METHODS` input parameter:

| Column name | Type | Included when | Description |
|-------------|------|---------------|-------------|
| `avg_pull_request_size` | number (2 decimals) | `average` in AGGREGATE_VALUE_METHODS | Average sizePoints across all PRs for the user in the interval |
| `med_pull_request_size` | number (2 decimals) | `median` in AGGREGATE_VALUE_METHODS | Median sizePoints across all PRs for the user in the interval |
| `pct{N}_pull_request_size` | number (2 decimals) | `percentile` in AGGREGATE_VALUE_METHODS | Nth percentile of sizePoints (e.g., `pct75_pull_request_size` when PERCENTILE=75) |

## Timeline Metric Columns

The following timeline metrics are emitted conditionally based on the `AGGREGATE_VALUE_METHODS` input parameter. Each metric can appear in up to three forms (average, median, percentile), and each form has both a formatted string and a numeric hours column:

**When `average` is in AGGREGATE_VALUE_METHODS:**

- `avg_X` (string) — average formatted value (e.g., `2 hours 30 minutes`)
- `avg_X_hours` (number) — average value in hours (floating point)

**When `median` is in AGGREGATE_VALUE_METHODS:**

- `med_X` (string) — median formatted value
- `med_X_hours` (number) — median value in hours (floating point)

**When `percentile` is in AGGREGATE_VALUE_METHODS:**

- `pct{PERCENTILE}_X` (string) — percentile formatted value (PERCENTILE is the configured percentile, e.g., `pct75_timeToReview`)
- `pct{PERCENTILE}_X_hours` (number) — percentile value in hours (floating point)

**Note:** If `AGGREGATE_VALUE_METHODS` is not set or empty, all three methods (percentile, average, median) are included by default for backward compatibility.

### Timeline Metric Keys (replace `X` above)

- `timeInDraft` — Total elapsed time the pull request spent in "draft" status. Measured from each draft-enter event to the corresponding ready-for-review (or final close/merge) event and summed across multiple draft cycles. Reported both as a human-readable duration and in hours. Empty when the PR was never a draft.

- `timeToReviewRequest` — Time between the PR becoming ready for review (opened non-draft or marked "ready for review") and the first explicit review request assignment (a GitHub "requested reviewer" event). If no review request was issued, the metric is empty. Multiple request events are ignored — only the first request is used.

- `timeToReview` — Time from the PR becoming ready for review to the first submitted review (a review with state COMMENT, APPROVE, or REQUEST_CHANGES). If no review was submitted, the metric is empty. If a review was submitted before a formal review request, the first submitted review is used as the end point.

- `timeWaitingForRepeatedReview` — Cumulative time the PR waited for additional reviews after the author made follow-up changes. For each cycle: measured from the first new commit after a review to the next submitted review. All such waiting intervals are summed. Empty when no repeated-review cycle occurred.

- `timeToApprove` — Time from the PR becoming ready for review to the first approving review (review state APPROVED). If the PR was never approved, the metric is empty. If an approval occurs before a formal request, that approval is used.

- `timeToMerge` — Time from the PR being eligible for review to merge. The start is the later of PR opened time and the time it became ready for review (so drafts count from when they were marked ready). The end is the merge timestamp. If the PR was closed without merge, the metric is empty.

## Notes

### Timeline Metrics

- All durations are real elapsed time (may include non-working hours depending on `CORE_HOURS_START` and `CORE_HOURS_END` settings).
- Durations are reported both as formatted strings (e.g., "2 hours 30 minutes") and as numeric hours (floating point).
- Metrics that cannot be computed for a PR are left blank and excluded from aggregate calculations (averages, medians, percentiles).
- When events occur multiple times, definitions above specify whether intervals are single (first occurrence) or cumulative (summed across cycles).
- Timestamps are normalized to the configured timezone (default: UTC) and durations are rounded to the nearest minute.
- Percentiles (e.g., `pct75_X`) and aggregates are computed from the numeric minutes values.

### PR Size Calculation

- PR size (sizePoints) is calculated using: `additions + deletions * DELETION_WEIGHT`
- Default DELETION_WEIGHT is `0.2` (deletions contribute 20% of their line count)
- Size thresholds and deletion weight are configurable via action inputs:
  - `DELETION_WEIGHT` (default: 0.2)
  - `SIZE_XS_THRESHOLD` (default: 50)
  - `SIZE_S_THRESHOLD` (default: 200)
  - `SIZE_M_THRESHOLD` (default: 400)
  - `SIZE_L_THRESHOLD` (default: 700)

### General

- The TSV is encoded in UTF-8. The action exposes the TSV as an output named `TSV` when `tsv` is included in `EXECUTION_OUTCOME`.
- `date_iso` will be empty when the `date` label cannot be parsed into a known grouping format. Supported grouping formats include ISO dates (YYYY-MM-DD), weeks `W##/YYYY`, months `M/YYYY`, quarters `Q#/YYYY`, and years `YYYY`.
- Edge cases (missing event data, bot actors) are handled according to configuration options; see input parameters for filters.

