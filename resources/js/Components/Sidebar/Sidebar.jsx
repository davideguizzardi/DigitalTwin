import { useEffect, useState } from "react"
import { FaBars, FaX } from "react-icons/fa6";
import { AnimatePresence, delay, motion, useAnimate } from "framer-motion"
import Cookies from "js-cookie";
import { Avatar } from "flowbite-react";
import CardUser from "../Commons/CardUser";
import DarkButton from "../Commons/DarkButton";
import { useLaravelReactI18n } from 'laravel-react-i18n';

import { getIcon } from "../Commons/Constants";

export default function Sidebar() {
    const [isVisible, setVisible] = useState(false)
    const [hoverLogo, setHoverLogo] = useState(false)
    const [scopeLogo, animateLogo] = useAnimate()

    const {t} = useLaravelReactI18n()
    const namePage = (string) => {
        const [, path, ] = string.split("/", 3)
        if(string=="/userarea")
            return "User area"
        return path.charAt(0).toUpperCase() + path.slice(1)
    }

    const animationLogo = () => {
        const rotation = {
            true: "360deg",
            false: "-360deg"
        }
        animateLogo(scopeLogo.current, { rotate: rotation[isVisible] })
    }

    const logoClick = () => {
        animationLogo()
        setVisible(!isVisible)
    }

    const cancelCallback = () => {
        animationLogo()
        setVisible(false)
    }

    const styleLogoBtn = {
        zIndex: 100,
        cursor: "pointer"
    }

    const styleMenu = {
        zIndex: 80,
    }

    const styleEntry = {
        width: "80%",
        cursor: "pointer",
    }

    const menu = {
        hidden: {
            width: "0%",
            transition: {
                delay: 0.2,
                staggerChildren: 0.01,
                staggerDirection: -1
            }
        },
        visible: {
            width: "100%",
            transition: {
                delayChildren: 0.1,
                staggerChildren: 0.01
            }
        }
    }

    const entry = {
        hidden: {
            opacity: 0,
            x: -500,
        },
        visible: {
            opacity: 1,
            x: 50,
        },
    }


    useEffect(() => {
    }, [])

    return <>
        <motion.div className="absolute top-2 left-2 flex rounded-full bg-lime-400 p-3 items-center justify-center shadow-xl"
            style={styleLogoBtn} onClick={logoClick} onHoverStart={() => { setHoverLogo(true) }}
            onHoverEnd={() => { setHoverLogo(false) }}
        >
            <motion.div className="shadow-xl" ref={scopeLogo} >
                <FaBars size={24} />
            </motion.div>
            <motion.p className="text-xl pl-2">
                {namePage(window.location.pathname)=="Home" ? "Home" : t(namePage(window.location.pathname))}
            </motion.p>
        </motion.div >


        <motion.div className="absolute flex flex-col h-full"
            style={styleMenu} variants={menu} initial={false}
            animate={isVisible ? "visible" : "hidden"} onClick={cancelCallback}>
            <div className="flex flex-col h-full bg-white dark:bg-neutral-900 gap-10 shadow-2xl pt-32" style={{ width: "40%" }}>
                <motion.a href={route("home")} className="bg-slate-100 dark:bg-neutral-700 dark:text-white rounded p-3 pr-32 text-3xl size-min "
                    style={styleEntry} variants={entry} initial={false}
                >
                    Home
                </motion.a>
                <motion.a href={route("consumption")} className="bg-slate-100 dark:bg-neutral-700 dark:text-white  rounded p-3 pr-32 text-3xl size-min "
                    style={styleEntry} variants={entry} initial={false}
                >
                    {t("Consumption")}
                </motion.a>
                <motion.a href={route("automation")} className="bg-slate-100  dark:bg-neutral-700 dark:text-white  rounded p-3 pr-32 text-3xl size-min "
                    style={styleEntry} variants={entry} initial={false}
                >
                    {t("Automations")}
                </motion.a>
                <motion.a href={route("configuration")} className="bg-slate-100  dark:bg-neutral-700 dark:text-white  rounded p-3 pr-32 text-3xl size-min "
                    style={styleEntry} variants={entry} initial={false}
                >
                    {t("Configuration")}
                </motion.a>
                <motion.div className="h-full w-content flex items-end py-4"
                    variants={{
                        hidden: {opacity: 0, x:-500},
                        visible: {opacity: 1, x: 50}
                    }} initial={false}>
                    <div className="bg-slate-100 dark:bg-neutral-700 dark:text-white  p-2 rounded size-min" style={styleEntry}>
                        <CardUser/>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    </>
}