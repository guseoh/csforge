# Learning visualization visual-pilot extension — Java and TCP

## Scope

Continue the approved [Heap Index Explorer](heap-index-explorer-pilot.md) visual standard with the two remaining proof cases. Screens use the same quiet neutral scheme, square outlines, no cards/gradients, readable Korean explanation and light/dark comparison.

The user-approved Heap preview is unchanged. Rather than making every concept interactive, both additional examples are **static before/after** displays; this better serves their teaching goals.

### Java Pass-by-Value

- Reference code: `Member member = new Member("kim"); replace(member);` and within `replace(Member param)`, `param = new Member("park");`.
- Panel ① during method entry: caller `member → A`, parameter `param → A`.
- Panel ② after parameter reassignment, **before method return**: `member → A`, `param → B`.
- This is a logical reference model, not a claim of JVM heap/stack physical layout. Object B is not asserted collected on return.

### TCP Sliding Window

- Sequence numbers represent bytes, not packet counts.
- Simplified sender: 100-byte data units, initial sending window 1000~1399, data 1000~1399 already sent.
- Upon receipt of cumulative ACK 1200, the confirmed bytes are 1000~1199, the window moves to 1200~1599, bytes 1200~1399 remain sent but unacknowledged, and bytes 1400~1599 can be sent.
- Assumptions: advertised receive window remains 400B, cwnd permits at least 400B, no loss/retransmissions.

## Local preview

```powershell
cd C:\\Users\\guseo\\IdeaProjects\\csforge-heap-preview\\frontend
npm ci
npm run dev
Start-Process "http://localhost:5173/study-visual-pilots-preview.html"
```

This separate HTML preview displays all three pilot visuals with a light/dark toggle. Existing `heap-index-explorer-preview.html` remains available.

## Verification and boundaries

- Unit/SSR tests check reference labels and byte-based range states.
- Chromium QA is expected at 1280×900 and 1440×900 for dark and light, checking both pilot instances, no page overflow, and producing independent PNG artifacts for visual review.
- **No canonical Markdown Import changes**, no new `csforge-viz` type, no production route, no DB changes or rollout.
- Browser screenshots need human visual acceptance before these patterns are adopted as a standard for other content.
