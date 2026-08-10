<script>
  import AppLayout from './components/AppLayout.svelte';
  import Landing from './views/Landing.svelte';
  import Dashboard from './views/Dashboard.svelte';
  import Search from './views/Search.svelte';
  import GuidedReview from './views/GuidedReview.svelte';
  import ReviewSummary from './views/ReviewSummary.svelte';
  import ReviewDetail from './views/ReviewDetail.svelte';
  import AllReviews from './views/AllReviews.svelte'; // Import nowego widoku

  // State routera
  let currentView = 'landing';
  let viewProps = {};

  function navigate(view, props = {}) {
    currentView = view;
    viewProps = props;
    window.scrollTo(0, 0);
  }
</script>

{#if currentView === 'landing'}
  <Landing on:login={() => navigate('dashboard')} />
{:else}
  <AppLayout 
    currentRoute={currentView} 
    on:navigate={(e) => navigate(e.detail)}
  >
    {#if currentView === 'dashboard'}
      <Dashboard 
        on:add={() => navigate('search')} 
        on:view={(e) => navigate('review-detail', { id: e.detail })}
        on:seeAll={() => navigate('all-reviews')} 
      />
    
    {:else if currentView === 'search'}
      <Search 
        on:back={() => navigate('dashboard')}
        on:select={(item) => navigate('guided', { id: item.id })}
      />
    
    {:else if currentView === 'guided'}
      <GuidedReview 
        movieId={viewProps.id}
        on:back={() => navigate('search')}
        on:finish={(e) => navigate('summary', e.detail)} 
      />
    
    {:else if currentView === 'summary'}
      <ReviewSummary 
        movieTitle={viewProps.movieTitle}
        aiSummary={viewProps.aiSummary}
        rating={viewProps.rating}
        detailedRatings={viewProps.detailedRatings}
        on:confirm={() => navigate('dashboard')}
      />

    {:else if currentView === 'review-detail'}
      <ReviewDetail 
        reviewId={viewProps.id}
        on:back={() => navigate('dashboard')}
      />

    <!-- Nowy Route -->
    {:else if currentView === 'all-reviews'}
      <AllReviews 
        on:back={() => navigate('dashboard')}
        on:view={(e) => navigate('review-detail', { id: e.detail })}
      />
    {/if}
  </AppLayout>
{/if}