#!/usr/bin/env node

const { execSync } = require("node:child_process");

function getCurrentBranch() {
  const output = execSync("git rev-parse --abbrev-ref HEAD", {
    encoding: "utf8",
  }).trim();
  return output;
}

function getScopeFromBranch(branchName) {
  const [scope] = branchName.split("/");
  return scope;
}

// mapeia o escopo do branch -> paths permitidos e nome do app
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
  // se quiser um time de plataforma que pode tudo:
  platform: {
    appName: "platform",
    allowedPatterns: [/^apps\//, /^packages\//],
  },
};

function getScopeConfig() {
  const branch = getCurrentBranch();
  const scope = getScopeFromBranch(branch);
  const config = SCOPE_CONFIG[scope];

  if (!config) {
    throw new Error(
      `Escopo inválido pelo nome da branch "${branch}". ` +
        `Use um dos prefixos: ${Object.keys(SCOPE_CONFIG).join(", ")}`
    );
  }

  return { branch, scope, ...config };
}

// se for chamado diretamente via CLI, imprime JSON (pra outros scripts consumirem)
if (require.main === module) {
  try {
    const result = getScopeConfig();
    process.stdout.write(JSON.stringify(result));
  } catch (err) {
    console.error(`\n❌ ${err.message}\n`);
    process.exit(1);
  }
}

module.exports = {
  getScopeConfig,
};
