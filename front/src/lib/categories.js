import { api } from './api.js';

/**
 * Kategorie ocen pochodzą z backendu, żeby etykiety nie rozjechały się z promptami AI.
 * Pobieramy je raz na sesję — kolejni odbiorcy dostają ten sam promise.
 */
let pending = null;

export function loadCategories() {
  if (!pending) {
    pending = api
      .categories()
      .then((r) => r.categories)
      .catch((err) => {
        pending = null; // pozwól spróbować ponownie przy następnym wejściu w widok
        throw err;
      });
  }
  return pending;
}

/** Mapa id -> krótka etykieta, używana na kartach recenzji. */
export async function loadShortLabels() {
  const categories = await loadCategories();
  return Object.fromEntries(categories.map((c) => [c.id, c.short]));
}
