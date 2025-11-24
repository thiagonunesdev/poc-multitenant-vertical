import { JSX } from "react";
import Link from "next/link";

export default function HomePage(): JSX.Element {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">POC Multitenant – Storefront</h1>

      <p className="text-sm text-slate-600 text-center max-w-md">
        Essa POC mostra como o monorepo com Turbo não interfere na navegação
        SPA. A jornada principal fica dentro do app{" "}
        <code className="px-1 py-0.5 rounded bg-slate-200 text-xs">
          storefront
        </code>
        , e a navegação entre páginas x usa o roteador do Next (sem full
        reload).
      </p>

      <Link
        href="/org/acme_motors/anuncios"
        className="inline-flex items-center justify-center rounded-md border border-slate-900 px-4 py-2 text-sm font-medium bg-slate-900 text-white hover:bg-slate-800"
      >
        Ver anúncios da ACME Motors (sem reload)
      </Link>
    </main>
  );
}
