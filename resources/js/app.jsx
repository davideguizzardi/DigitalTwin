import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { UserLayout } from './Layouts/UserLayout';
import GuestLayout from './Layouts/GuestLayout';
import { LaravelReactI18nProvider } from 'laravel-react-i18n';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
const locale = import.meta.env.VITE_LOCALE;

const pages = import.meta.glob('./Pages/**/*.jsx');
const langFiles = import.meta.glob('../lang/*.json');

createInertiaApp({
  title: (title) => `${title} - ${appName}`,

  // Async resolve to handle dynamic imports in production
  resolve: async (name) => {
    const importPage = pages[`./Pages/${name}.jsx`];
    if (!importPage) {
      throw new Error(`Page not found: ${name}`);
    }

    const pageModule = await importPage();

    pageModule.default.layout = name.startsWith('Auth/')
      ? (page) => <GuestLayout>{page}</GuestLayout>
      : (page) => <UserLayout>{page}</UserLayout>;

    return pageModule;
  },

  setup({ el, App, props }) {
    const root = createRoot(el);

    root.render(
      <LaravelReactI18nProvider
        locale={locale}
        fallbackLocale="it"
        files={langFiles}
      >
        <App {...props} />
      </LaravelReactI18nProvider>
    );
  },

  progress: {
    color: '#4B5563',
  },
});
