import fs from "node:fs";

const required = [
  "src/App.jsx",
  "src/lib/api.js",
  "src/lib/auth.js",
  "src/lib/permissions.js",
  "src/pages/Dashboard.jsx",
  "src/pages/Marketplace.jsx",
  "src/pages/Risk.jsx",
  "src/pages/Viability.jsx",
  "src/pages/Consent.jsx",
  "src/pages/Reconciliation.jsx",
  "docs/FRONTEND_CONTRACT_MATRIX.md",
  "docs/FRONTEND_ARCHITECTURE.md",
  "docs/API_CONTRACT_MAP.md",
  "docs/ROLE_PERMISSION_MATRIX.md",
];

for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`missing required file: ${file}`);
}

const sourceFiles = fs.readdirSync("src", { recursive: true })
  .filter((file) => typeof file === "string" && /\.(js|jsx)$/.test(file))
  .map((file) => `src/${file}`);
const all = sourceFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");

const forbidden = [
  "/api/chat/stream",
  "/api/fintech/leads",
  "/api/enterprise/leads",
  "fintegra.currentLead",
  "fallbackAssistant",
  "localStorage.setItem(",
];
for (const token of forbidden) {
  if (all.includes(token)) throw new Error(`legacy/fake contract detected: ${token}`);
}

const matrix = fs.readFileSync("docs/FRONTEND_CONTRACT_MATRIX.md", "utf8");
const routeRows = matrix.split("\n").filter((line) => line.startsWith("| `") && line.includes("/api/v1/"));
if (routeRows.length !== 67) {
  throw new Error(`contract matrix must contain 67 API rows; found ${routeRows.length}`);
}

console.log("static-check=PASS");
console.log("contract-matrix-rows=67");
