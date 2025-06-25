import Cookies from "js-cookie"
import Preferences from "@/Components/UserArea/Preferences"
import { motion } from "framer-motion"
import WhiteCard from "@/Components/Commons/WhiteCard"
import CardUser from "@/Components/Commons/CardUser"
import { useContext } from "react"
import { UserContext } from "@/Layouts/UserLayout"
import { useState } from "react"
import Profile from "@/Components/UserArea/Profile"
import DarkButton from "@/Components/Commons/DarkButton"
import PermissionPrivacy from "@/Components/UserArea/PermissionPrivacy"
import { useForm } from "@inertiajs/react"
import SubMenuLayout from "@/Layouts/SubMenuLayout"
import TabLayout from "@/Layouts/TabLayout"
import Profile2 from "@/Components/UserArea/Profile2"



export default function UserArea({ }) {
    const user = useContext(UserContext)
    const { data, setData, post } = useForm({ user })
    const [tab, setTab] = useState(0)
    const mapTab = {
        "Profile": <Profile />,
        "Privacy": <PermissionPrivacy />
    }


    const handleLogout = async () => {
        try {
            const response = await fetch(route("user.logout"), {
                method: "GET",
                credentials: "include", 
                headers: {
                    "Accept": "application/json",
                },
            });

            if (response.ok) {
                const result = await response.json();
                console.log(result);

                
                Cookies.remove('digitaltwin_session', { path: '/' });
                Cookies.remove('XSRF-TOKEN', { path: '/' });

                
                post(route('logout')); 

            } else {
                console.error("Logout failed with status:", response.status);
            }
        } catch (error) {
            console.error("Logout error:", error);
        }
    };



    return (
        <div className="flex flex-col min-h-fit size-full p-5 gap-2">
            <Profile2 />
            {/*<TabLayout sections={mapTab}/>*/}
        </div>
    )
}