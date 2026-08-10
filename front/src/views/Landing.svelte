<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { Clapperboard, LogIn, MessageSquare, Star, Film, Sparkles, ArrowRight, BookOpen } from 'lucide-svelte';
  import Button from '../components/Button.svelte';

  const dispatch = createEventDispatcher();
  
  // Prosta animacja dla elementów wizualnych
  let isMounted = false;
  onMount(() => {
    setTimeout(() => isMounted = true, 100);
  });
</script>

<div class="landing-page">
  
  <!-- --- HERO SECTION --- -->
  <section class="hero-section">
    <div class="container hero-content">
      
      <!-- Text Content -->
      <div class="hero-text">
        <div class="badge">
          <Sparkles size={14} />
          <span>Nowy sposób na pamiętnik filmowy</span>
        </div>
        
        <h1>Oglądasz. Rozmawiasz.<br> <span class="highlight">Pamiętasz.</span></h1>
        
        <p class="subheading">
          Zamień luźne myśli po seansie w piękne recenzje. 
          AI zada Ci właściwe pytania, a Ty zbudujesz swoją osobistą kolekcję wrażeń.
        </p>

        <div class="hero-actions">
          <Button size="large" on:click={() => dispatch('login')}>
            <LogIn size={20} />
            Rozpocznij teraz
          </Button>
          <span class="trust-text">Nie wymaga karty kredytowej • Konto Google</span>
        </div>
      </div>

      <!-- Visual Content (Mockup) -->
      <div class="hero-visual" class:visible={isMounted}>
        <!-- Background decorative blob -->
        <div class="blob"></div>
        
        <!-- Mockup Cards -->
        <div class="mockup-stack">
          <!-- Card 1: Chat UI -->
          <div class="mockup-card chat-card">
            <div class="chat-bubble ai">
              Co sądzisz o wizualnej stronie Diuny?
            </div>
            <div class="chat-bubble user">
              Skala jest niesamowita, czuć ogrom pustyni...
            </div>
          </div>

          <!-- Card 2: Result UI -->
          <div class="mockup-card result-card">
            <div class="poster-mini">
               <Film size={24} color="white" />
            </div>
            <div class="result-content">
              <h4>Dune: Part One</h4>
              <div class="stars">
                {#each Array(5) as _} <Star size={12} fill="#E07A5F" stroke="none" /> {/each}
              </div>
              <div class="fake-text"></div>
              <div class="fake-text short"></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>

  <!-- --- HOW IT WORKS --- -->
  <section class="steps-section">
    <div class="container">
      <h2>Z kina do notatnika w <span class="underline">3 krokach</span></h2>
      
      <div class="steps-grid">
        <div class="step-item">
          <div class="step-icon-bg">
            <Clapperboard size={32} />
          </div>
          <h3>1. Obejrzyj film</h3>
          <p>Ciesz się seansem. Nie martw się notowaniem w trakcie. Po prostu chłoń atmosferę.</p>
        </div>

        <div class="step-connector">
          <ArrowRight size={24} />
        </div>

        <div class="step-item">
          <div class="step-icon-bg highlight">
            <MessageSquare size={32} color="white" />
          </div>
          <h3>2. Pogadaj z AI</h3>
          <p>Odpowiedz na kilka pytań. AI pomoże Ci wydobyć to, co najważniejsze – emocje, detale, sens.</p>
        </div>

        <div class="step-connector">
          <ArrowRight size={24} />
        </div>

        <div class="step-item">
          <div class="step-icon-bg">
            <BookOpen size={32} />
          </div>
          <h3>3. Zapisz wspomnienie</h3>
          <p>Gotowe! Otrzymujesz pięknie sformatowaną recenzję i statystyki do swojej kolekcji.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- --- FEATURES FOR CINEPHILES --- -->
  <section class="features-section">
    <div class="container">
      <div class="feature-layout">
        <div class="feature-text">
          <h2>Dla tych, którzy <br>kochają kino</h2>
          <p>Seenote to nie tylko baza danych. To przestrzeń na Twoją wrażliwość filmową.</p>
          
          <ul class="feature-list">
            <li>
              <div class="check-icon"><Star size={16} /></div>
              <span><strong>Szczegółowe oceny:</strong> Oceniaj nie tylko całość, ale też scenariusz, zdjęcia czy muzykę.</span>
            </li>
            <li>
              <div class="check-icon"><Film size={16} /></div>
              <span><strong>Koniec z blokadą pisarską:</strong> Nie wiesz jak zacząć? Nasz asystent poprowadzi Cię za rękę.</span>
            </li>
            <li>
              <div class="check-icon"><Sparkles size={16} /></div>
              <span><strong>Piękny format:</strong> Twoje przemyślenia zasługują na oprawę lepszą niż zwykły plik tekstowy.</span>
            </li>
          </ul>
        </div>
        
        <div class="feature-visual">
          <!-- Abstract Grid of "Posters" -->
          <div class="poster-grid">
            {#each Array(9) as _, i}
              <div class="grid-poster poster-{i}"></div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- --- FINAL CTA --- -->
  <section class="cta-section">
    <div class="container">
      <div class="cta-box">
        <h2>Zacznij budować swoją filmotekę</h2>
        <p>Dołącz do kinomanów, którzy pamiętają więcej.</p>
        <div class="cta-btn-wrapper">
          <Button size="large" on:click={() => dispatch('login')}>
            Zaloguj przez Google <ArrowRight size={20} />
          </Button>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer>
    <div class="container footer-content">
      <div class="footer-logo">Seenote<span class="logo-dot">.</span></div>
      <div class="copyright">© 2025 Seenote. All rights reserved.</div>
    </div>
  </footer>

</div>

<style>
  /* --- Global Landing Styles --- */
  .landing-page {
    background-color: var(--color-bg);
    overflow-x: hidden;
  }

  .container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }

  /* --- HERO SECTION --- */
  .hero-section {
    padding: 4rem 0 6rem;
    position: relative;
    /* Delikatny gradient w tle */
    background: radial-gradient(circle at 80% 20%, rgba(224, 122, 95, 0.1) 0%, transparent 60%);
  }

  .hero-content {
    display: grid;
    grid-template-columns: 1fr;
    gap: 4rem;
    align-items: center;
  }

  @media(min-width: 900px) {
    .hero-content {
      grid-template-columns: 1.1fr 0.9fr;
      padding-top: 2rem;
    }
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: white;
    padding: 0.5rem 1rem;
    border-radius: 50px;
    border: 1px solid var(--color-border);
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--color-primary);
    margin-bottom: 1.5rem;
    box-shadow: var(--shadow-sm);
  }

  h1 {
    font-size: 3rem;
    line-height: 1.1;
    font-weight: 700;
    margin-bottom: 1.5rem;
    letter-spacing: -0.02em;
  }
  
  @media(min-width: 768px) { h1 { font-size: 4rem; } }

  .highlight {
    color: var(--color-primary);
    position: relative;
    display: inline-block;
  }
  
  /* Underline effect */
  .highlight::after {
    content: '';
    position: absolute;
    bottom: 5px;
    left: 0;
    width: 100%;
    height: 12px;
    background: rgba(224, 122, 95, 0.2);
    z-index: -1;
    border-radius: 4px;
  }

  .subheading {
    font-size: 1.25rem;
    color: var(--color-text-muted);
    line-height: 1.6;
    margin-bottom: 2.5rem;
    max-width: 500px;
  }

  .hero-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .trust-text {
    font-size: 0.8rem;
    color: var(--color-text-muted);
    margin-left: 0.5rem;
  }

  /* Hero Visual (Mockups) */
  .hero-visual {
    position: relative;
    height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.8s ease-out;
  }

  .hero-visual.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .blob {
    position: absolute;
    width: 300px;
    height: 300px;
    background: var(--color-primary);
    opacity: 0.1;
    filter: blur(60px);
    border-radius: 50%;
    z-index: 0;
  }

  .mockup-stack {
    position: relative;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  .mockup-card {
    position: absolute;
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.15);
    border: 1px solid rgba(0,0,0,0.05);
    padding: 1.5rem;
    width: 280px;
    transition: transform 0.5s ease;
  }

  /* Karta czatu (tył) */
  .chat-card {
    top: 20px;
    left: 20px;
    transform: rotate(-6deg);
    z-index: 1;
  }

  .chat-bubble {
    padding: 0.75rem 1rem;
    border-radius: 12px;
    font-size: 0.9rem;
    margin-bottom: 0.75rem;
    line-height: 1.4;
  }
  .chat-bubble.ai {
    background: #F3F4F6;
    border-bottom-left-radius: 2px;
    width: 80%;
  }
  .chat-bubble.user {
    background: var(--color-primary);
    color: white;
    border-bottom-right-radius: 2px;
    margin-left: auto;
    width: 85%;
  }

  /* Karta wyniku (przód) */
  .result-card {
    top: 80px;
    right: 20px;
    transform: rotate(3deg);
    z-index: 2;
    display: flex;
    gap: 1rem;
    align-items: flex-start;
  }

  .poster-mini {
    width: 60px;
    height: 90px;
    background: #2D2D2D;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .result-content { flex: 1; }
  .result-content h4 { font-family: 'Playfair Display'; margin-bottom: 0.25rem; font-size: 1.1rem; }
  .stars { margin-bottom: 0.75rem; display: flex; gap: 2px; }
  .fake-text { height: 8px; background: #E5E7EB; border-radius: 4px; margin-bottom: 6px; width: 100%; }
  .fake-text.short { width: 60%; }

  /* Hover effect for mockups */
  .hero-visual:hover .chat-card { transform: rotate(-8deg) translateY(-10px); }
  .hero-visual:hover .result-card { transform: rotate(5deg) translateY(5px); }


  /* --- STEPS SECTION --- */
  .steps-section {
    padding: 5rem 0;
    background: white;
    border-top: 1px solid var(--color-border);
    border-bottom: 1px solid var(--color-border);
  }

  .steps-section h2 {
    text-align: center;
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 4rem;
  }

  .underline {
    border-bottom: 4px solid var(--color-primary);
  }

  .steps-grid {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    align-items: center;
  }

  @media(min-width: 768px) {
    .steps-grid {
      flex-direction: row;
      align-items: flex-start;
      justify-content: space-between;
    }
  }

  .step-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    max-width: 300px;
  }

  .step-icon-bg {
    width: 80px;
    height: 80px;
    background: #FFF5F5; /* Lekka zmiana na cieplejszy odcień */
    color: var(--color-primary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
    transition: transform 0.3s;
  }
  
  .step-icon-bg.highlight {
    background: var(--color-primary);
    color: white;
    box-shadow: 0 10px 20px rgba(224, 122, 95, 0.3);
  }

  .step-item:hover .step-icon-bg { transform: scale(1.1); }

  .step-item h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; }
  .step-item p { color: var(--color-text-muted); font-size: 0.95rem; line-height: 1.5; }

  .step-connector {
    display: none;
    padding-top: 2rem;
    color: var(--color-border);
  }
  @media(min-width: 768px) { .step-connector { display: block; } }


  /* --- FEATURES SECTION --- */
  .features-section {
    padding: 6rem 0;
    overflow: hidden;
  }

  .feature-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 4rem;
    align-items: center;
  }

  @media(min-width: 900px) {
    .feature-layout { grid-template-columns: 1fr 1fr; }
  }

  .feature-text h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    font-weight: 700;
  }

  .feature-text p {
    font-size: 1.1rem;
    color: var(--color-text-muted);
    margin-bottom: 2.5rem;
  }

  .feature-list {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .feature-list li {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
  }

  .check-icon {
    background: #E6F4EA;
    color: #137333;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .feature-list span {
    font-size: 1rem;
    color: var(--color-text-main);
    line-height: 1.5;
  }

  /* Visual Grid */
  .feature-visual {
    position: relative;
    height: 400px;
    background: radial-gradient(circle, #f8f9fa 0%, transparent 70%);
  }

  .poster-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    transform: rotate(-10deg) scale(0.9);
    opacity: 0.8;
  }

  .grid-poster {
    background: #E0E0E0;
    border-radius: 8px;
    aspect-ratio: 2/3;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    transition: transform 0.3s;
  }
  
  /* Kolorowanie "plakatów" */
  .poster-0 { background: #2D2D2D; transform: translateY(20px); }
  .poster-1 { background: #E07A5F; }
  .poster-2 { background: #6B6B6B; transform: translateY(30px); }
  .poster-4 { background: #D15858; transform: scale(1.1); z-index: 2; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
  
  .poster-grid:hover .poster-4 { transform: scale(1.15); }


  /* --- CTA SECTION --- */
  .cta-section {
    padding-bottom: 4rem;
  }

  .cta-box {
    background: var(--color-text-main);
    color: white;
    border-radius: 24px;
    padding: 4rem 2rem;
    text-align: center;
    background-image: linear-gradient(135deg, #2D2D2D 0%, #1A1A1A 100%);
    position: relative;
    overflow: hidden;
  }

  .cta-box h2 {
    color: white;
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  .cta-box p {
    color: #A3A3A3;
    font-size: 1.2rem;
    margin-bottom: 2.5rem;
  }

  .cta-btn-wrapper {
    display: flex;
    justify-content: center;
  }

  /* Footer */
  footer {
    padding: 2rem 0;
    border-top: 1px solid var(--color-border);
    margin-top: 2rem;
  }

  .footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .footer-logo {
    font-family: 'Playfair Display', serif;
    font-weight: 700;
    font-size: 1.5rem;
    color: var(--color-text-main);
  }

  .logo-dot {
    color: var(--color-primary);
  }

  .copyright {
    font-size: 0.8rem;
    color: var(--color-text-muted);
  }
</style>