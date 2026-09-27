<script>
    import { createEventDispatcher, onMount } from 'svelte';
    import { ArrowLeft, Search, Filter, ArrowUpDown, Star, Calendar, Image as ImageIcon, Loader2 } from 'lucide-svelte';
    import Button from '../components/Button.svelte';
    import Input from '../components/Input.svelte';
    import { api, formatDate } from '../lib/api.js';

    const dispatch = createEventDispatcher();

    let allReviews = [];
    let isLoading = true;
    let error = null;

    // State
    let searchQuery = '';
    let sortBy = 'date'; // 'date', 'rating', 'title'
    let sortOrder = 'desc'; // 'asc', 'desc'
    let selectedGenre = 'all';

    onMount(load);

    async function load() {
      isLoading = true;
      error = null;
      try {
        const data = await api.listReviews();
        allReviews = data.reviews;
      } catch (err) {
        error = err.message;
      } finally {
        isLoading = false;
      }
    }

    // Gatunki obecne w kolekcji (TMDB nie zawsze go zwraca, stąd filtr na null)
    $: genres = [...new Set(allReviews.map(r => r.movie.genre).filter(Boolean))].sort();

    /** Klucz sortowania sprowadzony do wartości porównywalnej operatorami < / >. */
    function sortKey(review) {
      if (sortBy === 'rating') return review.overallRating;
      if (sortBy === 'title') return review.movie.title.toLocaleLowerCase('pl-PL');
      return review.createdAt; // ISO sortuje się leksykograficznie
    }

    $: filteredReviews = allReviews
      .filter(r => {
        const matchesSearch = r.movie.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGenre = selectedGenre === 'all' || r.movie.genre === selectedGenre;
        return matchesSearch && matchesGenre;
      })
      .sort((a, b) => {
        const valA = sortKey(a);
        const valB = sortKey(b);
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

    function toggleSortOrder() {
      sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    }

    function open(id) {
      dispatch('view', id);
    }
  </script>
  
  <div class="all-reviews-wrapper">
    
    <!-- Header -->
    <div class="header-bar">
      <Button variant="ghost" size="small" on:click={() => dispatch('back')}>
        <ArrowLeft size={18} /> Wróć
      </Button>
      <h2>Historia ocen</h2>
      <div style="width: 24px;"></div> <!-- Spacer -->
    </div>
  
    <!-- Controls Section -->
    <div class="controls-section">
      <!-- Search -->
      <div class="search-row">
        <Input placeholder="Szukaj tytułu..." bind:value={searchQuery}>
          <Search size={18} slot="icon" />
        </Input>
      </div>
  
      <!-- Filters Row -->
      <div class="filters-row">
        
        <!-- Sort Select -->
        <div class="control-group">
          <ArrowUpDown size={16} class="control-icon" />
          <select bind:value={sortBy}>
            <option value="date">Data dodania</option>
            <option value="rating">Ocena</option>
            <option value="title">Tytuł</option>
          </select>
          <button class="sort-order-btn" on:click={toggleSortOrder} title="Zmień kolejność">
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
  
        <!-- Genre Select -->
        <div class="control-group">
          <Filter size={16} class="control-icon" />
          <select bind:value={selectedGenre}>
            <option value="all">Wszystkie gatunki</option>
            {#each genres as genre}
              <option value={genre}>{genre}</option>
            {/each}
          </select>
        </div>
  
      </div>
    </div>
  
    <!-- List Section -->
    <div class="reviews-list">
      {#if isLoading}
        <div class="empty-state">
          <Loader2 size={28} class="spinner" />
          <p>Wczytuję kolekcję...</p>
        </div>
      {:else if error}
        <div class="empty-state error">
          <p>{error}</p>
          <Button variant="secondary" size="small" on:click={load}>Spróbuj ponownie</Button>
        </div>
      {:else}
        <div class="list-meta">
          Znaleziono: {filteredReviews.length}
        </div>

        {#if filteredReviews.length === 0}
          <div class="empty-state">
            <p>
              {allReviews.length === 0
                ? 'Nie masz jeszcze żadnej recenzji.'
                : 'Brak wyników spełniających kryteria.'}
            </p>
            {#if allReviews.length > 0}
              <Button variant="ghost" size="small" on:click={() => {searchQuery=''; selectedGenre='all';}}>Wyczyść filtry</Button>
            {/if}
          </div>
        {:else}
          {#each filteredReviews as review (review.id)}
            <div
              class="review-row"
              role="button"
              tabindex="0"
              on:click={() => open(review.id)}
              on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), open(review.id))}
            >
              <!-- Poster Thumbnail -->
              <div class="poster-thumb">
                {#if review.movie.posterUrl}
                  <img src={review.movie.posterUrl} alt="Plakat: {review.movie.title}" loading="lazy" />
                {:else}
                  <ImageIcon size={20} color="var(--color-text-muted)" />
                {/if}
              </div>

              <!-- Content -->
              <div class="review-content">
                <div class="review-main-info">
                  <span class="review-title">{review.movie.title}</span>
                  {#if review.movie.year}
                    <span class="review-year">({review.movie.year})</span>
                  {/if}
                </div>
                <div class="review-sub-info">
                  {#if review.movie.genre}
                    <span class="genre-tag">{review.movie.genre}</span>
                  {/if}
                  <span class="date-tag"><Calendar size={12} /> {formatDate(review.createdAt)}</span>
                </div>
              </div>

              <!-- Rating -->
              <div class="review-rating">
                <div class="rating-badge" class:high-score={review.overallRating >= 8} class:mid-score={review.overallRating < 8 && review.overallRating >= 5}>
                  <Star size={12} fill="white" stroke="none" />
                  <span>{review.overallRating}</span>
                </div>
              </div>
            </div>
          {/each}
        {/if}
      {/if}
    </div>
  </div>
  
  <style>
    .all-reviews-wrapper {
      max-width: 800px;
      margin: 0 auto;
      /* Spójny padding */
      padding: 0 0.5rem 4rem 0.5rem;
      animation: fadeIn 0.3s ease-out;
    }
  
    /* Header */
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-top: 1rem;
    }
    .header-bar h2 {
      font-size: 1.25rem;
      font-weight: 700;
    }
  
    /* Controls */
    .controls-section {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 1rem;
      margin-bottom: 1.5rem;
      box-shadow: var(--shadow-sm);
    }
  
    .search-row { margin-bottom: 1rem; }
  
    .filters-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }
  
    .control-group {
      display: flex;
      align-items: center;
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 0 0.5rem;
      position: relative;
    }
  
    .control-icon {
      color: var(--color-text-muted);
      flex-shrink: 0;
    }
  
    select {
      width: 100%;
      border: none;
      background: transparent;
      padding: 0.6rem 0.5rem;
      font-family: inherit;
      font-size: 0.9rem;
      color: var(--color-text-main);
      outline: none;
      cursor: pointer;
      appearance: none; /* Ukrywa domyślną strzałkę systemową, można dodać własną */
    }
  
    .sort-order-btn {
      border: none;
      background: rgba(0,0,0,0.05);
      border-radius: 4px;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--color-text-main);
      font-weight: bold;
      margin-left: 2px;
    }
  
    /* List */
    .list-meta {
      font-size: 0.85rem;
      color: var(--color-text-muted);
      margin-bottom: 0.75rem;
      padding-left: 0.25rem;
    }
  
    .reviews-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
  
    .review-row {
      display: flex;
      align-items: center;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 0.75rem;
      gap: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .review-row:hover {
      transform: translateY(-2px);
      border-color: var(--color-primary);
      box-shadow: var(--shadow-sm);
    }
  
    .poster-thumb {
      width: 40px;
      height: 60px;
      background: var(--color-bg);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      overflow: hidden;
    }
    .poster-thumb img { width: 100%; height: 100%; object-fit: cover; }
  
    .review-content {
      flex: 1;
      min-width: 0;
    }
  
    .review-main-info {
      margin-bottom: 0.25rem;
      line-height: 1.2;
    }
  
    .review-title {
      font-family: 'Playfair Display', serif;
      font-weight: 600;
      font-size: 1rem;
      color: var(--color-text-main);
    }
  
    .review-year {
      font-size: 0.85rem;
      color: var(--color-text-muted);
    }
  
    .review-sub-info {
      display: flex;
      gap: 0.75rem;
      font-size: 0.75rem;
      color: var(--color-text-muted);
      align-items: center;
    }
  
    .genre-tag {
      background: var(--color-bg);
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 500;
    }
    
    .date-tag {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
  
    .review-rating { flex-shrink: 0; }
  
    .rating-badge {
      background: #94A3B8; /* Default grey */
      color: white;
      padding: 0.25rem 0.6rem;
      border-radius: var(--radius-full);
      font-weight: 600;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
  
    .rating-badge.high-score { background: var(--color-primary); } /* >= 8 */
    .rating-badge.mid-score { background: #EAB308; } /* 5-7 */
  
    .empty-state {
      text-align: center;
      padding: 3rem;
      color: var(--color-text-muted);
    }
    .empty-state.error { color: var(--color-error); }
    .empty-state :global(.spinner) { color: var(--color-primary); margin-bottom: 0.75rem; }

    .review-row:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
  
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  
    @media (max-width: 480px) {
      .filters-row {
        grid-template-columns: 1fr; /* Stack filters on very small screens */
      }
    }
  </style>