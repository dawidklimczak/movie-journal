<script>
  import { createEventDispatcher } from 'svelte';
  import { ChevronDown, User, BookOpen, LogOut, Settings } from 'lucide-svelte';
  
  export let currentRoute = 'dashboard';
  
  const dispatch = createEventDispatcher();
  
  let isDropdownOpen = false;

  function navigate(route) {
    dispatch('navigate', route);
    isDropdownOpen = false;
  }

  function toggleDropdown(event) {
    event.stopPropagation(); // Zapobiega natychmiastowemu zamknięciu przez window click
    isDropdownOpen = !isDropdownOpen;
  }

  function closeDropdown() {
    isDropdownOpen = false;
  }
</script>

<!-- Global click listener to close dropdown -->
<svelte:window on:click={closeDropdown} />

<div class="layout-wrapper">
  <!-- Top Navigation Bar -->
  <nav class="top-nav">
    <div class="container nav-content">
      
      <!-- Logo -> Dashboard -->
      <a href="#" class="logo" on:click|preventDefault={() => navigate('dashboard')}>
        <span class="logo-text">Seenote<span class="logo-dot">.</span></span>
      </a>
      
      <!-- Right Side: User Menu -->
      <div class="nav-right">
        <div class="user-menu-container">
          <!-- Trigger -->
          <button class="user-trigger" on:click={toggleDropdown} class:active={isDropdownOpen}>
            <div class="user-info">
              <span class="user-name">Jan K.</span>
            </div>
            <img 
              src="https://ui-avatars.com/api/?name=Jan+Kowalski&background=E07A5F&color=fff" 
              alt="User" 
              class="avatar"
            >
            <ChevronDown size={14} class="chevron {isDropdownOpen ? 'rotated' : ''}" />
          </button>

          <!-- Dropdown Menu -->
          {#if isDropdownOpen}
            <div class="dropdown-menu" on:click|stopPropagation>
              <div class="dropdown-header">
                <div class="header-name">Jan Kowalski</div>
                <div class="header-email">jan.kowalski@example.com</div>
              </div>
              
              <div class="dropdown-divider"></div>
              
              <button class="dropdown-item" on:click={() => console.log('Moje konto')}>
                <User size={16} />
                <span>Moje konto</span>
              </button>
              
              <button class="dropdown-item" on:click={() => navigate('all-reviews')}>
                <BookOpen size={16} />
                <span>Notatki</span>
              </button>

              <button class="dropdown-item" on:click={() => console.log('Ustawienia')}>
                <Settings size={16} />
                <span>Ustawienia</span>
              </button>

              <div class="dropdown-divider"></div>
              
              <button class="dropdown-item danger" on:click={() => console.log('Wyloguj')}>
                <LogOut size={16} />
                <span>Wyloguj</span>
              </button>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </nav>

  <!-- Main Content -->
  <main class="container view-section">
    <slot />
  </main>
</div>

<style>
  .layout-wrapper {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: var(--color-bg);
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
    width: 100%;
    position: relative;
  }

  /* --- Top Navigation --- */
  .top-nav {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(12px); /* Modern blur effect */
    border-bottom: 1px solid var(--color-border);
    height: 64px;
    position: sticky;
    top: 0;
    z-index: 50;
    transition: all 0.2s ease;
  }

  .nav-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
  }

  /* Logo */
  .logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    color: var(--color-text-main);
    transition: opacity 0.2s;
  }
  .logo:hover { opacity: 0.8; }

  .logo-text {
    font-family: 'Playfair Display', serif;
    font-weight: 700;
    font-size: 1.5rem;
    letter-spacing: -0.02em;
  }

  .logo-dot {
    color: var(--color-primary);
  }

  /* User Menu */
  .user-menu-container {
    position: relative;
  }

  .user-trigger {
    background: transparent;
    border: none;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.25rem 0.5rem 0.25rem 0.75rem;
    border-radius: 20px;
    cursor: pointer;
    transition: background 0.2s;
    border: 1px solid transparent;
  }

  .user-trigger:hover, .user-trigger.active {
    background: white;
    border-color: var(--color-border);
    box-shadow: var(--shadow-sm);
  }

  .user-info {
    display: none; /* Mobile first: hidden text */
    flex-direction: column;
    align-items: flex-end;
    line-height: 1.2;
  }
  @media(min-width: 640px) {
    .user-info { display: flex; }
  }

  .user-name {
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--color-text-main);
  }

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid white;
    box-shadow: 0 0 0 1px #E2E8F0;
  }

  .chevron {
    color: var(--color-text-muted);
    transition: transform 0.2s ease;
  }
  .chevron.rotated { transform: rotate(180deg); }

  /* Dropdown Menu */
  .dropdown-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 240px;
    background: white;
    border-radius: 12px;
    box-shadow: 
      0 4px 6px -1px rgba(0, 0, 0, 0.1), 
      0 2px 4px -1px rgba(0, 0, 0, 0.06),
      0 0 0 1px rgba(0,0,0,0.05);
    padding: 0.5rem;
    animation: slideDown 0.2s ease-out;
    z-index: 100;
  }

  .dropdown-header {
    padding: 0.75rem 1rem;
  }

  .header-name {
    font-weight: 600;
    color: var(--color-text-main);
  }
  .header-email {
    font-size: 0.8rem;
    color: var(--color-text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .dropdown-divider {
    height: 1px;
    background: var(--color-border);
    margin: 0.5rem 0;
  }

  .dropdown-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.6rem 1rem;
    border: none;
    background: transparent;
    color: var(--color-text-main);
    font-size: 0.9rem;
    font-weight: 500;
    border-radius: 8px;
    cursor: pointer;
    text-align: left;
    transition: background 0.15s;
    font-family: 'Inter', sans-serif;
  }

  .dropdown-item:hover {
    background: var(--color-bg);
    color: var(--color-primary);
  }

  .dropdown-item.danger {
    color: var(--color-error);
  }
  .dropdown-item.danger:hover {
    background: #FFF5F5;
  }

  /* Main Content */
  .view-section {
    padding: 2rem 1.5rem;
    flex: 1;
    animation: fadeIn 0.3s ease-out;
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>