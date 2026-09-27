<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { ArrowLeft, Calendar, Tag, Share2, Trash2, Star, User, Loader2 } from 'lucide-svelte';
  import Button from '../components/Button.svelte';
  import { api, formatDate } from '../lib/api.js';
  import { loadShortLabels } from '../lib/categories.js';

  export let reviewId;
  const dispatch = createEventDispatcher();

  let review = null;
  let isLoading = true;
  let error = null;
  let isDeleting = false;
  let categoriesMap = {};

  onMount(() => {
    loadShortLabels()
      .then((map) => (categoriesMap = map))
      .catch(() => {});
    return load();
  });

  async function load() {
    isLoading = true;
    error = null;
    try {
      review = await api.getReview(reviewId);
    } catch (err) {
      error = err.message;
    } finally {
      isLoading = false;
    }
  }

  async function remove() {
    if (!confirm(`Usunąć recenzję filmu "${review.movie.title}"? Tej operacji nie da się cofnąć.`)) return;

    isDeleting = true;
    try {
      await api.deleteReview(review.id);
      dispatch('deleted', review.id);
    } catch (err) {
      error = err.message;
      isDeleting = false;
    }
  }

  async function share() {
    const text = `${review.movie.title} — ${review.overallRating}/10\n\n${review.aiSummary}`;
    if (navigator.share) {
      await navigator.share({ title: review.movie.title, text }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(text);
      alert('Skopiowano recenzję do schowka.');
    }
  }
</script>

<div class="detail-container">
  <!-- Navigation -->
  <div class="nav-bar">
    <Button variant="ghost" size="small" on:click={() => dispatch('back')}>
      <ArrowLeft size={16} /> Wróć
    </Button>
    
    {#if review}
      <div class="actions">
        <Button variant="ghost" size="small" on:click={share}>
          <Share2 size={18} />
        </Button>
        <Button variant="ghost" size="small" style="color: var(--color-error)" disabled={isDeleting} on:click={remove}>
          <Trash2 size={18} />
        </Button>
      </div>
    {/if}
  </div>

  {#if isLoading}
    <div class="state-box">
      <Loader2 size={28} class="spinner" />
      <p>Wczytuję recenzję...</p>
    </div>
  {:else if error && !review}
    <div class="state-box error">
      <p>{error}</p>
      <Button variant="secondary" size="small" on:click={load}>Spróbuj ponownie</Button>
    </div>
  {:else if review}
  {#if error}
    <p class="inline-error">{error}</p>
  {/if}

  <!-- Movie Header -->
  <header class="movie-header">
    <h1>{review.movie.title}</h1>
    <div class="meta-row">
      <span class="meta-item"><Calendar size={14} /> {formatDate(review.createdAt)}</span>
      {#if review.movie.year}
        <span class="meta-item"><Tag size={14} /> {review.movie.year}</span>
      {/if}
      {#if review.movie.director}
        <span class="meta-item"><User size={14} /> {review.movie.director}</span>
      {/if}
    </div>
  </header>

  <!-- Notebook Card (Spójny styl z Summary) -->
  <div class="notebook-card">
    <div class="notebook-holes">
        {#each Array(6) as _} <div class="hole"></div> {/each}
    </div>
    
    <div class="notebook-content">
      <div class="note-header">
        <span class="note-label">NOTATKI O FILMIE</span>
      </div>

      <!-- Tekst notatki na liniach -->
      <div class="lined-paper">
        <p class="handwritten-text">
          {review.aiSummary}
        </p>
      </div>
      
      <div class="divider"></div>

      <!-- Sekcja Ocen -->
      <div class="ratings-section">
        
        <!-- Ocena Ogólna -->
        <div class="overall-rating">
            <div class="rating-circle">
                <span class="rating-value">{review.overallRating}</span>
                <span class="rating-max">/10</span>
            </div>
            <div class="stars-visual">
                {#each Array(5) as _, i}
                    <Star
                        size={14}
                        fill={i < Math.round(review.overallRating/2) ? "var(--color-primary)" : "#e2e8f0"}
                        stroke="none"
                    />
                {/each}
            </div>
            <span class="rating-label">Ocena ogólna</span>
        </div>

        <!-- Oceny Szczegółowe -->
        <div class="detailed-grid">
            {#each Object.entries(review.detailedRatings) as [key, value]}
                {#if categoriesMap[key]}
                    <div class="detail-row">
                        <span class="detail-label">{categoriesMap[key]}</span>
                        <div class="bar-container">
                            <div class="bar-fill" style="width: {value * 10}%"></div>
                        </div>
                        <span class="detail-score">{value}</span>
                    </div>
                {/if}
            {/each}
        </div>
      </div>

    </div>
  </div>
  {/if}
</div>

<style>
  .detail-container {
    max-width: 600px;
    margin: 0 auto;
    /* Spójny, kompaktowy padding */
    padding: 0 0.25rem 4rem 0.25rem;
    animation: fadeIn 0.3s ease-out;
  }

  .nav-bar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    padding: 0 0.5rem;
  }

  .actions { display: flex; gap: 0.5rem; }

  .state-box {
    background: var(--color-surface);
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-md);
    padding: 3rem 1.5rem;
    text-align: center;
    color: var(--color-text-muted);
  }
  .state-box p { margin: 0 0 0.5rem; }
  .state-box.error { color: var(--color-error); border-color: var(--color-error); }
  .state-box :global(.spinner) { color: var(--color-primary); margin-bottom: 0.75rem; }

  .inline-error {
    color: var(--color-error);
    font-size: 0.9rem;
    padding: 0 0.5rem;
    margin-bottom: 1rem;
  }

  /* Movie Header */
  .movie-header {
    margin-bottom: 1.5rem;
    padding: 0 0.5rem;
  }

  h1 { 
    font-size: 2rem; 
    font-weight: 700;
    margin-bottom: 0.5rem; 
    line-height: 1.1;
  }

  .meta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    color: var(--color-text-muted);
    font-size: 0.85rem;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  /* --- Notebook Style (Skopiowane i dopasowane z ReviewSummary) --- */
  .notebook-card {
    background: #FFFCF5;
    border: 1px solid #E2E2E2;
    border-radius: 12px;
    position: relative;
    box-shadow: 
        0 1px 1px rgba(0,0,0,0.05), 
        0 10px 25px rgba(0,0,0,0.05);
    overflow: hidden;
    margin-bottom: 2rem;
  }

  .notebook-holes {
    position: absolute;
    left: 8px;
    top: 0;
    bottom: 0;
    width: 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    padding: 1rem 0;
    z-index: 2;
  }
  .hole {
    width: 10px;
    height: 10px;
    background: var(--color-bg);
    border-radius: 50%;
    box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);
  }

  .notebook-content {
    padding: 1.5rem 1rem 1.5rem 2.2rem; 
  }

  .note-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
    border-bottom: 2px solid var(--color-primary);
    padding-bottom: 0.4rem;
  }

  .note-label {
    font-family: 'Inter', sans-serif;
    font-weight: 700;
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    color: var(--color-primary);
  }

  /* Lined Paper */
  .lined-paper {
    background-image: linear-gradient(#E5E5E5 1px, transparent 1px);
    background-size: 100% 1.8rem;
    line-height: 1.8rem;
    margin-bottom: 1.5rem;
  }

  .handwritten-text {
    font-family: 'Inter', sans-serif;
    font-size: 1.05rem; 
    color: var(--color-text-main);
    margin: 0;
    padding-top: 0.35rem; 
  }

  .divider {
    border-top: 2px dashed #E2E2E2;
    margin: 0 -1rem 1.5rem -2.2rem;
  }

  /* Ratings */
  .ratings-section {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  @media(min-width: 500px) {
    .ratings-section { grid-template-columns: auto 1fr; }
  }

  .overall-rating {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-right: 1rem;
    border-right: 1px solid transparent;
  }
  @media(min-width: 500px) {
    .overall-rating { border-right-color: #E2E2E2; }
  }

  .rating-circle {
    position: relative;
    margin-bottom: 0.25rem;
  }
  .rating-value {
    font-family: 'Playfair Display', serif;
    font-size: 3rem;
    font-weight: 700;
    color: var(--color-text-main);
    line-height: 1;
  }
  .rating-max {
    font-size: 0.9rem;
    color: var(--color-text-muted);
    position: absolute;
    top: 0.4rem;
    right: -1rem;
  }
  
  .stars-visual {
    display: flex;
    gap: 2px;
    margin-bottom: 0.25rem;
  }
  
  .rating-label {
    font-size: 0.7rem;
    text-transform: uppercase;
    color: var(--color-text-muted);
    letter-spacing: 0.05em;
  }

  .detailed-grid {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    justify-content: center;
  }

  .detail-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
  }

  .detail-label {
    width: 75px;
    color: var(--color-text-muted);
    font-weight: 500;
  }

  .bar-container {
    flex: 1;
    height: 6px;
    background: #EBEBEB;
    border-radius: 3px;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    background: var(--color-primary);
    border-radius: 3px;
  }

  .detail-score {
    width: 18px;
    text-align: right;
    font-weight: 600;
    color: var(--color-text-main);
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>