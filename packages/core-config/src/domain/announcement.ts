export interface AnnouncementCar {
  model: string;
  year: number;
  priceFrom: number;
  currency?: string;
  image: string;
  highlight: boolean;
}

export interface Announcement {
  id: number;
  tenantId: string;
  slug: string;
  lang: string;
  title: string;
  description: string;
  ctaLabel: string;
  heroImage: string;
  validUntil: string; // ISO date string
  cars: AnnouncementCar[];
}
