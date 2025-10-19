# TSV format

This document describes the columns emitted in the `TSV` output of the action.

| Column name | Type | Description |
|-------------|------|-------------|
| `date_iso` | date (YYYY-MM-DD) | Start date of the grouping interval (e.g., Monday for ISO week, first day of month/quarter/year) |
| `date_iso_end` | date (YYYY-MM-DD) | End date of the grouping interval (e.g., Sunday for ISO week, last day of month/quarter/year) |
| `date` | string | Human-friendly group label used in the report (e.g., `2025-10`, `W01/2019`, `1/2025`) |
| `user` | string | User login or `total` for aggregated totals |
| `total_merged` | integer | Number of merged PRs in the interval for the user |
| `total_opened` | integer | Number of opened PRs in the interval for the user |
| `total_comments` | integer | Number of comments on PRs in the interval for the user |

The following timeline metrics are emitted twice: a human-readable formatted duration, and a numeric minutes column for machine analysis. For each metric `X` the columns are:

- `avg_X` (string) — average formatted value (e.g., `2 hours 30 minutes`)
- `avg_X_minutes` (integer) — average value in minutes
- `med_X` (string) — median formatted value
- `med_X_minutes` (integer) — median value in minutes
- `pct{PERCENTILE}_X` (string) — percentile formatted value (PERCENTILE is the configured percentile, e.g., `pct75_timeToReview`)
- `pct{PERCENTILE}_X_minutes` (integer) — percentile value in minutes

Timeline metric keys (replace `X` above)

- `timeInDraft` — Total elapsed time the pull request spent in "draft" status. Measured from each draft-enter event to the corresponding ready-for-review (or final close/merge) event and summed across multiple draft cycles. Reported both as a human-readable duration and in minutes. Empty when the PR was never a draft.

- `timeToReviewRequest` — Time between the PR becoming ready for review (opened non-draft or marked "ready for review") and the first explicit review request assignment (a GitHub "requested reviewer" event). If no review request was issued, the metric is empty. Multiple request events are ignored — only the first request is used.

- `timeToReview` — Time from the PR becoming ready for review to the first submitted review (a review with state COMMENT, APPROVE, or REQUEST_CHANGES). If no review was submitted, the metric is empty. If a review was submitted before a formal review request, the first submitted review is used as the end point.

- `timeWaitingForRepeatedReview` — Cumulative time the PR waited for additional reviews after the author made follow-up changes. For each cycle: measured from the first new commit after a review to the next submitted review. All such waiting intervals are summed. Empty when no repeated-review cycle occurred.

- `timeToApprove` — Time from the PR becoming ready for review to the first approving review (review state APPROVED). If the PR was never approved, the metric is empty. If an approval occurs before a formal request, that approval is used.

- `timeToMerge` — Time from the PR being eligible for review to merge. The start is the later of PR opened time and the time it became ready for review (so drafts count from when they were marked ready). The end is the merge timestamp. If the PR was closed without merge, the metric is empty.

Notes common to all timeline metrics:
- All durations are real elapsed time (include weekends/holidays) and are reported both as formatted strings (e.g., "2 hours 30 minutes") and as integer minutes.
- Metrics that cannot be computed for a PR are left blank and excluded from aggregate calculations (averages, medians, percentiles).
- When events occur multiple times, definitions above specify whether intervals are single (first occurrence) or cumulative (summed across cycles).
- Timestamps are normalized to UTC and durations are rounded to the nearest minute.
- Percentiles (e.g., `pct75_X`) and aggregates are computed from the numeric minutes columns.
- Edge cases (missing event data, bot actors) are ignored by default; see configuration options for filters that exclude bots or specific event types.

Notes:

- The TSV is encoded in UTF-8. The action exposes the TSV as an output named `TSV` and also uploads it as an artifact when configured.
- `date_iso` will be empty when the `date` label cannot be parsed into a known grouping format (e.g., custom labels). Supported grouping formats include ISO dates (YYYY-MM-DD), weeks `W##/YYYY`, months `M/YYYY`, quarters `Q#/YYYY`, and years `YYYY`.
