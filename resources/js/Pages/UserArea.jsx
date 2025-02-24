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

const token = Cookies.get("auth-token")

export default function UserArea({ }) {
    const user = useContext(UserContext)
    const { data, setData, post } = useForm({ user })
    const [tab, setTab] = useState(0)
    const mapTab = {
        "Profile":<Profile />,
        "Privacy":<PermissionPrivacy />
    }


    const handleLogout = async () => {
        const response = await fetch(route("user.logout"), {
            headers: {
                "Authorization": "Bearer " + token
            }
        })
        if (response.ok) {
            const result = await response.json()
            console.log(result)
        } else {
            console.log(response.status)
        }
        post(route('logout'));
    }


    return (
        <div className="flex flex-col min-h-fit size-full p-5 gap-2">
            <Profile2/>
            {/*<TabLayout sections={mapTab}/>*/}
        </div>
    )
}