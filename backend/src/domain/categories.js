/**
 * Kategorie ocen szczegółowych. Źródło prawdy dla backendu — front pobiera je
 * z /api/categories, żeby etykiety nie rozjechały się między warstwami.
 */
export const CATEGORIES = [
  {
    id: 'script',
    label: 'Scenariusz i struktura',
    short: 'Scenariusz',
    desc: 'Czy historia jest logiczna, dobrze zbudowana i sensownie poprowadzona w czasie.',
  },
  {
    id: 'directing',
    label: 'Reżyseria i narracja',
    short: 'Reżyseria',
    desc: 'Jak reżyser prowadzi widza: tempo, decyzje inscenizacyjne, kontrola tonu.',
  },
  {
    id: 'acting',
    label: 'Postacie i aktorstwo',
    short: 'Aktorstwo',
    desc: 'Na ile bohaterowie są wiarygodni, a aktorstwo wspiera historię.',
  },
  {
    id: 'visuals',
    label: 'Język filmowy (kamera + montaż)',
    short: 'Wizualia',
    desc: 'Jak obraz i montaż opowiadają historię: kadry, ruch kamery, rytm scen.',
  },
  {
    id: 'sound',
    label: 'Dźwięk i muzyka',
    short: 'Dźwięk',
    desc: 'Czy dźwięk, cisza i muzyka wzmacniają narrację, a nie tylko ją ilustrują.',
  },
  {
    id: 'world',
    label: 'Świat przedstawiony',
    short: 'Świat',
    desc: 'Czy otoczenie filmu jest spójne, wiarygodne i wspiera opowieść (scenografia, kostiumy, VFX).',
  },
  {
    id: 'impact',
    label: 'Oddziaływanie i sens',
    short: 'Sens',
    desc: 'Co film robi z widzem i co po nim zostaje: emocje, myśli, interpretacje.',
  },
];

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

export function categoryLabel(id) {
  return CATEGORIES.find((c) => c.id === id)?.label || id;
}
