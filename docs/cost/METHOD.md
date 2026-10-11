# Cost calculation (agreed method)

Use this method every time the Cost page is rerun.

- Working time: message times from the session log plus git commit times, joined into one stretch when the gap is 1 hour or less. Longer gaps are not counted.
- Review time: add 25% to the counted hours for time spent looking outputs over.
- People cost: hours (with review time) x $150 per hour. No buffer on hours.
- Claude cost: measured model usage (cache read, cache write, output, input) x the rates in the Cost page, plus a 25% buffer on spend only.
- Total: people cost + Claude cost. Per token: total / 679 tokens. Per component: its own tokens plus a share of the shared core tokens.
- First day of usage: 10-02-'26. Work before the first commit is not on record, so it is not counted unless hours are added by hand.
- About 2 hours of the time were spent learning skills in the library.
- Excluded dates: 10-09-'26 and 10-11-'26 are never counted, now or in future runs (no work on the design system on those days). They are listed in `docs/cost/exclude-dates.json`; usage lines carry their date so they can be filtered.
- Slack reading: never counted, now or in future runs. Any model call that uses a Slack tool, plus the call that reads its result, is dropped from usage and from working time. `docs/cost/extract-usage.py` applies this and the excluded dates. No Slack reading was found in the readable chats so far, so today's numbers did not change.
- Cost analysis pulling: never counted. Time and model calls spent pulling usage, rerunning the cost, and answering questions about the cost are added to the `ranges` list in `docs/cost/exclude-dates.json` and left out. Building the Cost page itself is counted. Add each new pull to that list.
- Cleanup of unused files: never counted. Time and calls spent finding, moving or removing unused files are added to the `ranges` list in `docs/cost/exclude-dates.json` and left out. Unused files are moved into an `_unused` folder, not deleted.
- Tasks not counted: Demo pages, Library restore, Cost page, and Token editor and import tools are never counted in the cost (hours, model usage, per token, per component), now or in future runs. Work is assigned to tasks by time in `docs/cost/tasks.json`; its `excluded` list says which tasks are left out. New work must be added there as a new segment with its task name.
- Cost by task: the Cost page shows each counted task with calls, tokens used, hours, Claude cost, people cost and total, right above Cost per token. "Where the measured cost went" is at the very bottom.
- Early build: the early build row uses 2.1 million effective tokens (cached re-reads x0.1, cache writes x2, output x5) from `docs/cost/early-build.json`, costed at the input rate with the buffer on spend. Its calls are 36 model turns (72 tool calls across them), added to the call total. Use this for the early build now and in future runs.
- Working time shown: the Working time stat and the Measured line show ALL work hours, including tasks that are not counted in the cost. The cost, per token and per component use only the counted tasks' hours. Excluded dates, Slack reading, cost analysis pulling and cleanup are still left out of both.
- Date format: MM-DD-'YY.
- Last updated date: from now on, when the page is built or rebuilt, use the current date and time of that build as the last update, not the last logged message or commit. (Not applied to the current page yet.)

Where the numbers live: `src/preview/Cost.tsx` (defaults: awayGap 1, review 25, buffer 25, hourly 150), `docs/cost/usage-this-session.txt`, `docs/cost/time-this-session.json`, `docs/cost/time-git-commits.json`. Rerun with `npm run preview`.
