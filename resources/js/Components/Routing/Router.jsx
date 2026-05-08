// src/router.jsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { tokenStorage } from '@/Api';

import { UserLayout } from '@/Layouts/UserLayout';
import GuestLayout from '@/Layouts/GuestLayout';
// Pages
import Login from '@/Pages/Auth/Login';
import Dashboard3 from '@/Pages/Dashboard3';
import Configuration from '@/Pages/Configuration';
import UserArea from '@/Pages/UserArea';
import Consumption from '@/Pages/Consumption';
import Automation from '@/Pages/Automation';
import AddAutomation from '@/Pages/AddAutomation';
import RoomConfiguration from '@/Pages/RoomConfiguration';
import FirstConfigurationPage from '@/Pages/FirstConfigurationPage';
import DeviceSimulation from '@/Pages/DeviceSimulation';

// Guard per le route protette
const PrivateRoute = ({ children }) => {
    return tokenStorage.get() ? children : <Navigate to="/login" replace />;
};

export const router = createBrowserRouter([
    // Redirect root
    {
        path: '/',
        element: <Navigate to="/home" replace />,
    },

    // Pubbliche
    {
        element: <GuestLayout />,
        children: [
            { path: '/login', element: <Login /> },
        ],
    },



    // Protette

    {
        element: <PrivateRoute><UserLayout /></PrivateRoute>,
        children: [
            {
                path: '/home/:firstAccess?',
                element: <PrivateRoute><Dashboard3 /></PrivateRoute>,
            },
            {
                path: '/configuration',
                element: <PrivateRoute><Configuration /></PrivateRoute>,
            },
            {
                path: '/userarea',
                element: <PrivateRoute><UserArea /></PrivateRoute>,
            },
            {
                path: '/consumption',
                element: <PrivateRoute><Consumption /></PrivateRoute>,
            },
            {
                path: '/automation/:id?',
                element: <PrivateRoute><Automation /></PrivateRoute>,
            },
            {
                path: '/automation_add',
                element: <PrivateRoute><AddAutomation /></PrivateRoute>,
            },
            {
                path: '/room',
                element: <PrivateRoute><RoomConfiguration /></PrivateRoute>,
            },
            {
                path: '/first-configuration',
                element: <PrivateRoute><FirstConfigurationPage /></PrivateRoute>,
            },
            {
                path: '/simulation',
                element: <PrivateRoute><DeviceSimulation /></PrivateRoute>,
            }
        ],
    },

    // Fallback
    {
        path: '*',
        element: <Navigate to="/home" replace />,
    },
]);