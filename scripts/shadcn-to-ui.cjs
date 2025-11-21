#!/usr/bin/env node

const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const components = process.argv.slice(2);

if (components.length === 0) {
  console.error("Usage: pnpm generate:ui button card input ...");
  process.exit(1);
}

const rootDir = process.cwd();
const storefrontDir = path.join(rootDir, "apps", "storefront");
const uiSrcDir = path.join(rootDir, "packages", "ui", "src");
const uiComponentsDir = path.join(uiSrcDir, "components", "ui");
const uiLibDir = path.join(uiSrcDir, "lib");

fs.mkdirSync(uiComponentsDir, { recursive: true });
fs.mkdirSync(uiLibDir, { recursive: true });

for (const name of components) {
  console.log(
    `\n=== Gerando componente "${name}" com shadcn no storefront ===`
  );

  // roda o CLI do shadcn dentro de apps/storefront
  execSync(`pnpm dlx shadcn@latest add ${name}`, {
    cwd: storefrontDir,
    stdio: "inherit",
  });

  const sourceComponent = path.join(
    storefrontDir,
    "components",
    "ui",
    `${name}.tsx`
  );

  if (!fs.existsSync(sourceComponent)) {
    console.warn(
      `⚠️  Não encontrei ${sourceComponent}. O shadcn gerou esse componente com outro nome?`
    );
  } else {
    const targetComponent = path.join(uiComponentsDir, `${name}.tsx`);
    console.log(`→ Movendo ${sourceComponent} -> ${targetComponent}`);
    fs.copyFileSync(sourceComponent, targetComponent);
    fs.rmSync(sourceComponent);
  }

  const sourceUtils = path.join(storefrontDir, "lib", "utils.ts");
  const targetUtils = path.join(uiLibDir, "utils.ts");

  // só move utils.ts na primeira vez (não sobrescreve se já existir no ui)
  if (fs.existsSync(sourceUtils) && !fs.existsSync(targetUtils)) {
    console.log(`→ Movendo ${sourceUtils} -> ${targetUtils}`);
    fs.copyFileSync(sourceUtils, targetUtils);
    fs.rmSync(sourceUtils);
  }
}

console.log("\n✅ Componentes gerados no packages/ui.");
console.log(
  "Lembra de exportá-los em packages/ui/src/index.ts se ainda não exportou."
);
