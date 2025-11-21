export interface TenantTheme {
  primary: string;
  secondary: string;
}

export interface TenantSeo {
  title: string;
  description: string;
}

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  defaultLang: string;
  supportedLangs: string[];
  theme: TenantTheme;
  logoUrl: string;
  country: string;
  seo?: TenantSeo; // opcional pra não quebrar JSON antigo
}
