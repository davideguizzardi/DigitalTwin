import { getIcon } from "@/Components/Commons/Constants"
import { UserContext } from "@/Layouts/UserLayout"
import { Avatar, Dropdown } from "flowbite-react"
import { DarkThemeToggle } from "flowbite-react"

import { useState, useContext } from "react"
import { useLaravelReactI18n } from "laravel-react-i18n"
import { FaUser } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { domain } from "@/Components/Commons/Constants"
import { router } from '@inertiajs/react'



export default function Navbar({ }) {

    const user = useContext(UserContext)
    const { t, setLocale, currentLocale } = useLaravelReactI18n()

    const namePage = (string) => {
        const [, path,] = string.split("/", 3)
        if (string == "/userarea")
            return "User area"
        return path.charAt(0).toUpperCase() + path.slice(1)
    }

    const submit = (e) => {
        e.preventDefault();
        router.post('/logout')
        //post(route("login"))
    }


    const linkStyle = "flex flex-row items-center gap-2 p-2 rounded-lg justify-center text-lg"




    return (
        <div className="w-full h-13 grid grid-cols-5 justify-center text-3xl bg-zinc-50 p-1 border-b border-gray-300">
            <div>

            </div>
            <div className="col-span-3 grid grid-cols-4 gap-1  items-center">

                <a href={route("home")}>
                    <div className={`${linkStyle} ${namePage(window.location.pathname) == "Home" ? "bg-lime-400" : ""}`} >
                        {getIcon("home")}
                        Home
                    </div>
                </a>
                <a href={route("consumption")} >
                    <div className={`${linkStyle} ${t(namePage(window.location.pathname)) == t("Consumption") ? "bg-lime-400" : ""}`}>
                        {getIcon("power")}
                        {t("Consumption")}
                    </div>
                </a>
                <a href={route("automation")}>
                    <div className={`${linkStyle} ${t(namePage(window.location.pathname)) == t("Automations") ? "bg-lime-400" : ""}`}>
                        {getIcon("puzzle")}
                        {t("Automations")}
                    </div>
                </a>
                <a href={route("configuration")}>
                    <div className={`${linkStyle} ${t(namePage(window.location.pathname)) == t("Configuration") ? "bg-lime-400" : ""}`}>
                        {getIcon("gear")}
                        {t("Configuration")}
                    </div>
                </a>
            </div>
            <div className="flex justify-end items-center gap-2">
                <div className="w-[0.1px] h-3/4 bg-gray-800" />
                <DarkThemeToggle className="rounded-full text-gray-800" />
                <Dropdown
                    label={<Avatar
                        size={"md"}
                        placeholderInitials={user.username}
                        alt="User settings"
                        img={user.url_photo && domain + "/" + user.url_photo}
                        rounded />}
                    arrowIcon={true}
                    inline
                >
                    <Dropdown.Header>
                        <span className="block text-sm">{user.username}</span>
                        <span className="block truncate text-sm font-medium">{user.email}</span>
                    </Dropdown.Header>
                    <Dropdown.Item icon={FaUser} href={route("userarea.get")}>Account</Dropdown.Item>
                    <Dropdown.Item icon={FiLogOut} >
                        <a onClick={(e) => { e.preventDefault(); submit(e) }} className="flex flex-col justify-center items-center">
                            <p>{t("Log out")}</p>
                        </a>
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item>
                        <div className="flex flex-row gap-2">
                            <div onClick={() => setLocale("it")}>
                                <p className={currentLocale() == "it" && "underline"}>Italiano</p>
                            </div>
                            <div onClick={() => setLocale("en")}>
                                <p className={currentLocale() == "en" && "underline"}>English</p>
                            </div>
                        </div>
                    </Dropdown.Item>
                </Dropdown>
            </div>
        </div>
    )
}
