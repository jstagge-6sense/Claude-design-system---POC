#!/usr/bin/env python3
"""Rebuilds docs/cost/usage-all-chats.txt and time-all-chats.json from the readable chat transcripts.
Rules applied every run (see METHOD.md):
- Slack reading is never counted: a model call that uses any Slack tool, and the call right after it that reads the result, are dropped,
  and their message times are left out of the working time.
- Dates and time ranges listed in exclude-dates.json are never counted (ranges are cost analysis pulling: reruns of usage and cost, and questions about them).
Usage: python3 extract-usage.py <transcript folder> <docs/cost folder>"""
import json, glob, os, sys
from datetime import datetime as D
src, out = sys.argv[1], sys.argv[2]
_ex = json.load(open(os.path.join(out, 'exclude-dates.json')))
excl = set(_ex['dates'])
ranges = [(r['start'], r['end']) for r in _ex.get('ranges', [])]  # cost analysis pulling: never counted
out_of = lambda t: t[:10] in excl or any(a <= t[:16] <= b for a, b in ranges)
calls, stamps, skip_next = {}, set(), False
for F in sorted(glob.glob(os.path.join(src, '*.jsonl'))):
    skip_next = False
    for l in open(F):
        try: o = json.loads(l)
        except Exception: continue
        m = o.get('message') or {}
        c = m.get('content') if isinstance(m, dict) else None
        slack = isinstance(c, list) and any(isinstance(x, dict) and x.get('type') == 'tool_use' and 'slack' in (x.get('name') or '').lower() for x in c)
        t = o.get('timestamp')
        if o.get('type') == 'assistant' and isinstance(m, dict) and m.get('usage') and m.get('id'):
            drop = slack or skip_next
            skip_next = slack
            if drop or not t or out_of(t): continue
            u = m['usage']
            calls[m['id']] = (t, u.get('cache_creation_input_tokens', 0), u.get('cache_read_input_tokens', 0), u.get('output_tokens', 0))
        if o.get('type') in ('user', 'assistant') and t and not o.get('isSidechain') and not slack and not skip_next and not out_of(t):
            stamps.add(t)
rows = sorted(calls.values())
open(os.path.join(out, 'usage-all-chats.txt'), 'w').write('\n'.join('%d %d %d %s' % (r[1], r[2], r[3], r[0][:16]) for r in rows) + '\n')
p = lambda s: D.fromisoformat(s.replace('Z', ''))
T = sorted(p(t) for t in stamps)
w, cur = [], [T[0], T[0]]
for t in T[1:]:
    if (t - cur[1]).total_seconds() <= 600: cur[1] = t
    else: w.append(cur); cur = [t, t]
w.append(cur)
f = lambda d: d.strftime('%Y-%m-%dT%H:%M')
json.dump({'note': 'Active working time from message timestamps across every readable chat. Messages less than 10 minutes apart count as one window. Times are UTC. Slack reading and excluded dates are left out.',
           'windows': [{'start': f(a), 'end': f(b)} for a, b in w]}, open(os.path.join(out, 'time-all-chats.json'), 'w'), indent=2)
print(len(rows), 'calls,', len(w), 'windows')
