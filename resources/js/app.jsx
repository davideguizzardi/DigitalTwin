// src/main.jsx
import './bootstrap';
import '../css/app.css';


import './i18n';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './Components/Routing/Router';

const locale = import.meta.env.VITE_LOCALE || 'it';

// Redirect globale al login quando il token scade
window.addEventListener('dt:unauthorized', () => {
  router.navigate('/login', { replace: true });
});

const langFiles = import.meta.glob('../lang/*.json');

createRoot(document.getElementById('app')).render(
    <RouterProvider router={router} />
);