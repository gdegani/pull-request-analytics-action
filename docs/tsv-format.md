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

Timeline metric keys (replace `X` above):

- `timeInDraft`
- `timeToReviewRequest`
- `timeToReview`
- `timeWaitingForRepeatedReview`
- `timeToApprove`
- `timeToMerge`

Notes:

- The TSV is encoded in UTF-8. The action exposes the TSV as an output named `TSV` and also uploads it as an artifact when configured.
- `date_iso` will be empty when the `date` label cannot be parsed into a known grouping format (e.g., custom labels). Supported grouping formats include ISO dates (YYYY-MM-DD), weeks `W##/YYYY`, months `M/YYYY`, quarters `Q#/YYYY`, and years `YYYY`.
