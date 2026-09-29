#!/usr/bin/env bash
set -euo pipefail

test -f package-lock.json || {
  echo "ERROR: package-lock.json missing. Run scripts/freeze-lockfile.sh in a connected clean environment first."
  exit 2
}

npm ci
npm run static-check
npm test
npm run build

echo "frontend_r1_1_qualification=PASS"
