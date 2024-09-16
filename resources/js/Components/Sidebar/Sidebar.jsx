import { useEffect, useState } from "react"
import { FaBars } from "react-icons/fa6";
import { AnimatePresence, delay, motion, useAnimate } from "framer-motion"
import Cookies from "js-cookie";
import { Avatar } from "flowbite-react";

export default function Sidebar() {
    const [isVisible, setVisible] = useState(false)
    const [hoverLogo, setHoverLogo] = useState(false)
    const [scopeLogo, animateLogo] = useAnimate()
    const [userState, setUserState] = useState({})

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
        opacity: 0.96
    }

    const styleEntry = {
        width: "400px",
        cursor: "pointer",
    }

    const logoText = {
        hidden: {
            width: "0px",
            opacity: 0,
        },
        visible: {
            width: "120px",
            opacity: 1,
        }
    }

    const logoDiv = {
        hidden: {
            width: "0px",
            paddingLeft: "0px",
            opacity: 0,
            transition: {
                delayChildren: 1
            }
        },
        visible: {
            width: "120px",
            paddingLeft: "8px",
            opacity: 1,
            transition: {
                when: "beforeChildren"
            }
        }
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
            x: -100,
        },
        visible: {
            opacity: 1,
            x: 100,
        }
    }


    useEffect(() => {
        const fetchUser = async () => {
            const token = Cookies.get("auth-token")
            const response = await fetch("http://localhost/api/user", {
                headers: { 'Authorization': 'Bearer ' + token }
            })
            const result = await response.json()
            const user = result.user
            setUserState({ ...user, url_photo: user.url_photo + "?t=" + Date.now() })
        }
        fetchUser()
    }, [])

    return <>
        <motion.div className="absolute flex rounded-full bg-lime-400 p-3 m-3 items-center "
            style={styleLogoBtn} onClick={logoClick} onHoverStart={() => { setHoverLogo(true) }}
            onHoverEnd={() => { setHoverLogo(false) }}
        >
            <motion.div ref={scopeLogo} >
                <FaBars size={24} />
            </motion.div>
            <motion.div variants={logoDiv} animate={hoverLogo ? "visible" : "hidden"}>
                <motion.p className="text-xl"
                    initial={"hidden"}
                    animate={"visible"}
                    exit={"hidden"}
                    variants={logoText}
                    style={{ height: "32px" }}
                >
                    Digital twin
                </motion.p>
            </motion.div>
        </motion.div >


        <motion.ul className="absolute flex flex-col bg-white h-full pt-32 gap-10 "
            style={styleMenu} variants={menu} initial={false}
            animate={isVisible ? "visible" : "hidden"} onClick={cancelCallback}>
            <motion.li className="bg-slate-100 rounded p-3 pr-32 text-3xl size-min "
                style={styleEntry} variants={entry} initial={false}
            >
                <a href={route("dashboard")}>Dashboard</a>
            </motion.li>
            <motion.li className="bg-slate-100 rounded p-3 pr-32 text-3xl size-min "
                style={styleEntry} variants={entry} initial={false}
            >
                <a href="#">Consumption</a>
            </motion.li>
            <motion.li className="bg-slate-100 rounded p-3 pr-32 text-3xl size-min "
                style={styleEntry} variants={entry} initial={false}
            >
                <a href="#">Automations</a>
            </motion.li>
            <motion.li className="bg-slate-100 rounded p-3 pr-32 text-3xl size-min "
                style={styleEntry} variants={entry} initial={false}
            >
                <a href={route("configuration")}>Configuration</a>
            </motion.li>
        </motion.ul>
        <motion.div className="absolute bottom-3 right-3" whileHover={{scale: 1.2}}>
            <a href={route("userarea.get")}>
                <Avatar rounded style={{ zIndex: 100 }}
                    size={"lg"} img={userState.url_photo} />
            </a>
        </motion.div>

    </>
}