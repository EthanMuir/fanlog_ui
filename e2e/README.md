# Tests

Both suites run in CI (`.github/workflows/ci.yml`) on every pull request.

| Suite | Command | What it covers |
| --- | --- | --- |
| Unit (Vitest) | `npm test` | `dynamicGenerator.js` (reading the landing page's hand-off, pairing scores with teams, same-league opponents, per-sport periods, generated feed/chats/games), `mockData.js` (URL then localStorage), the FanLog Score (kept identical to the landing page's) and the team directory |
| End-to-end (Playwright) | `npm run e2e` | The production build in Chromium at the 390x844 size the landing page embeds it: every tab, customisation from URL params, feed filters and likes, joining and chatting in a room, logging a game and the profile stats |

```bash
npx playwright install chromium
npm run e2e
```

`npm run e2e` builds first; `E2E_SKIP_BUILD=1 npm run e2e` reuses `dist/`.
Team logos and other outside hosts are stubbed in `e2e/fixtures.js`, and a
test fails if the page throws or logs an error.

The landing page (fanlog) serves a built copy of this app from `public/app`,
so after changing it here, rebuild and copy `dist/` there.
