import type { JSX } from "react";
import type { Tenant } from "@repo/core-config";
import { Card, Button } from "@repo/ui";
import { TenantConfigForm } from "./tenant-config-form";
import Link from "next/link";

interface TenantPageProps {
  params: Promise<{
    orgId: string;
  }>;
}

async function loadTenant(orgId: string): Promise<Tenant> {
  const res = await fetch(
    `http://localhost:3003/tenants?id=${encodeURIComponent(orgId)}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error(
      `Falha ao buscar tenant ${orgId} em http://localhost:3003/tenants (status ${res.status})`
    );
  }

  const tenants = (await res.json()) as Tenant[];
  const tenant = tenants[0];

  if (!tenant) {
    throw new Error(`Tenant ${orgId} não encontrado em /tenants`);
  }

  return tenant;
}

export default async function TenantPage(
  props: TenantPageProps
): Promise<JSX.Element> {
  const { orgId } = await props.params;
  const tenant = await loadTenant(orgId);

  const storefrontUrl = `http://localhost:4000/org/${tenant.id}/anuncios`;

  return (
    <section style={{ display: "grid", gap: 24 }}>
      <header style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 24, margin: 0, marginBottom: 4 }}>
            Configuração da org: {tenant.name}
          </h1>
          <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
            ID: <code>{tenant.id}</code> · Domínio: <code>{tenant.domain}</code>
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Button variant="outline" size="sm" asChild>
            <Link href="/" rel="noreferrer">
              Voltar para lista
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={storefrontUrl} target="_blank" rel="noreferrer">
              Ver storefront
            </Link>
          </Button>
        </div>
      </header>

      {/* Bloco: informações gerais (read-only) */}
      <Card className="space-y-3">
        <h2 className="font-semibold text-lg">Informações gerais</h2>

        <div className="grid gap-3 text-sm text-slate-700">
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Nome público
            </label>
            <input
              readOnly
              value={tenant.name}
              className="w-full rounded border border-slate-200 px-2 py-1 text-sm bg-slate-50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">
                ID (interno)
              </label>
              <input
                readOnly
                value={tenant.id}
                className="w-full rounded border border-slate-200 px-2 py-1 text-sm bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">País</label>
              <input
                readOnly
                value={tenant.country}
                className="w-full rounded border border-slate-200 px-2 py-1 text-sm bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">
                Domínio
              </label>
              <input
                readOnly
                value={tenant.domain}
                className="w-full rounded border border-slate-200 px-2 py-1 text-sm bg-slate-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">
                Idioma padrão
              </label>
              <input
                readOnly
                value={tenant.defaultLang}
                className="w-full rounded border border-slate-200 px-2 py-1 text-sm bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">
                Idiomas suportados
              </label>
              <input
                readOnly
                value={tenant.supportedLangs.join(", ")}
                className="w-full rounded border border-slate-200 px-2 py-1 text-sm bg-slate-50"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Form único de tema + SEO */}
      <TenantConfigForm tenant={tenant} />
    </section>
  );
}
