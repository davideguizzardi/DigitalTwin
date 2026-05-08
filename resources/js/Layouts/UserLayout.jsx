import { domain, logsEvents } from "@/Components/Commons/Constants";
import Sidebar from "@/Components/Sidebar/Sidebar";
import { motion } from "framer-motion";
import { createContext, useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { DeviceProviderRefresh } from "@/Components/ContextProviders/DeviceProviderRefresh";
import Navbar from "@/Components/Commons/Navbar";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { authService, logService } from "@/Api";

export const UserContext = createContext({});

// Route che non mostrano Navbar/Sidebar (layout a schermo intero)
const FULLSCREEN_ROUTES = ["/first-configuration"];

export function UserLayout() {
    const [userState, setUserState] = useState({});
    const location = useLocation();


    const isFullscreenRoute = FULLSCREEN_ROUTES.includes(location.pathname);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const result = await authService.me();
                setUserState(result);

                logService.add([{
                    actor: result.email,
                    event: logsEvents.LOGIN,
                    target: "",
                    payload: "",
                }]);
            } catch (error) {
                console.error("User fetch error:", error);
                // il 401 viene già gestito da api.js → redirect a /login
            }
        };

        //fetchUser();

        // Leggi l'utente selezionato al login
        const savedUser = localStorage.getItem('dt_selected_user');
        const selectedUser = savedUser ? JSON.parse(savedUser) : null;
        setUserState(selectedUser)

        // Dark mode
        const darkMode = localStorage.getItem("darkMode");
        if (darkMode === "true") {
            document.documentElement.classList.add("dark");
        }
    }, []);

    return (
        <main>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <div className="overflow-hidden bg-gray-300 dark:bg-gray-700 h-screen w-screen text-gray-800">
                    <UserContext.Provider value={userState}>
                        {isFullscreenRoute ? (
                            // Layout senza Navbar (es. /first-configuration)
                            <div className="flex w-full justify-center">
                                <motion.div className="h-screen justify-center w-full">
                                    <Outlet />
                                </motion.div>
                            </div>
                        ) : (
                            // Layout normale con Navbar
                            <DeviceProviderRefresh>
                                <Navbar />
                                <div className="flex w-full justify-center overflow-auto">
                                    <motion.div className="h-[calc(100vh-3.25rem)] justify-center w-full">
                                        <Outlet />
                                    </motion.div>
                                </div>
                            </DeviceProviderRefresh>
                        )}
                    </UserContext.Provider>
                </div>
            </LocalizationProvider>
        </main>
    );
}