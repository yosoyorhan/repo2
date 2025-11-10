import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { Toaster } from '@/components/ui/toaster';
import { BrowserRouter, HashRouter } from 'react-router-dom';

// GitHub Pages altında alt dizin ("/repo2/") kullanıldığı için
// doğrudan yenilemelerde 404 almamak adına hash tabanlı router'a düş.
// Lokal veya kök domeinde ("/") BrowserRouter kullanmaya devam et.
const isGhPages = import.meta.env.BASE_URL && import.meta.env.BASE_URL !== '/';
const Router = isGhPages ? HashRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <Router basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <App />
        <Toaster />
      </AuthProvider>
    </Router>
  </>
);