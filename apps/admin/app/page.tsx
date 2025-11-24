import type { JSX } from "react";
import type { Tenant } from "@repo/core-config";
import { Card, Button } from "@repo/ui";
import Link from "next/link";

export const revalidate = 0;

async function loadTenants(): Promise<Tenant[]> {
  const res = await fetch("http://localhost:3003/tenants", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(
      `Falha ao buscar tenants em http://localhost:3003/tenants (status ${res.status})`
    );
  }

  const data = (await res.json()) as Tenant[];
  return data;
}

export default async function AdminHome(): Promise<JSX.Element> {
  const tenants = await loadTenants();

  return (
    <section style={{ display: "grid", gap: 24 }}>
      <header>
        <h1 style={{ fontSize: 24, margin: 0, marginBottom: 8 }}>
          Tenants cadastrados
        </h1>
        <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
          Este app é o MFE de <strong>admin</strong>, separado do storefront,
          consumindo:
          <br />
          <code style={{ fontSize: 12 }}>
            @repo/ui · @repo/core-config · JSON server (3003)
          </code>
        </p>
      </header>

      {tenants.length === 0 ? (
        <p style={{ fontSize: 14, color: "#64748b" }}>
          Nenhum tenant encontrado em <code>/tenants</code>.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 16,
          }}
        >
          {tenants.map((tenant) => {
            const langs = tenant.supportedLangs.join(", ");
            const storefrontUrl = `/org/${tenant.id}`;
            const adminOrgUrl = `/admin/org/${tenant.id}`;

            return (
              <Card key={tenant.id} className="space-y-3">
                <div>
                  <h2 className="font-semibold text-lg">{tenant.name}</h2>
                  <p className="text-sm text-slate-600">
                    ID: <code>{tenant.id}</code>
                  </p>
                  <p className="text-xs text-slate-500">
                    Domínio: <code>{tenant.domain}</code>
                  </p>
                </div>

                <div className="text-sm text-slate-700 space-y-1">
                  <p>
                    <strong>Default lang:</strong> {tenant.defaultLang}
                  </p>
                  <p>
                    <strong>Langs suportadas:</strong> {langs}
                  </p>
                  <p>
                    <strong>País:</strong> {tenant.country}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span>Cor primária:</span>
                  <span
                    style={{
                      display: "inline-block",
                      width: 16,
                      height: 16,
                      borderRadius: 999,
                      border: "1px solid #cbd5f5",
                      backgroundColor: tenant.theme.primary,
                    }}
                  />
                  <code>{tenant.theme.primary}</code>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span>Cor secundária:</span>
                  <span
                    style={{
                      display: "inline-block",
                      width: 16,
                      height: 16,
                      borderRadius: 999,
                      border: "1px solid #cbd5f5",
                      backgroundColor: tenant.theme.secondary,
                    }}
                  />
                  <code>{tenant.theme.secondary}</code>
                </div>

                <div className="pt-3 flex flex-wrap gap-2 items-center justify-between">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={storefrontUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Abrir storefronts
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href={adminOrgUrl}>Configurar org</Link>
                    </Button>
                  </div>

                  <span className="text-xs text-slate-500">
                    Configuração visual e SEO por org.
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
