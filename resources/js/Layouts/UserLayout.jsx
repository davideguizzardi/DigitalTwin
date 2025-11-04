import { domain } from "@/Components/Commons/Constants";
import Sidebar from "@/Components/Sidebar/Sidebar"
import { motion } from "framer-motion";
import Cookies from "js-cookie";
import { createContext } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { DeviceProviderRefresh } from "@/Components/ContextProviders/DeviceProviderRefresh";
import Navbar from "@/Components/Commons/Navbar";
import { apiLog,logsEvents } from "@/Components/Commons/Constants";

export const UserContext = createContext({})

export function UserLayout({ children }) {
    const [userState, setUserState] = useState({})
    const [dark, isDark] = useState(false)
    useEffect(() => {
        const fetchUser = async () => {
            try {
                await fetch(domain + "/sanctum/csrf-cookie", {
                    method: "GET",
                    credentials: "include"
                });

                
                const response = await fetch(domain + "/api/user", {
                    method: "GET",
                    credentials: "include", 
                    headers: {
                        "X-Requested-With": "XMLHttpRequest"
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    setUserState({ ...result.user });
                    apiLog(result.user.username, logsEvents.LOGIN, "", "")
                } else {
                    console.error("User fetch failed with status", response.status);
                }
            } catch (error) {
                console.error("User fetch error:", error);
            }
        };


        fetchUser();

        const darkMode = localStorage.getItem("darkMode");
        if (darkMode === "true") {
            document.documentElement.classList.add("dark");
        } else {
            //document.documentElement.classList.remove("dark");
        }
    }, []);


    return (
        <main className="">
            <div className="overflow-auto bg-gray-300 dark:bg-gray-700 h-screen w-screen text-gray-800">
                <UserContext.Provider value={userState}>
                    {children.props.isFirstConfiguration ?
                        <div className="flex w-full justify-center">

                            <motion.div className={`h-screen justify-center w-full`}>
                                {children}
                            </motion.div>
                        </div>
                        :
                        <DeviceProviderRefresh>
                            <Navbar />
                            <div className="flex w-full justify-center overflow-auto">

                                <motion.div className={`h-[calc(100vh-3.25rem)] justify-center w-full`}>
                                    {children}
                                </motion.div>
                            </div>
                        </DeviceProviderRefresh>
                    }
                </UserContext.Provider>
            </div>
        </main>
    )
}
