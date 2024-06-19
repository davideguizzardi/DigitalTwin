import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import UserLayout from './Layouts/UserLayout';
import GuestLayout from './Layouts/GuestLayout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true })
        let page = pages[`./Pages/${name}.jsx`]
        page.default.layout = name.startsWith('Auth/') ? 
            page => <GuestLayout children={page} /> :
            page => <UserLayout children={page} />
        return page
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
