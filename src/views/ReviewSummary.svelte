<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { CheckCircle, ArrowRight, Star, Share2 } from 'lucide-svelte';
  import Button from '../components/Button.svelte';

  // Props otrzymywane z procesu GuidedReview
  export let movieTitle = 'Dune: Part One';
  export let aiSummary = 'Film wywarł silne wrażenie swoją warstwą wizualną i budową świata. Doceniasz grę aktorską, szczególnie w kluczowych scenach emocjonalnych. Zauważasz jednak pewne dłużyzny w narracji, które mogą wpływać na odbiór całości przez mniej cierpliwego widza.';
  export let rating = 8;
  export let detailedRatings = {
      script: 7,
      directing: 9,
      acting: 8,
      visuals: 10,
      sound: 10,
      world: 9,
      impact: 8
  };

  const dispatch = createEventDispatcher();

  // Mapowanie kluczy na polskie etykiety
  const categoriesMap = {
    script: 'Scenariusz',
    directing: 'Reżyseria',
    acting: 'Aktorstwo',
    visuals: 'Wizualia',
    sound: 'Dźwięk',
    world: 'Świat',
    impact: 'Sens'
  };

  onMount(() => {
    window.scrollTo(0, 0);
  });
</script>

<div class="summary-wrapper">
  
  <!-- Header Success Message -->
  <div class="header-section">
    <div class="success-badge">
      <CheckCircle size={28} color="white" />
    </div>
    <div class="header-text">
        <h1>Recenzja gotowa!</h1>
        <p>Oto Twoje podsumowanie filmu <strong>{movieTitle}</strong>.</p>
    </div>
  </div>

  <!-- Notebook Card -->
  <div class="notebook-card">
    <!-- Ozdobne "dziurki" notatnika -->
    <div class="notebook-holes">
        {#each Array(6) as _} <div class="hole"></div> {/each}
    </div>
    
    <div class="notebook-content">
      <div class="note-header">
        <span class="note-label">NOTATKI O FILMIE</span>
        <span class="note-date">{new Date().toLocaleDateString('pl-PL')}</span>
      </div>

      <!-- Tekst notatki na liniach -->
      <div class="lined-paper">
        <p class="handwritten-text">
          {aiSummary}
        </p>
      </div>
      
      <!-- Sekcja Ocen -->
      <div class="divider"></div>

      <div class="ratings-section">
        
        <!-- Ocena Ogólna -->
        <div class="overall-rating">
            <div class="rating-circle">
                <span class="rating-value">{rating}</span>
                <span class="rating-max">/10</span>
            </div>
            <div class="stars-visual">
                {#each Array(5) as _, i}
                    <Star 
                        size={16} 
                        fill={i < Math.round(rating/2) ? "var(--color-primary)" : "#e2e8f0"} 
                        stroke="none" 
                    />
                {/each}
            </div>
            <span class="rating-label">Ocena ogólna</span>
        </div>

        <!-- Oceny Szczegółowe -->
        <div class="detailed-grid">
            {#each Object.entries(detailedRatings) as [key, value]}
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

  <!-- Actions -->
  <div class="actions">
    <Button variant="secondary" size="small" on:click={() => alert('Udostępnianie...')}>
      <Share2 size={18} /> Udostępnij
    </Button>
    <Button size="medium" on:click={() => dispatch('confirm')}>
      Wróć do Dashboardu <ArrowRight size={18} />
    </Button>
  </div>
</div>

<style>
  .summary-wrapper {
    max-width: 600px;
    margin: 0 auto;
    /* Utrzymujemy kompaktowe paddingi kontenera */
    padding: 1.5rem 0.25rem 3rem 0.25rem;
    animation: fadeIn 0.5s ease-out;
  }

  /* Header */
  .header-section {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    padding: 0 0.5rem; 
  }

  .success-badge {
    background: var(--color-primary);
    padding: 0.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 10px rgba(224, 122, 95, 0.3);
  }

  .header-text h1 {
    font-size: 1.5rem; /* Przywrócono większy rozmiar (skalowany globalnie) */
    font-weight: 700;
    margin-bottom: 0.15rem;
  }
  .header-text p { 
    color: var(--color-text-muted); 
    font-size: 1rem; /* Przywrócono standardowy rozmiar */
  }

  /* Notebook Card */
  .notebook-card {
    background: #FFFCF5;
    border: 1px solid #E2E2E2;
    border-radius: 12px;
    position: relative;
    box-shadow: 
        0 1px 1px rgba(0,0,0,0.05), 
        0 10px 25px rgba(0,0,0,0.05);
    overflow: hidden;
    margin-bottom: 1.5rem;
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
    /* Zachowano kompaktowe paddingi */
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
    font-size: 0.75rem; /* Przywrócono lekko większy */
    letter-spacing: 0.1em;
    color: var(--color-primary);
  }

  .note-date {
    font-family: 'Courier New', monospace;
    font-size: 0.85rem; 
    color: var(--color-text-muted);
  }

  /* Lined Paper Effect */
  .lined-paper {
    background-image: linear-gradient(#E5E5E5 1px, transparent 1px);
    background-size: 100% 1.8rem; /* Nieco luźniejsze linie dla czytelności */
    line-height: 1.8rem;
    margin-bottom: 1.5rem;
  }

  .handwritten-text {
    font-family: 'Inter', sans-serif;
    font-size: 1.05rem; /* Powrót do czytelnego rozmiaru (global CSS zmniejszy to do ok 14.7px) */
    color: var(--color-text-main);
    margin: 0;
    padding-top: 0.35rem; 
  }

  .divider {
    border-top: 2px dashed #E2E2E2;
    margin: 0 -1rem 1.5rem -2.2rem;
  }

  /* Ratings Section */
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
    font-size: 3rem; /* Przywrócono wielkość */
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
    font-size: 0.9rem; /* Przywrócono standard */
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

  .actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
    padding: 0 0.5rem;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>