import type { Announcement } from "../domain/announcement";
import { httpGet } from "./httpClient";
import { ANNOUNCEMENT_API_URL } from "../config/env";

export async function fetchAnnouncementsByTenant(
  tenantId: string
): Promise<Announcement[]> {
  return httpGet<Announcement[]>({
    path: ANNOUNCEMENT_API_URL,
    searchParams: { tenantId },
  });
}

export async function fetchAnnouncementById(
  tenantId: string,
  id: string
): Promise<Announcement> {
  const list = await httpGet<Announcement[]>({
    path: ":3002/announcements",
    searchParams: {
      id,
      tenantId,
    },
  });

  if (list.length === 0) {
    throw new Error(`Announcement ${id} not found`);
  }

  return list[0] as Announcement;
}
