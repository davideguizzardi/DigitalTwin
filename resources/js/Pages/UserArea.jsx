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

const token = Cookies.get("auth-token")

export default function UserArea({ }) {
    const user = useContext(UserContext)
    const { data, setData, post } = useForm({ user })
    const [tab, setTab] = useState(0)
    const arrayTab = [
        <Profile />,
        <div />,
        <div />,
        <PermissionPrivacy />
    ]


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
        <div className="flex flex-col min-h-fit size-full p-1 gap-2">
            <div className="w-full flex justify-between text-center text-2xl px-2 py-1">
                <div />
                <h1 className="dark:text-white">
                    User Area
                </h1>
                <DarkButton />
            </div>
            <div className="gap-2 flex size-full">
                <WhiteCard className="h-full flex-col gap-2 p-2 w-1/6">
                    <div className={"w-full text-xl p-3 rounded dark:text-white " + (tab == 0 ? " bg-slate-200 dark:bg-neutral-800 " : " dark:bg-neutral-900")}
                        style={{ cursor: "pointer" }}
                        onClick={() => { tab != 0 && setTab(0) }}
                    >Profile</div>
                    <div className={"w-full text-xl p-3 rounded  dark:text-white " + (tab == 1 ? " bg-slate-200 dark:bg-neutral-800 " : " dark:bg-neutral-900")}
                        onClick={() => { tab != 1 && setTab(1) }}
                        style={{ cursor: "pointer" }}
                    >Notification</div>
                    <div className={"w-full text-xl p-3 rounded dark:text-white " + (tab == 2 ? " bg-slate-200 dark:bg-neutral-800 " : " dark:bg-neutral-900")}
                        onClick={() => { tab != 2 && setTab(2) }}
                        style={{ cursor: "pointer" }}
                    >History</div>
                    <div className={"w-full text-xl p-3 rounded dark:text-white " + (tab == 3 ? " bg-slate-200 dark:bg-neutral-800 " : " dark:bg-neutral-900")}
                        style={{ cursor: "pointer" }}
                        onClick={() => { tab != 3 && setTab(3) }}
                    >Privacy</div>
                    <div className={"size-full flex items-end text-xl dark:text-white"}
                    >
                        <p className="w-full bg-slate-200 dark:bg-neutral-800 p-3 rounded" style={{ cursor: "pointer" }}
                            onClick={handleLogout}
                        >Logout</p>
                    </div>
                </WhiteCard>
                <div className="flex size-full">
                    {arrayTab[tab]}
                </div>

            </div>
        </div>
    )
}