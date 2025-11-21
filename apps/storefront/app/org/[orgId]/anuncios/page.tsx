import Link from "next/link";
import type { Tenant, Announcement } from "@repo/core-config";
import { JSX } from "react";
import { Button, Card } from "@repo/ui";
import type { Metadata } from "next";

export const revalidate = 30;

interface AnnouncementsPageProps {
  params: Promise<{
    orgId: string;
  }>;
}

interface Translation {
  id: number;
  tenantId: string;
  lang: string;
  key: string;
  value: string;
}

export async function generateMetadata(
  props: AnnouncementsPageProps
): Promise<Metadata> {
  const { orgId } = await props.params;

  // pega só o tenant de dentro do loadData
  const { tenant } = await loadData(orgId);

  const title = tenant.seo?.title ?? `${tenant.name} — Anúncios`;
  const description =
    tenant.seo?.description ??
    `Veja as campanhas e veículos disponíveis em ${tenant.name}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
    alternates: {
      canonical: `/org/${orgId}/anuncios`,
    },
  };
}

async function loadData(orgId: string): Promise<{
  tenant: Tenant;
  announcements: Announcement[];
  campaignTitle: string;
  campaignSubtitle: string;
}> {
  // 1) Tenant
  const tenantRes = await fetch(
    `http://localhost:3003/tenants?id=${encodeURIComponent(orgId)}`,
    {
      next: { revalidate: 30 },
    }
  );

  if (!tenantRes.ok) {
    throw new Error(
      `Falha ao buscar tenant ${orgId} (status ${tenantRes.status})`
    );
  }

  const tenants = (await tenantRes.json()) as Tenant[];
  const tenant = tenants[0];

  if (!tenant) {
    throw new Error(`Tenant ${orgId} não encontrado em /tenants`);
  }

  // 2) Campanhas/anúncios desse tenant
  const annsRes = await fetch(
    `http://localhost:3002/announcements?tenantId=${encodeURIComponent(
      tenant.id
    )}`,
    {
      next: { revalidate: 30 },
    }
  );

  if (!annsRes.ok) {
    throw new Error(
      `Falha ao buscar anúncios do tenant ${tenant.id} (status ${annsRes.status})`
    );
  }

  const announcements = (await annsRes.json()) as Announcement[];

  // 3) Traduções da campanha (i18n) para o defaultLang do tenant
  const i18nRes = await fetch(
    `http://localhost:3001/translations?tenantId=${encodeURIComponent(
      tenant.id
    )}&lang=${encodeURIComponent(tenant.defaultLang)}`,
    {
      next: { revalidate: 30 },
    }
  );

  if (!i18nRes.ok) {
    throw new Error(
      `Falha ao buscar traduções para ${tenant.id} (status ${i18nRes.status})`
    );
  }

  const translations = (await i18nRes.json()) as Translation[];

  const findValue = (key: string): string | undefined =>
    translations.find((t) => t.key === key)?.value;

  const campaignTitle =
    findValue("campaign.title") ?? `Campanhas em ${tenant.name}`;

  const campaignSubtitle =
    findValue("campaign.subtitle") ?? "Ofertas selecionadas para você";

  return { tenant, announcements, campaignTitle, campaignSubtitle };
}

export default async function AnnouncementsPage(
  props: AnnouncementsPageProps
): Promise<JSX.Element> {
  const { orgId } = await props.params;

  try {
    const { tenant, announcements, campaignTitle, campaignSubtitle } =
      await loadData(orgId);

    // por enquanto, só pt-BR pra não misturar línguas
    const filtered = announcements.filter(
      (a: any) => a.lang === "pt-BR" || a.lang === undefined
    );

    return (
      <section className="space-y-4">
        {/* Hero da campanha, vindo do servidor de i18n */}
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">{campaignTitle}</h1>
          <p className="text-sm text-slate-600">{campaignSubtitle}</p>
          <p className="text-xs text-slate-500">
            Tenant: {tenant.name} ({tenant.id}) · Default lang:{" "}
            {tenant.defaultLang}
          </p>
        </header>

        {filtered.length === 0 ? (
          <p className="text-sm text-slate-500">
            Nenhuma campanha cadastrada para este tenant.
          </p>
        ) : (
          <div className="space-y-4">
            {filtered.map((announcement: any) => {
              const validDate = announcement.validUntil
                ? new Date(announcement.validUntil).toLocaleDateString("pt-BR")
                : undefined;

              return (
                <Card key={announcement.id} className="space-y-3">
                  <div>
                    <h2 className="font-semibold text-lg">
                      {announcement.title}
                    </h2>
                    {announcement.description && (
                      <p className="text-sm text-slate-600">
                        {announcement.description}
                      </p>
                    )}
                    {validDate && (
                      <p className="text-xs text-slate-500 mt-1">
                        Válido até {validDate}
                      </p>
                    )}
                  </div>

                  {announcement.cars &&
                    Array.isArray(announcement.cars) &&
                    announcement.cars.length > 0 && (
                      <div className="mt-2 space-y-2">
                        <p className="text-xs font-medium text-slate-700">
                          Modelos em destaque:
                        </p>
                        <ul className="space-y-1 text-sm text-slate-700">
                          {announcement.cars.map(
                            (
                              car: {
                                model: string;
                                year: number;
                                priceFrom?: number;
                                currency?: string;
                                highlight?: boolean;
                              },
                              index: number
                            ) => (
                              <li
                                key={`${announcement.id}-${index}`}
                                className="flex items-center justify-between"
                              >
                                <span>
                                  {car.model} · {car.year}
                                  {car.highlight ? " ⭐" : ""}
                                </span>
                                <span className="font-semibold">
                                  {typeof car.priceFrom === "number"
                                    ? car.priceFrom.toLocaleString("pt-BR", {
                                        style: "currency",
                                        currency: car.currency ?? "BRL",
                                      })
                                    : "Preço sob consulta"}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  <Button variant="default" size="sm" className="mt-2" asChild>
                    <Link
                      href={`/org/${tenant.id}/anuncios/${announcement.id}`}
                    >
                      {announcement.ctaLabel ?? "Ver detalhes"}
                    </Link>
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";

    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold text-red-600">
          Erro na página de anúncios
        </h1>
        <p className="text-sm text-slate-700">
          Aconteceu um erro ao carregar os dados para org:{" "}
          <code className="px-1 py-0.5 bg-slate-200 text-xs rounded">
            {orgId}
          </code>
        </p>
        <pre className="text-xs bg-red-50 border border-red-200 text-red-800 p-3 rounded">
          {message}
        </pre>
      </section>
    );
  }
}
