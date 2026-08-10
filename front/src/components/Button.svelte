<script>
  export let variant = 'primary'; // 'primary' | 'secondary' | 'ghost'
  export let size = 'medium';     // 'small' | 'medium' | 'large'
  export let type = 'button';
  export let disabled = false;
  export let fullWidth = false;
</script>

<button
  {type}
  class="btn variant-{variant} size-{size}"
  class:full-width={fullWidth}
  {disabled}
  on:click
>
  <slot />
</button>

<style>
  .btn {
    border: none;
    border-radius: var(--radius-md);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-family: inherit;
    font-size: 0.95rem;
    text-decoration: none;
  }

  .btn:active:not(:disabled) {
    transform: scale(0.98);
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Variants */
  .variant-primary {
    background: var(--color-primary);
    color: white;
    box-shadow: 0 2px 4px rgba(224, 122, 95, 0.3);
  }
  .variant-primary:hover:not(:disabled) {
    background: var(--color-primary-dark);
    box-shadow: 0 4px 6px rgba(224, 122, 95, 0.4);
  }

  .variant-secondary {
    background: var(--color-surface);
    color: var(--color-text-main);
    border: 1px solid var(--color-border);
  }
  .variant-secondary:hover:not(:disabled) {
    background: #F1F5F9;
    border-color: #CBD5E1;
  }

  .variant-ghost {
    background: transparent;
    color: var(--color-text-muted);
  }
  .variant-ghost:hover:not(:disabled) {
    color: var(--color-primary);
    background: rgba(224, 122, 95, 0.1);
  }

  /* Sizes */
  .size-small { padding: 0.375rem 0.75rem; font-size: 0.875rem; }
  .size-medium { padding: 0.625rem 1.25rem; }
  .size-large { padding: 0.875rem 2rem; font-size: 1.125rem; }

  .full-width { width: 100%; display: flex; }
</style>