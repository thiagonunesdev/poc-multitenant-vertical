import type { TranslationEntry, TranslationMap } from "../domain/translations";
import { buildTranslationMap } from "../domain/translations";
import { httpGet } from "./httpClient";
import { I18N_API_URL } from "../config/env";

export async function fetchTranslations(
  tenantId: string,
  lang: string
): Promise<TranslationMap> {
  const entries = await httpGet<TranslationEntry[]>({
    path: I18N_API_URL,
    searchParams: {
      tenantId,
      lang,
    },
  });

  return buildTranslationMap(entries);
}
