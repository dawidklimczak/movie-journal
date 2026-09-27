<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { Plus, Calendar, Star, Image as ImageIcon, Loader2 } from 'lucide-svelte';
  import Button from '../components/Button.svelte';
  import { api, formatDate } from '../lib/api.js';

  const dispatch = createEventDispatcher();

  const PREVIEW_LIMIT = 3;

  let reviews = [];
  let isLoading = true;
  let error = null;

  onMount(load);

  async function load() {
    isLoading = true;
    error = null;
    try {
      const data = await api.listReviews(PREVIEW_LIMIT);
      reviews = data.reviews;
    } catch (err) {
      error = err.message;
    } finally {
      isLoading = false;
    }
  }

  function open(id) {
    dispatch('view', id);
  }
</script>

<div class="dashboard-wrapper">
  <!-- Sekcja CTA (Hero) -->
  <div class="cta-section">
    <div class="cta-content">
      <h2>Co ostatnio obejrzałeś?</h2>
      <p>Nie pozwól, by wrażenia uciekły. Zapisz szybką recenzję w 5 minut.</p>
      <div class="cta-actions">
        <Button size="large" on:click={() => dispatch('add')}>
          <Plus size={20} />
          Dodaj recenzję
        </Button>
      </div>
    </div>
  </div>

  <!-- Sekcja Historii -->
  <div class="history-section">
    <div class="section-header">
      <h3>Twoja historia</h3>
      <button class="see-all-btn" on:click={() => dispatch('seeAll')}>
        Zobacz wszystkie
      </button>
    </div>
    
    {#if isLoading}
      <div class="state-box">
        <Loader2 size={28} class="spinner" />
        <p>Wczytuję recenzje...</p>
      </div>
    {:else if error}
      <div class="state-box error">
        <p>{error}</p>
        <Button variant="secondary" size="small" on:click={load}>Spróbuj ponownie</Button>
      </div>
    {:else if reviews.length === 0}
      <div class="state-box">
        <p>Nie masz jeszcze żadnej recenzji. Pierwsza zajmie Ci około pięciu minut.</p>
      </div>
    {:else}
      <div class="reviews-list">
        {#each reviews as review (review.id)}
          <div
            class="review-row"
            role="button"
            tabindex="0"
            on:click={() => open(review.id)}
            on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), open(review.id))}
          >
            <!-- Plakat / Placeholder -->
            <div class="poster-thumb">
              {#if review.movie.posterUrl}
                <img src={review.movie.posterUrl} alt="Plakat: {review.movie.title}" loading="lazy" />
              {:else}
                <ImageIcon size={24} color="var(--color-text-muted)" />
              {/if}
            </div>

            <!-- Treść -->
            <div class="review-content">
              <div class="review-header">
                <span class="review-title">{review.movie.title}</span>
                {#if review.movie.year}
                  <span class="review-year">({review.movie.year})</span>
                {/if}
              </div>
              <p class="review-preview">{review.aiSummary}</p>
              <div class="review-meta">
                <span class="meta-date"><Calendar size={12} /> {formatDate(review.createdAt)}</span>
              </div>
            </div>

            <!-- Ocena -->
            <div class="review-rating">
              <div class="rating-badge">
                <Star size={14} fill="white" stroke="none" />
                <span>{review.overallRating}/10</span>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .dashboard-wrapper {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 0.5rem; /* Dodany minimalny padding dla całego kontenera */
  }

  /* CTA Section */
  .cta-section {
    background: linear-gradient(135deg, var(--color-surface) 0%, #FFF5F2 100%);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: 3rem 1rem; /* Zmniejszony padding boczny dla mobile */
    text-align: center;
    margin-bottom: 3rem;
    box-shadow: var(--shadow-sm);
  }

  .cta-content h2 {
    font-size: 2rem; /* Trochę mniejszy font na mobile */
    font-weight: 700;
    margin-bottom: 1rem;
    color: var(--color-text-main);
  }

  .cta-content p {
    font-size: 1rem;
    color: var(--color-text-muted);
    margin-bottom: 2rem;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }

  /* History Section */
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 1rem;
    padding: 0 0.25rem;
  }

  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
  }

  .see-all-btn {
    background: none;
    border: none;
    color: var(--color-primary);
    font-weight: 500;
    font-size: 0.9rem;
    cursor: pointer;
    padding: 0.5rem;
  }
  .see-all-btn:hover { text-decoration: underline; }

  .reviews-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .state-box {
    background: var(--color-surface);
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-md);
    padding: 2.5rem 1.5rem;
    text-align: center;
    color: var(--color-text-muted);
  }
  .state-box p { margin: 0 0 0.5rem; }
  .state-box.error { color: var(--color-error); border-color: var(--color-error); }
  .state-box :global(.spinner) { color: var(--color-primary); margin-bottom: 0.75rem; }

  .review-row:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  .review-row {
    display: flex;
    align-items: center;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 1rem;
    transition: all 0.2s ease;
    cursor: pointer;
    gap: 1rem; /* Zmniejszony gap */
  }

  .review-row:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: var(--color-primary);
  }

  .poster-thumb {
    width: 60px;
    height: 90px;
    background: var(--color-bg);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
  }
  
  .poster-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .review-content {
    flex: 1;
    min-width: 0; 
  }

  .review-header {
    display: flex;
    flex-wrap: wrap; /* Pozwala zawijać tytuł na bardzo małych ekranach */
    align-items: baseline;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .review-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem; /* Zmniejszony lekko */
    font-weight: 600;
    color: var(--color-text-main);
  }

  .review-year {
    color: var(--color-text-muted);
    font-size: 0.85rem;
  }

  .review-preview {
    font-size: 0.9rem;
    color: var(--color-text-muted);
    margin-bottom: 0.5rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .review-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.8rem;
    color: var(--color-text-muted);
  }

  .meta-date {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .review-rating {
    flex-shrink: 0;
  }

  .rating-badge {
    background: var(--color-primary);
    color: white;
    padding: 0.25rem 0.6rem;
    border-radius: var(--radius-full);
    font-weight: 600;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
</style>