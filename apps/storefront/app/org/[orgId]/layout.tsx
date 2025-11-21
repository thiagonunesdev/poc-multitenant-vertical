import type { JSX, ReactNode } from "react";
import type { Tenant } from "@repo/core-config";
import { ThemeProvider } from "../../(providers)/ThemeProvider";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ orgId: string }>;
}

async function loadTenant(orgId: string): Promise<Tenant> {
  const res = await fetch(
    `http://localhost:3003/tenants?id=${encodeURIComponent(orgId)}`,
    { cache: "no-store" }
  );

  const tenants = await res.json();
  return tenants[0];
}

export default async function OrgLayout({
  children,
  params,
}: LayoutProps): Promise<JSX.Element> {
  const { orgId } = await params;
  const tenant = await loadTenant(orgId);

  return (
    <ThemeProvider theme={tenant.theme}>
      <div className="min-h-screen flex flex-col bg-[var(--tenant-primary)] text-[var(--tenant-secondary)]">
        {children}
      </div>
    </ThemeProvider>
  );
}
