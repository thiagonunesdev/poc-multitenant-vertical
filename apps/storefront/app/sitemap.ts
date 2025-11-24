import type { MetadataRoute } from "next";
import type { Tenant, Announcement } from "@repo/core-config";

const TENANT_API = "http://localhost:3003/tenants";
const ANN_API = "http://localhost:3002/announcements";

// Idealmente vem do gateway em prod. Para POC, pode deixar assim:
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:4000";

/**
 * Gera sitemap dinâmico multi-tenant.
 * Next vai servir em /sitemap.xml
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1) Carrega tenants
  const tenantRes = await fetch(TENANT_API, { cache: "no-store" });
  if (!tenantRes.ok) {
    throw new Error(`Falha ao carregar tenants (status ${tenantRes.status})`);
  }

  const tenants = (await tenantRes.json()) as Tenant[];

  // 2) Monta URLs base (home + rotas por tenant)
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  for (const tenant of tenants) {
    // /org/:id (pagina da org)
    routes.push({
      url: `${SITE_URL}/org/${tenant.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });

    // /org/:id/anuncios (lista)
    routes.push({
      url: `${SITE_URL}/org/${tenant.id}/anuncios`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    });

    // 3) Carrega anúncios daquele tenant e cria as URLs individuais
    const annRes = await fetch(
      `${ANN_API}?tenantId=${encodeURIComponent(tenant.id)}`,
      { cache: "no-store" }
    );

    if (!annRes.ok) {
      // Não derruba sitemap inteiro se um tenant não tiver anúncios
      continue;
    }

    const announcements = (await annRes.json()) as Announcement[];

    for (const ann of announcements) {
      routes.push({
        url: `${SITE_URL}/org/${tenant.id}/anuncios/${ann.id}`,
        lastModified: ann.validUntil ? new Date(ann.validUntil) : new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  return routes;
}
