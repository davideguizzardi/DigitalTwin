// src/main.jsx
import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { LaravelReactI18nProvider } from 'laravel-react-i18n';
import { router } from './Components/Routing/Router';

const locale = import.meta.env.VITE_LOCALE || 'it';

// Redirect globale al login quando il token scade
window.addEventListener('dt:unauthorized', () => {
  router.navigate('/login', { replace: true });
});

const langFiles = import.meta.glob('../lang/*.json');

createRoot(document.getElementById('app')).render(
  <LaravelReactI18nProvider
    locale={locale}
    fallbackLocale="en"
    files={langFiles}
  >
    <RouterProvider router={router} />
  </LaravelReactI18nProvider>
);