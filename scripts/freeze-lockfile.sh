#!/usr/bin/env bash
set -euo pipefail

if [ -f package-lock.json ]; then
  echo "package-lock.json already exists; refusing to regenerate silently."
  exit 2
fi

cp package.json /tmp/efata-package-before.json
npm install --package-lock-only --ignore-scripts
cmp -s package.json /tmp/efata-package-before.json || {
  echo "ERROR: package.json drifted during lockfile generation"
  diff -u /tmp/efata-package-before.json package.json || true
  exit 3
}

echo "lockfile_sha256=$(sha256sum package-lock.json | awk '{print $1}')"
echo "lockfile_generation=PASS"
