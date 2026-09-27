<script>
  import { createEventDispatcher, onDestroy } from 'svelte';
  import { Search as SearchIcon, ArrowLeft, Image, ChevronRight, Film, Loader2 } from 'lucide-svelte';
  import Button from '../components/Button.svelte';
  import Input from '../components/Input.svelte';
  import { api } from '../lib/api.js';

  const dispatch = createEventDispatcher();

  const DEBOUNCE_MS = 350;
  const MIN_QUERY = 2;

  let query = '';
  let results = [];
  let hasSearched = false;
  let isLoading = false;
  let error = null;

  let debounceTimer;
  let inFlight; // AbortController ostatniego zapytania

  function handleInput() {
    clearTimeout(debounceTimer);
    inFlight?.abort();

    if (query.trim().length < MIN_QUERY) {
      results = [];
      hasSearched = false;
      isLoading = false;
      error = null;
      return;
    }

    isLoading = true;
    error = null;
    debounceTimer = setTimeout(runSearch, DEBOUNCE_MS);
  }

  async function runSearch() {
    const controller = new AbortController();
    inFlight = controller;
    const searched = query.trim();

    try {
      const data = await api.searchMovies(searched, controller.signal);
      // Ignoruj odpowiedź, jeśli w międzyczasie poleciało nowsze zapytanie.
      if (inFlight !== controller) return;
      results = data.results;
      hasSearched = true;
    } catch (err) {
      if (err.name === 'AbortError' || inFlight !== controller) return;
      error = err.message;
      results = [];
      hasSearched = true;
    } finally {
      if (inFlight === controller) isLoading = false;
    }
  }

  onDestroy(() => {
    clearTimeout(debounceTimer);
    inFlight?.abort();
  });
</script>

<div class="search-view">
  <div class="back-btn-wrapper">
    <Button variant="ghost" size="small" on:click={() => dispatch('back')}>
      <ArrowLeft size={16} /> Wróć
    </Button>
  </div>

  <h2>Znajdź film</h2>
  
  <div class="search-input-container">
    <Input
      placeholder="Wpisz tytuł (np. 'Dune', 'Blade Runner')..."
      bind:value={query}
      on:input={handleInput}
    >
      <SearchIcon size={20} slot="icon" />
    </Input>
  </div>

  {#if isLoading}
    <div class="search-hint">
      <Loader2 size={32} class="spinner" />
      <p>Szukam w bazie filmów...</p>
    </div>
  {:else if error}
    <div class="search-hint error">
      <p>{error}</p>
      <Button variant="secondary" size="small" on:click={runSearch}>Spróbuj ponownie</Button>
    </div>
  {:else if !hasSearched}
    <div class="search-hint">
      <Film size={48} class="hint-icon" />
      <p>Zacznij wpisywać tytuł, aby zobaczyć propozycje.</p>
    </div>
  {:else if results.length === 0}
    <div class="search-hint">
      <p>Brak wyników dla "{query}"</p>
    </div>
  {:else}
    <div class="results-label">Wyniki wyszukiwania</div>
    <div class="results-list">
      {#each results as result (result.tmdbId)}
        <div class="result-item">
          <div class="poster-placeholder">
            {#if result.posterUrl}
              <img src={result.posterUrl} alt="Plakat: {result.title}" loading="lazy" />
            {:else}
              <Image size={24} />
            {/if}
          </div>

          <div class="info">
            <div class="result-title">{result.title}</div>
            <div class="result-meta">
              {[result.year, result.director].filter(Boolean).join(' • ') || 'Brak danych'}
            </div>
          </div>

          <Button variant="secondary" size="small" on:click={() => dispatch('select', result)}>
            Recenzuj
            <ChevronRight size={16} />
          </Button>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .search-view {
    max-width: 700px;
    margin: 0 auto;
  }

  .back-btn-wrapper { margin-bottom: 1rem; }

  h2 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 2rem;
  }

  .search-input-container { margin-bottom: 2.5rem; }

  .search-hint {
    text-align: center;
    color: var(--color-text-muted);
    padding: 3rem;
  }

  :global(.hint-icon) {
    opacity: 0.2;
    margin-bottom: 1rem;
  }

  .search-hint.error { color: var(--color-error); }
  .search-hint.error p { margin-bottom: 1rem; }

  .search-hint :global(.spinner) {
    color: var(--color-primary);
    margin-bottom: 1rem;
  }

  .results-label {
    margin-bottom: 1rem;
    font-size: 0.875rem;
    color: var(--color-text-muted);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .result-item {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    margin-bottom: 1rem;
    transition: background 0.2s;
    align-items: center;
  }

  .result-item:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-sm);
  }

  .poster-placeholder {
    width: 64px;
    height: 96px;
    background: #F1F5F9;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94A3B8;
    flex-shrink: 0;
    overflow: hidden;
  }

  .poster-placeholder img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .info { flex: 1; min-width: 0; }

  .result-title {
    font-family: 'Playfair Display', serif;
    font-weight: 600;
    font-size: 1.25rem;
  }

  .result-meta {
    color: var(--color-text-muted);
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }
</style>