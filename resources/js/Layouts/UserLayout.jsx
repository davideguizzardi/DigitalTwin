import Sidebar from "@/Components/Sidebar/Sidebar"
import { motion } from "framer-motion";
import Cookies from "js-cookie";
import { createContext } from "react";
import { useState } from "react";
import { useEffect } from "react";

const token = Cookies.get("auth-token")

export const UserContext = createContext({})

export function UserLayout({ children }) {
    const [userState, setUserState] = useState({})
    const [dark, isDark] = useState(false)
    useEffect(() => {
        const fetchUser = async () => {
            const response = await fetch("http://localhost/api/user", {
                headers: {"Authorization" : "Bearer " + token}
            })
            if(response.ok){
                const result = await response.json()
                setUserState({...result.user})
            }
        }
        fetchUser()
        const darkMode = localStorage.getItem("darkMode")
        if(darkMode=="true"){
            document.documentElement.classList.add("dark")
        }else{
            document.documentElement.classList.remove("dark")
        }
    }, [])

    return (
        <main>
            <div className="overflow-x-hidden bg-gray-100 dark:bg-neutral-800 ">
                <UserContext.Provider value={userState}>
                    <div className="h-full relative min-h-screen lg:h-screen flex flex-grow-1">
                        <Sidebar />
                        <motion.div className="size-full min-h-fit p-1 justify-center overflow-y-scroll ">
                            {children}
                        </motion.div>
                    </div>
                </UserContext.Provider>
            </div>
        </main>
    )
}
