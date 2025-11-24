#!/usr/bin/env node

const { execSync } = require("node:child_process");

/**
 * MESMA CONFIG do scripts/get-scope.cjs
 * (copiado pra ficar self-contained no CI)
 */
const SCOPE_CONFIG = {
  storefront: {
    appName: "storefront",
    allowedPatterns: [
      /^apps\/storefront\//,
      /^packages\/ui\//,
      /^packages\/core-config\//,
    ],
  },
  admin: {
    appName: "admin",
    allowedPatterns: [
      /^apps\/admin\//,
      /^packages\/ui\//,
      /^packages\/core-config\//,
    ],
  },
  docs: {
    appName: "docs",
    allowedPatterns: [/^apps\/docs\//],
  },
  gateway: {
    appName: "gateway",
    allowedPatterns: [/^apps\/gateway\//, /^packages\/core-config\//],
  },
  platform: {
    appName: "platform",
    allowedPatterns: [
      /^apps\//,
      /^packages\//,

      // ✅ root permitido só pra plataforma
      /^scripts\//,
      /^\.husky\//,
      /^turbo\.json$/,
      /^package\.json$/,
      /^pnpm-workspace\.yaml$/,
      /^pnpm-lock\.yaml$/,
      /^README\.md$/,
      /^tsconfig\.json$/,
      /^\.editorconfig$/,
      /^\.gitignore$/,
    ],
  },
};

function sh(cmd) {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

function getBranchFromEnv() {
  return (
    process.env.GITHUB_HEAD_REF || // PRs no GitHub Actions
    process.env.GITHUB_REF_NAME || // push no GitHub Actions
    process.env.CI_COMMIT_REF_NAME || // GitLab
    process.env.BRANCH_NAME || // Jenkins
    sh("git rev-parse --abbrev-ref HEAD") // fallback local/CI
  );
}

function getBaseBranchFromEnv() {
  return (
    process.env.GITHUB_BASE_REF || // PRs no GitHub Actions
    process.env.CI_MERGE_REQUEST_TARGET_BRANCH_NAME || // GitLab
    process.env.CHANGE_TARGET || // Jenkins
    "main"
  );
}

function ensureBaseFetched(baseBranch) {
  try {
    sh(`git show-ref --verify --quiet refs/remotes/origin/${baseBranch}`);
  } catch {
    console.log(
      `ℹ️ Base origin/${baseBranch} não estava local. Fazendo fetch...`
    );
    execSync(`git fetch origin ${baseBranch}`, { stdio: "inherit" });
  }
}

function getChangedFiles(baseBranch) {
  ensureBaseFetched(baseBranch);
  const mergeBase = sh(`git merge-base origin/${baseBranch} HEAD`);
  const out = sh(`git diff --name-only ${mergeBase} HEAD --diff-filter=ACMRT`);
  return out
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean);
}

function isFileAllowed(file, patterns) {
  if (file.startsWith(".husky/")) return true;
  if (file === "pnpm-lock.yaml") return true;
  if (file === "package.json") return true;

  return patterns.some((pattern) => pattern.test(file));
}

function runScopedLint(appName) {
  const cmd = `pnpm turbo run lint --filter=${appName}...`;
  console.log(
    `\n🔎 Rodando lint apenas para "${appName}" via Turbo:\n> ${cmd}\n`
  );
  execSync(cmd, { stdio: "inherit" });
}

function main() {
  const branch = getBranchFromEnv();
  const scope = branch.split("/")[0];
  const config = SCOPE_CONFIG[scope];

  if (!config) {
    console.error(
      `\n❌ Escopo inválido pelo nome da branch "${branch}".\n` +
        `Use um dos prefixos: ${Object.keys(SCOPE_CONFIG).join(", ")}\n`
    );
    process.exit(1);
  }

  const { appName, allowedPatterns } = config;

  console.log(
    `\n📌 Escopo detectado pelo nome da branch: "${branch}" → "${scope}" (app: ${appName})`
  );

  const baseBranch = getBaseBranchFromEnv();
  const files = getChangedFiles(baseBranch);

  if (files.length === 0) {
    console.log("Nenhuma mudança detectada no diff do PR.");
    process.exit(0);
  }

  const invalidFiles = files.filter(
    (file) => !isFileAllowed(file, allowedPatterns)
  );

  if (invalidFiles.length > 0) {
    console.error(
      `\n❌ PR bloqueado para o escopo "${scope}".\n` +
        `   Você só pode alterar arquivos dos paths:\n` +
        allowedPatterns.map((p) => `   - ${p}`).join("\n") +
        "\n\n   Arquivos fora do seu escopo:\n" +
        invalidFiles.map((f) => `   - ${f}`).join("\n") +
        "\n"
    );
    process.exit(1);
  }

  if (scope === "platform") {
    console.log(
      "\nℹ️ Escopo 'platform': pulando lint (não há pacote 'platform' no workspace)."
    );
    console.log("\n✅ CI scope-check OK para mudanças de root/infra.");
    process.exit(0);
  }

  try {
    runScopedLint(appName);
  } catch {
    console.error(
      `\n❌ Lint falhou para "${appName}". Corrija antes do merge.\n`
    );
    process.exit(1);
  }

  console.log("\n✅ CI scope-check OK.");
}

main();
