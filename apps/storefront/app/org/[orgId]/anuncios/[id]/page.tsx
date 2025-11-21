import type { JSX } from "react";
import type { Tenant, Announcement } from "@repo/core-config";
import { Button, Card } from "@repo/ui";
import type { Metadata } from "next";

export const revalidate = 30;

interface DetailPageProps {
  params: Promise<{
    orgId: string;
    id: string; // <- nome da pasta [id]
  }>;
}

async function loadTenant(orgId: string): Promise<Tenant> {
  const res = await fetch(
    `http://localhost:3003/tenants?id=${encodeURIComponent(orgId)}`,
    {
      next: { revalidate: 30 },
    }
  );

  if (!res.ok) {
    throw new Error(`Falha ao buscar tenant ${orgId} (status ${res.status})`);
  }

  const tenants = (await res.json()) as Tenant[];
  const tenant = tenants[0];

  if (!tenant) {
    throw new Error(`Tenant ${orgId} não encontrado`);
  }

  return tenant;
}

async function loadAnnouncement(
  orgId: string,
  announcementId: string
): Promise<Announcement> {
  const res = await fetch(
    `http://localhost:3002/announcements?tenantId=${encodeURIComponent(
      orgId
    )}&id=${encodeURIComponent(announcementId)}&lang=${encodeURIComponent(
      "pt-BR"
    )}`,
    {
      next: { revalidate: 30 },
    }
  );

  if (!res.ok) {
    throw new Error(
      `Falha ao buscar anúncio ${announcementId} do tenant ${orgId} (status ${res.status})`
    );
  }

  const list = (await res.json()) as Announcement[];
  const announcement = list[0];

  if (!announcement) {
    throw new Error(
      `Anúncio ${announcementId} não encontrado para tenant ${orgId}`
    );
  }

  return announcement;
}

// SEO dinâmico por anúncio
export async function generateMetadata(
  props: DetailPageProps
): Promise<Metadata> {
  const { orgId, id } = await props.params;
  const announcementId = id;

  const tenant = await loadTenant(orgId);
  const announcement = await loadAnnouncement(orgId, announcementId);

  const title =
    (announcement as any).seoTitle ?? `${announcement.title} | ${tenant.name}`;
  const description =
    (announcement as any).seoDescription ??
    announcement.description ??
    `Campanha de veículos em ${tenant.name}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: (announcement as any).heroImage
        ? [
            {
              url: (announcement as any).heroImage,
              alt: announcement.title,
            },
          ]
        : undefined,
    },
  };
}

export default async function AnnouncementDetailPage(
  props: DetailPageProps
): Promise<JSX.Element> {
  const { orgId, id } = await props.params;
  const announcementId = id;

  try {
    const tenant = await loadTenant(orgId);
    const announcement = await loadAnnouncement(orgId, announcementId);

    const validDate = new Date(
      (announcement as any).validUntil
    ).toLocaleDateString("pt-BR");

    return (
      <section className="space-y-4">
        <p className="text-xs text-slate-500">
          {tenant.name} · Campanha #{announcement.id}
        </p>

        <Card className="space-y-4">
          <header className="space-y-2">
            <h1 className="text-2xl font-bold">{announcement.title}</h1>
            {"description" in announcement &&
              (announcement as any).description && (
                <p className="text-sm text-slate-600">
                  {(announcement as any).description}
                </p>
              )}
            <p className="text-xs text-slate-500">
              Válido até {validDate} · Lang: {(announcement as any).lang}
            </p>
          </header>

          {"heroImage" in announcement && (announcement as any).heroImage && (
            <div className="overflow-hidden rounded-lg border bg-slate-100">
              <img
                src={(announcement as any).heroImage}
                alt={announcement.title}
                className="w-full h-56 object-cover"
              />
            </div>
          )}

          {"cars" in announcement &&
            Array.isArray((announcement as any).cars) &&
            (announcement as any).cars.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-sm font-semibold text-slate-800">
                  Modelos em destaque
                </h2>
                <ul className="space-y-2 text-sm text-slate-700">
                  {(announcement as any).cars.map(
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
                        className="flex items-center justify-between rounded border bg-slate-50 px-3 py-2"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {car.model} · {car.year}
                            {car.highlight ? " ⭐" : ""}
                          </span>
                        </div>
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
              </section>
            )}

          <div className="flex items-center justify-between pt-2 border-t mt-2">
            <Button variant="default" size="sm">
              {("ctaLabel" in announcement && (announcement as any).ctaLabel) ||
                "Ver ofertas"}
            </Button>
            <span className="text-[10px] text-slate-500">
              ID interno: {announcement.id} · Slug:{" "}
              {("slug" in announcement && (announcement as any).slug) || "-"}
            </span>
          </div>
        </Card>
      </section>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";

    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold text-red-600">
          Erro no detalhe do anúncio
        </h1>
        <p className="text-sm text-slate-700">
          Aconteceu um erro ao carregar o anúncio{" "}
          <code className="px-1 py-0.5 bg-slate-200 text-xs rounded">
            {announcementId}
          </code>{" "}
          para org{" "}
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
