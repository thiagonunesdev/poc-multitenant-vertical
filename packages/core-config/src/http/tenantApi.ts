import type { Tenant } from "../domain/tenant";
import { httpGet } from "./httpClient";
import { TENANT_API_URL } from "../config/env";

export async function fetchTenantById(orgId: string): Promise<Tenant> {
  const tenants = await httpGet<Tenant[]>({
    path: TENANT_API_URL,
    searchParams: { id: orgId },
  });

  if (tenants.length === 0) {
    throw new Error(`Tenant not found for id ${orgId}`);
  }

  return tenants[0] as Tenant;
}
