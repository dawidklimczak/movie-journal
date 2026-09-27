<script>
  import AppLayout from './components/AppLayout.svelte';
  import Landing from './views/Landing.svelte';
  import Dashboard from './views/Dashboard.svelte';
  import Search from './views/Search.svelte';
  import GuidedReview from './views/GuidedReview.svelte';
  import ReviewSummary from './views/ReviewSummary.svelte';
  import ReviewDetail from './views/ReviewDetail.svelte';
  import AllReviews from './views/AllReviews.svelte';

  // State routera
  let currentView = 'landing';
  let viewProps = {};

  /**
   * `key` wymusza przemontowanie widoku, gdy wracamy do tej samej trasy
   * (np. dashboard -> szczegóły -> dashboard) — inaczej lista nie odświeżyłaby się
   * po dodaniu lub usunięciu recenzji.
   */
  let navigationCount = 0;

  function navigate(view, props = {}) {
    currentView = view;
    viewProps = props;
    navigationCount += 1;
    window.scrollTo(0, 0);
  }
</script>

{#if currentView === 'landing'}
  <Landing on:login={() => navigate('dashboard')} />
{:else}
  <AppLayout
    currentRoute={currentView}
    on:navigate={(e) => navigate(e.detail)}
    on:logout={() => navigate('landing')}
  >
    {#key navigationCount}
      {#if currentView === 'dashboard'}
        <Dashboard
          on:add={() => navigate('search')}
          on:view={(e) => navigate('review-detail', { id: e.detail })}
          on:seeAll={() => navigate('all-reviews')}
        />

      {:else if currentView === 'search'}
        <Search
          on:back={() => navigate('dashboard')}
          on:select={(e) => navigate('guided', { movie: e.detail })}
        />

      {:else if currentView === 'guided'}
        <GuidedReview
          movie={viewProps.movie}
          on:back={() => navigate('search')}
          on:finish={(e) => navigate('summary', { review: e.detail })}
        />

      {:else if currentView === 'summary'}
        <ReviewSummary
          review={viewProps.review}
          on:confirm={() => navigate('dashboard')}
        />

      {:else if currentView === 'review-detail'}
        <ReviewDetail
          reviewId={viewProps.id}
          on:back={() => navigate('dashboard')}
          on:deleted={() => navigate('dashboard')}
        />

      {:else if currentView === 'all-reviews'}
        <AllReviews
          on:back={() => navigate('dashboard')}
          on:view={(e) => navigate('review-detail', { id: e.detail })}
        />
      {/if}
    {/key}
  </AppLayout>
{/if}
