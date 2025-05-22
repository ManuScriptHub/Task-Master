import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from './lib/queryClient';
import { initializeAuth } from './stores/authStore';
import App from './App';
import './index.css';

// Initialize authentication on app startup
// Since initializeAuth is async, we'll call it but not wait for it to complete
// The auth state will be updated when it completes
initializeAuth().catch(error => {
  console.error("Failed to initialize authentication:", error);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);