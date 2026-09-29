# LOCKFILE / BUILD GATE — R1.1

## State

`package-lock.json` is intentionally **not fabricated** in this proposal.

The authoring sandbox cannot reach the npm registry, therefore a new lockfile cannot be generated and verified with `npm ci` here.

## Canonical connected gate

Run in a clean, network-enabled environment using the exact R1.1 source:

```bash
node --version
npm --version

npm install --package-lock-only --ignore-scripts
git diff -- package.json

npm ci
npm run static-check
npm test
npm run build
```

Requirements:

```text
package.json drift = NONE
package-lock.json = CREATED
npm ci = PASS
static-check = PASS
tests = PASS
vite build = PASS
```

Then freeze the generated `package-lock.json`, calculate SHA-256 and submit it with the complete logs to AO-01.

Do not use `npm install` as the canonical deployment install after the lockfile exists; use `npm ci`.
