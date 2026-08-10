<script>
  import { createEventDispatcher } from 'svelte';
  import { Search as SearchIcon, ArrowLeft, Image, ChevronRight, Film } from 'lucide-svelte';
  import Button from '../components/Button.svelte';
  import Input from '../components/Input.svelte';

  const dispatch = createEventDispatcher();
  
  let query = '';
  let results = [];
  let hasSearched = false;

  function handleSearch() {
    if (!query) {
        results = [];
        hasSearched = false;
        return;
    }
    
    // Mock simulation
    hasSearched = true;
    if (query.toLowerCase().includes('dune')) {
        results = [
            { id: 1, title: 'Dune: Part One', year: '2021', type: 'Film', director: 'Denis Villeneuve' },
            { id: 2, title: 'Dune', year: '1984', type: 'Film', director: 'David Lynch' }
        ];
    } else {
        results = [];
    }
  }
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
      on:input={handleSearch}
    >
      <SearchIcon size={20} slot="icon" />
    </Input>
  </div>

  {#if !hasSearched && !query}
    <div class="search-hint">
      <Film size={48} class="hint-icon" />
      <p>Zacznij wpisywać tytuł, aby zobaczyć propozycje.</p>
    </div>
  {:else if hasSearched && results.length === 0}
    <div class="search-hint">
      <p>Brak wyników dla "{query}"</p>
    </div>
  {:else}
    <div class="results-label">Wyniki wyszukiwania</div>
    <div class="results-list">
      {#each results as result}
        <div class="result-item">
          <div class="poster-placeholder">
            <Image size={24} />
          </div>
          
          <div class="info">
            <div class="result-title">{result.title}</div>
            <div class="result-meta">{result.type} • {result.year} • {result.director}</div>
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
  }

  .info { flex: 1; }

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