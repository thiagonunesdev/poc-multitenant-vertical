export interface TranslationEntry {
  id: number;
  tenantId: string;
  lang: string;
  key: string;
  value: string;
}

export type TranslationMap = Record<string, string>;

export function buildTranslationMap(
  entries: TranslationEntry[]
): TranslationMap {
  return entries.reduce<TranslationMap>((map, entry) => {
    map[entry.key] = entry.value;
    return map;
  }, {});
}
