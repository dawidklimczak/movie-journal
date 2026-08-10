<script>
  import { createEventDispatcher, tick } from 'svelte';
  import { ArrowLeft, MessageSquare, Star, Send, Check } from 'lucide-svelte';
  import Button from '../components/Button.svelte';

  export let movieId;
  const dispatch = createEventDispatcher();

  // --- STATE ---
  let step = 1; // 1: Ratings, 2: Chat
  let movieTitle = 'Dune: Part One'; 

  // --- KROK 1: OCENY ---
  let overallRating = 5;
  const categories = [
    { id: 'script', label: 'Scenariusz i struktura', desc: 'Czy historia jest logiczna, dobrze zbudowana i sensownie poprowadzona w czasie.' },
    { id: 'directing', label: 'Reżyseria i narracja', desc: 'Jak reżyser prowadzi widza: tempo, decyzje inscenizacyjne, kontrola tonu.' },
    { id: 'acting', label: 'Postacie i aktorstwo', desc: 'Na ile bohaterowie są wiarygodni, a aktorstwo wspiera historię.' },
    { id: 'visuals', label: 'Język filmowy (kamera + montaż)', desc: 'Jak obraz i montaż opowiadają historię: kadry, ruch kamery, rytm scen.' },
    { id: 'sound', label: 'Dźwięk i muzyka', desc: 'Czy dźwięk, cisza i muzyka wzmacniają narrację, a nie tylko ją ilustrują.' },
    { id: 'world', label: 'Świat przedstawiony', desc: 'Czy otoczenie filmu jest spójne, wiarygodne i wspiera opowieść (scenografia, kostiumy, VFX).' },
    { id: 'impact', label: 'Oddziaływanie i sens', desc: 'Co film robi z widzem i co po nim zostaje: emocje, myśli, interpretacje.' }
  ];

  let detailedRatings = {};
  categories.forEach(c => detailedRatings[c.id] = 5);

  function goToChat() {
    step = 2;
    setTimeout(() => {
      addAiMessage(`Cześć! Widzę, że oceniłeś "${movieTitle}" na ${overallRating}/10. Opowiedz mi, jakie są Twoje ogólne wrażenia po seansie?`);
    }, 500);
  }

  // --- KROK 2: CZAT ---
  let chatContainer;
  let chatInput = '';
  let textareaRef;
  let isTyping = false;
  let messages = [];
  let isFinalQuestion = false;

  async function scrollToBottom() {
    await tick();
    if (chatContainer) {
      chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });
    }
  }

  function addAiMessage(text, isFinal = false) {
    isTyping = true;
    scrollToBottom(); // Scroll to show typing indicator
    
    setTimeout(() => {
      messages = [...messages, { role: 'ai', text }];
      isTyping = false;
      if (isFinal) {
        isFinalQuestion = true;
      }
      scrollToBottom(); // Scroll to show new message
    }, 1000 + Math.random() * 1000);
  }

  function resizeTextarea() {
    if (textareaRef) {
      textareaRef.style.height = 'auto'; 
      textareaRef.style.height = `${textareaRef.scrollHeight}px`;
    }
  }

  async function addUserMessage() {
    if (!chatInput.trim()) return;
    
    if (isFinalQuestion) isFinalQuestion = false; 

    const text = chatInput;
    messages = [...messages, { role: 'user', text }];
    chatInput = '';
    
    // Reset textarea
    await tick();
    if (textareaRef) textareaRef.style.height = 'auto';
    
    scrollToBottom(); // Scroll to show user message

    // Logic
    const userMsgCount = messages.filter(m => m.role === 'user').length;
    if (userMsgCount === 1) {
      addAiMessage("Rozumiem. A co myślisz o zakończeniu? Czy było satysfakcjonujące?");
    } else if (userMsgCount === 2) {
      addAiMessage("Ciekawe spostrzeżenie. Czy jest jakaś scena, która szczególnie zapadła Ci w pamięć?");
    } else {
      addAiMessage("Dzięki za tę uwagę. Czy to już wszystkie Twoje przemyślenia, czy chcesz dodać coś jeszcze?", true);
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addUserMessage();
    }
  }

  function finishReview() {
    dispatch('finish', {
      movieTitle: movieTitle,
      rating: overallRating,
      detailedRatings: detailedRatings,
      chatHistory: messages,
      aiSummary: "Film wywarł silne wrażenie swoją warstwą wizualną i budową świata. Doceniasz grę aktorską, szczególnie w kluczowych scenach emocjonalnych."
    });
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
       <div style="width: 24px;"></div>
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
        
        <div class="spacer" style="height: 20px;"></div>
      </div>

      <div class="chat-input-bar">
        {#if isFinalQuestion}
          <div class="quick-actions">
            <button class="quick-btn" on:click={finishReview}>
              <Check size={16} /> Nie, to już wszystko
            </button>
          </div>
        {/if}
        <div class="chat-input-content">
          <div class="input-wrapper">
            <textarea 
              bind:this={textareaRef}
              placeholder="Napisz wiadomość..." 
              rows="1"
              bind:value={chatInput}
              on:keydown={handleKeydown}
              on:input={resizeTextarea}
            ></textarea>
            <button class="send-btn" on:click={addUserMessage} disabled={!chatInput.trim()}>
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
  
  .chat-header-info { display: flex; flex-direction: column; align-items: center; width: 100%; }
  .chat-title { font-weight: 600; font-size: 0.8rem; color: var(--color-text-muted); text-transform: uppercase; }
  .chat-subtitle { font-family: 'Playfair Display', serif; font-weight: 700; font-size: 1.1rem; }

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

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @media(min-width: 768px) {
    .chat-input-bar { bottom: 0; }
    .chat-step { padding-bottom: 140px; }
  }
</style>