<script>
  import { createEventDispatcher } from 'svelte';
  import { Plus, Calendar, Star, Image as ImageIcon } from 'lucide-svelte';
  import Button from '../components/Button.svelte';

  const dispatch = createEventDispatcher();

  // Mock Data
  let reviews = [
    { 
      id: 1, 
      title: 'Dune: Part One', 
      preview: 'Wizualnie oszałamiające dzieło. Villeneuve doskonale oddał skalę...', 
      date: '15.01.2025',
      year: '2021',
      rating: 9,
      poster: null 
    },
    { 
      id: 2, 
      title: 'The Matrix', 
      preview: 'Rewolucyjny film. Nawet po latach efekty robią wrażenie...', 
      date: '10.01.2025',
      year: '1999',
      rating: 10,
      poster: null
    },
    { 
      id: 3, 
      title: 'Glass Onion', 
      preview: 'Zabawny, ale pierwsza część była zdecydowanie lepsza...', 
      date: '05.01.2025',
      year: '2022',
      rating: 7,
      poster: null
    }
  ];
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
    
    <div class="reviews-list">
      {#each reviews as review}
        <div class="review-row" on:click={() => dispatch('view', review.id)}>
          <!-- Plakat / Placeholder -->
          <div class="poster-thumb">
            {#if review.poster}
              <img src={review.poster} alt={review.title} />
            {:else}
              <ImageIcon size={24} color="var(--color-text-muted)" />
            {/if}
          </div>

          <!-- Treść -->
          <div class="review-content">
            <div class="review-header">
              <span class="review-title">{review.title}</span>
              <span class="review-year">({review.year})</span>
            </div>
            <p class="review-preview">{review.preview}</p>
            <div class="review-meta">
              <span class="meta-date"><Calendar size={12} /> {review.date}</span>
            </div>
          </div>

          <!-- Ocena -->
          <div class="review-rating">
            <div class="rating-badge">
              <Star size={14} fill="white" stroke="none" />
              <span>{review.rating}/10</span>
            </div>
          </div>
        </div>
      {/each}
    </div>
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