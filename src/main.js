import './app.css'; // Import globalnych stylów
import App from './App.svelte';

const app = new App({
  target: document.getElementById('app'),
});

export default app;