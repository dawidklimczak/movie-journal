<script>
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import { ArrowLeft, MessageSquare, Star, Send, Check, Loader2, RotateCcw } from 'lucide-svelte';
  import Button from '../components/Button.svelte';
  import { api } from '../lib/api.js';
  import { loadCategories } from '../lib/categories.js';

  /** Obiekt filmu z wyszukiwarki: { tmdbId, title, year, director, genre, posterUrl }. */
  export let movie;

  const dispatch = createEventDispatcher();

  let step = 1; // 1: oceny, 2: rozmowa
  $: movieTitle = movie?.title ?? '';

  // --- KROK 1: OCENY ---
  let overallRating = 5;
  let categories = [];
  let detailedRatings = {};
  let categoriesError = null;

  onMount(async () => {
    try {
      categories = await loadCategories();
      detailedRatings = Object.fromEntries(categories.map((c) => [c.id, 5]));
    } catch (err) {
      categoriesError = err.message;
    }
  });

  // --- KROK 2: ROZMOWA ---
  let chatContainer;
  let chatInput = '';
  let textareaRef;
  let isTyping = false;
  let messages = [];
  let isFinalQuestion = false;
  let chatError = null;
  let isSaving = false;

  /** Payload wspólny dla /api/chat/next i zapisu recenzji. */
  function reviewPayload() {
    return { movie, overallRating, detailedRatings, messages };
  }

  async function scrollToBottom() {
    await tick();
    chatContainer?.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });
  }

  /** Woła AI o kolejne pytanie na podstawie całej dotychczasowej rozmowy. */
  async function requestAiTurn() {
    isTyping = true;
    chatError = null;
    scrollToBottom();

    try {
      const reply = await api.nextChatMessage(reviewPayload());
      messages = [...messages, { role: 'ai', text: reply.message }];
      isFinalQuestion = reply.isFinal;
    } catch (err) {
      chatError = err.message;
    } finally {
      isTyping = false;
      scrollToBottom();
    }
  }

  function goToChat() {
    step = 2;
    requestAiTurn();
  }

  function resizeTextarea() {
    if (textareaRef) {
      textareaRef.style.height = 'auto';
      textareaRef.style.height = `${textareaRef.scrollHeight}px`;
    }
  }

  async function addUserMessage() {
    if (!chatInput.trim() || isTyping) return;

    isFinalQuestion = false;
    messages = [...messages, { role: 'user', text: chatInput.trim() }];
    chatInput = '';

    await tick();
    if (textareaRef) textareaRef.style.height = 'auto';
    scrollToBottom();

    await requestAiTurn();
  }

  function handleKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addUserMessage();
    }
  }

  async function finishReview() {
    if (isSaving) return;
    isSaving = true;
    chatError = null;

    try {
      const saved = await api.createReview(reviewPayload());
      dispatch('finish', saved);
    } catch (err) {
      chatError = err.message;
      isSaving = false;
    }
  }
</script>

<div class="guided-wrapper">
  
  <div class="header-bar">
    {#if step === 1}
      <Button variant="ghost" size="small" on:click={() => dispatch('back')}>
        <ArrowLeft size={18} /> Anuluj
      </Button>
    {:else}
       <div class="chat-header-info">
          <span class="chat-title">Rozmowa o filmie</span>
          <span class="chat-subtitle">{movieTitle}</span>
       </div>
       <!-- Rozmowę można zamknąć w każdej chwili, nie tylko gdy AI sama zaproponuje koniec. -->
       <Button variant="ghost" size="small" disabled={isSaving || isTyping} on:click={finishReview}>
         Zakończ
       </Button>
    {/if}
  </div>

  {#if step === 1}
    <div class="step-content ratings-step">
      <h2 class="movie-title">{movieTitle}</h2>
      <p class="step-desc">Krok 1/2: Twoja ocena</p>
      <div class="overall-rating-card">
        <label>Ocena ogólna</label>
        <div class="rating-display">
          <Star size={32} fill="var(--color-primary)" stroke="none" />
          <span class="score">{overallRating}</span>
          <span class="scale">/10</span>
        </div>
        <input type="range" min="1" max="10" bind:value={overallRating} class="rating-slider">
      </div>
      <div class="detailed-ratings">
        <h3>Szczegóły (opcjonalne)</h3>
        {#if categoriesError}
          <p class="inline-error">Nie udało się pobrać kategorii ocen: {categoriesError}</p>
        {:else if categories.length === 0}
          <p class="cat-desc">Wczytuję kategorie...</p>
        {:else}
          {#each categories as cat}
            <div class="category-item">
              <div class="cat-header">
                <span class="cat-label">{cat.label}</span>
                <span class="cat-score">{detailedRatings[cat.id]}/10</span>
              </div>
              <p class="cat-desc">{cat.desc}</p>
              <input type="range" min="1" max="10" bind:value={detailedRatings[cat.id]} class="rating-slider small-slider">
            </div>
          {/each}
        {/if}
      </div>
      <div class="step-footer">
        <Button fullWidth size="large" on:click={goToChat}>
          Dalej: Rozmowa <MessageSquare size={18} />
        </Button>
      </div>
    </div>
  
  {:else if step === 2}
    <div class="step-content chat-step">
      <!-- Added overflow-y-auto to fix scroll issue -->
      <div class="chat-messages" bind:this={chatContainer}>
        {#each messages as msg}
          <div class="message {msg.role}">
            <div class="bubble">
              {msg.text}
            </div>
          </div>
        {/each}
        
        {#if isTyping}
          <div class="message ai">
            <div class="bubble typing">
              <span>.</span><span>.</span><span>.</span>
            </div>
          </div>
        {/if}

        {#if chatError}
          <div class="chat-error">
            <span>{chatError}</span>
            <button class="retry-btn" on:click={requestAiTurn}>
              <RotateCcw size={14} /> Ponów
            </button>
          </div>
        {/if}

        <div class="spacer" style="height: 20px;"></div>
      </div>

      <div class="chat-input-bar">
        {#if isFinalQuestion && !isTyping}
          <div class="quick-actions">
            <button class="quick-btn" on:click={finishReview} disabled={isSaving}>
              {#if isSaving}
                <Loader2 size={16} class="spinner" /> Zapisuję recenzję...
              {:else}
                <Check size={16} /> Nie, to już wszystko
              {/if}
            </button>
          </div>
        {/if}
        <div class="chat-input-content">
          <div class="input-wrapper">
            <textarea
              bind:this={textareaRef}
              placeholder={isTyping ? 'AI pisze...' : 'Napisz wiadomość...'}
              rows="1"
              disabled={isSaving}
              bind:value={chatInput}
              on:keydown={handleKeydown}
              on:input={resizeTextarea}
            ></textarea>
            <button class="send-btn" on:click={addUserMessage} disabled={!chatInput.trim() || isTyping || isSaving}>
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}

</div>

<style>
  .guided-wrapper {
    max-width: 600px;
    margin: 0 auto;
    /* Removed min-height: 100vh here as it might conflict with flex layout inside app layout. 
       Using height: 100% or flex grow in parent is better, but min-height is okay. */
    height: 100%; 
    min-height: calc(100vh - 80px); /* Adjust for layout padding */
    display: flex;
    flex-direction: column;
    background: var(--color-bg);
  }

  .header-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1rem;
    background: var(--color-bg);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .step-content {
    animation: fadeIn 0.3s ease-out;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  /* Ratings Step */
  .ratings-step { padding: 0 1rem 4rem 1rem; }
  .movie-title { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 700; text-align: center; margin-bottom: 0.25rem; }
  .step-desc { text-align: center; color: var(--color-text-muted); margin-bottom: 2rem; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; }
  .overall-rating-card { background: var(--color-surface); padding: 2rem; border-radius: var(--radius-lg); border: 1px solid var(--color-border); text-align: center; margin-bottom: 2rem; box-shadow: var(--shadow-sm); }
  .overall-rating-card label { display: block; font-weight: 600; color: var(--color-text-muted); margin-bottom: 1rem; }
  .rating-display { display: flex; justify-content: center; align-items: baseline; gap: 0.5rem; margin-bottom: 1.5rem; }
  .score { font-size: 3.5rem; font-weight: 700; color: var(--color-primary); line-height: 1; }
  .scale { font-size: 1.5rem; color: var(--color-text-muted); }
  .detailed-ratings h3 { font-size: 1.25rem; margin-bottom: 1.5rem; padding-left: 0.5rem; }
  .category-item { background: var(--color-surface); padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--color-border); margin-bottom: 1rem; }
  .cat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
  .cat-label { font-weight: 600; }
  .cat-score { color: var(--color-primary); font-weight: 700; }
  .cat-desc { font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 1rem; line-height: 1.4; }
  input[type=range] { width: 100%; -webkit-appearance: none; background: transparent; }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 24px; width: 24px; border-radius: 50%; background: var(--color-primary); cursor: pointer; margin-top: -10px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
  input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 4px; cursor: pointer; background: var(--color-border); border-radius: 2px; }
  .step-footer { margin-top: 2rem; }

  /* Chat Step */
  .chat-step {
    padding-bottom: 140px; 
    /* Ensure chat takes remaining height but has limit for scroll */
    max-height: calc(100vh - 140px);
  }
  
  .chat-header-info { display: flex; flex-direction: column; align-items: center; flex: 1; min-width: 0; }
  .chat-title { font-weight: 600; font-size: 0.8rem; color: var(--color-text-muted); text-transform: uppercase; }
  .chat-subtitle {
    font-family: 'Playfair Display', serif;
    font-weight: 700;
    font-size: 1.1rem;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .chat-messages {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    overflow-y: auto; /* KEY FIX: Enable scrolling inside chat container */
    scroll-behavior: smooth;
  }

  .message { display: flex; max-width: 85%; }
  .message.user { align-self: flex-end; }
  .message.ai { align-self: flex-start; }

  .bubble { padding: 1rem; border-radius: 1rem; font-size: 1rem; line-height: 1.5; position: relative; box-shadow: var(--shadow-sm); }
  .message.user .bubble { background: var(--color-primary); color: white; border-bottom-right-radius: 4px; }
  .message.ai .bubble { background: var(--color-surface); color: var(--color-text-main); border: 1px solid var(--color-border); border-bottom-left-radius: 4px; }

  .typing { display: flex; gap: 4px; padding: 1rem 1.25rem; }
  .typing span { width: 6px; height: 6px; background: var(--color-text-muted); border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; }
  .typing span:nth-child(1) { animation-delay: -0.32s; }
  .typing span:nth-child(2) { animation-delay: -0.16s; }
  @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }

  .chat-input-bar { position: fixed; bottom: 64px; left: 0; width: 100%; background: var(--color-surface); border-top: 1px solid var(--color-border); z-index: 100; box-shadow: 0 -4px 12px rgba(0,0,0,0.05); }
  .quick-actions { position: absolute; top: -50px; left: 0; width: 100%; display: flex; justify-content: center; padding: 0 1rem; }
  .quick-btn { background: var(--color-primary); color: white; border: none; padding: 0.5rem 1.25rem; border-radius: 20px; font-weight: 500; font-family: inherit; cursor: pointer; box-shadow: 0 4px 10px rgba(224, 122, 95, 0.4); display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; transition: transform 0.2s; }
  .quick-btn:hover { transform: translateY(-2px); }
  .chat-input-content { max-width: 600px; margin: 0 auto; padding: 1rem; }
  .input-wrapper { display: flex; align-items: flex-end; gap: 0.75rem; background: var(--color-bg); padding: 0.75rem; border-radius: 1rem; border: 1px solid var(--color-border); }
  textarea { flex: 1; border: none; background: transparent; padding: 0; font-family: inherit; font-size: 1rem; resize: none; outline: none; line-height: 1.5; color: var(--color-text-main); max-height: 150px; overflow-y: auto; }
  .send-btn { background: var(--color-primary); color: white; border: none; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s; flex-shrink: 0; }
  .send-btn:disabled { background: var(--color-border); cursor: default; }

  .inline-error { color: var(--color-error); font-size: 0.9rem; padding: 0 0.5rem; }

  .chat-error {
    align-self: center;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    justify-content: center;
    background: #FFF5F5;
    border: 1px solid var(--color-error);
    color: var(--color-error);
    border-radius: var(--radius-md);
    padding: 0.75rem 1rem;
    font-size: 0.85rem;
    text-align: center;
  }

  .retry-btn {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    background: var(--color-error);
    color: white;
    border: none;
    border-radius: var(--radius-full);
    padding: 0.35rem 0.9rem;
    font-family: inherit;
    font-size: 0.85rem;
    cursor: pointer;
    flex-shrink: 0;
  }

  .quick-btn:disabled { opacity: 0.7; cursor: default; transform: none; }
  textarea:disabled { opacity: 0.6; }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @media(min-width: 768px) {
    .chat-input-bar { bottom: 0; }
    .chat-step { padding-bottom: 140px; }
  }
</style>