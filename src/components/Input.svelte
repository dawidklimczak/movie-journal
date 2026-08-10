<script>
  import { createEventDispatcher } from 'svelte';

  export let value = '';
  export let placeholder = '';
  export let type = 'text';
  
  const dispatch = createEventDispatcher();

  function handleInput(event) {
    // Aktualizujemy wartość ręcznie zamiast bind:value
    value = event.target.value;
    // Przekazujemy zdarzenie input dalej (aby on:input działało w rodzicu)
    dispatch('input', event);
  }
</script>

<div class="input-wrapper">
  {#if $$slots.icon}
    <div class="icon-slot">
      <slot name="icon" />
    </div>
  {/if}
  
  <input
    {type}
    {value}
    {placeholder}
    class:has-icon={$$slots.icon}
    on:input={handleInput}
    on:focus
    on:blur
  />
</div>

<style>
  .input-wrapper {
    position: relative;
    width: 100%;
  }

  .icon-slot {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-text-muted);
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Przekazujemy styl ikony do slotu, ale tutaj zakładamy że icon komponent ma swoje rozmiary.
     Zazwyczaj w lucide-svelte ustawia się size={20} */

  input {
    width: 100%;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    font-family: 'Inter', sans-serif;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text-main);
    transition: all 0.2s ease;
  }

  input.has-icon {
    padding-left: 3rem;
  }

  input:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(224,122,95,0.15);
  }

  input::placeholder {
    color: #94A3B8;
  }
</style>