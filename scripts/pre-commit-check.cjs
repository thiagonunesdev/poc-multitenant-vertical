#!/usr/bin/env node

const { execSync } = require("node:child_process");
const { getScopeConfig } = require("./get-scope.cjs");

function getStagedFiles() {
  const output = execSync("git diff --cached --name-only --diff-filter=ACMRT", {
    encoding: "utf8",
  });
  return output
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean);
}

function isFileAllowed(file, patterns) {
  // ignorar alguns arquivos genéricos
  if (file.startsWith(".husky/")) return true;
  if (file === "pnpm-lock.yaml") return true;
  if (file === "package.json") return true;
  return patterns.some((pattern) => pattern.test(file));
}

function runScopedLint(appName) {
  // aqui usamos turbo pra rodar só lint do app e deps
  const cmd = `pnpm turbo run lint --filter=${appName}...`;
  console.log(
    `\n🔎 Rodando lint apenas para "${appName}" via Turbo:\n> ${cmd}\n`
  );
  execSync(cmd, { stdio: "inherit" });
}

function main() {
  let scopeConfig;
  try {
    scopeConfig = getScopeConfig();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  const { branch, scope, appName, allowedPatterns } = scopeConfig;

  console.log(
    `\n📌 Escopo detectado pelo nome da branch: "${branch}" → "${scope}" (app: ${appName})`
  );

  const files = getStagedFiles();

  if (files.length === 0) {
    console.log("Nenhum arquivo staged, nada para validar.");
    process.exit(0);
  }

  const invalidFiles = files.filter(
    (file) => !isFileAllowed(file, allowedPatterns)
  );

  if (invalidFiles.length > 0) {
    console.error(
      `\n❌ Commit bloqueado para o escopo "${scope}".\n` +
        `   Você só pode alterar arquivos dos paths:\n` +
        allowedPatterns.map((p) => `   - ${p}`).join("\n") +
        "\n\n   Arquivos fora do seu escopo:\n" +
        invalidFiles.map((f) => `   - ${f}`).join("\n") +
        "\n"
    );
    process.exit(1);
  }

  // Escopo platform não tem app correspondente no workspace.
  // Ele serve só pra infra/root. Então pulamos lint automaticamente.
  if (scope === "platform") {
    console.log(
      "\nℹ️ Escopo 'platform': pulando lint (não há pacote 'platform' no workspace)."
    );
    console.log("\n✅ Pré-commit OK para mudanças de root/infra.");
    process.exit(0);
  }

  try {
    runScopedLint(appName);
  } catch {
    console.error(
      `\n❌ Lint falhou para "${appName}". Corrija antes de commitar.\n`
    );
    process.exit(1);
  }

  console.log("\n✅ Pré-commit OK.");
}

if (require.main === module) {
  main();
}
