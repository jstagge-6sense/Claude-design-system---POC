# Cost calculation (agreed method)

Use this method every time the Cost page is rerun.

- Working time: message times from the session log plus git commit times, joined into one stretch when the gap is 1 hour or less. Longer gaps are not counted.
- Review time: add 25% to the counted hours for time spent looking outputs over.
- People cost: hours (with review time) x $150 per hour. No buffer on hours.
- Claude cost: measured model usage (cache read, cache write, output, input) x the rates in the Cost page, plus a 25% buffer on spend only.
- Total: people cost + Claude cost. Per token: total / 679 tokens. Per component: its own tokens plus a share of the shared core tokens.
- First day of usage: 10-02-'26. Work before the first commit is not on record, so it is not counted unless hours are added by hand.
- About 2 hours of the time were spent learning skills in the library.
- Date format: MM-DD-'YY.
- Last updated date: from now on, when the page is built or rebuilt, use the current date and time of that build as the last update, not the last logged message or commit. (Not applied to the current page yet.)

Where the numbers live: `src/preview/Cost.tsx` (defaults: awayGap 1, review 25, buffer 25, hourly 150), `docs/cost/usage-this-session.txt`, `docs/cost/time-this-session.json`, `docs/cost/time-git-commits.json`. Rerun with `npm run preview`.
