import { useEffect, useState } from "react"
import { FaBars, FaX } from "react-icons/fa6";
import { AnimatePresence, delay, motion, useAnimate } from "framer-motion"
import Cookies from "js-cookie";
import { Avatar } from "flowbite-react";

export default function Sidebar() {
    const [isVisible, setVisible] = useState(false)
    const [hoverLogo, setHoverLogo] = useState(false)
    const [scopeLogo, animateLogo] = useAnimate()
    const [userState, setUserState] = useState("")

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
            x: -500,
        },
        visible: {
            opacity: 1,
            x: 100,
        },
        hover: {
            opacity: 1,
            x: 170,
        }
    }


    useEffect(() => {
        const fetchUser = async () => {
            const token = Cookies.get("auth-token")
            const response = await fetch("http://localhost/api/user", {
                headers: { 'Authorization': 'Bearer ' + token }
            })
            response.json().then((result) => {
                const user = result.user
                if (user.url_photo !== null)
                    setUserState(user.url_photo)
            })
        }
        fetchUser()
    }, [])

    return <>
        <motion.div className="absolute top-2 left-2 flex rounded-full bg-lime-400 p-3 items-center shadow-xl"
            style={styleLogoBtn} onClick={logoClick} onHoverStart={() => { setHoverLogo(true) }}
            onHoverEnd={() => { setHoverLogo(false) }}
        >
            <motion.div className="shadow-xl" ref={scopeLogo} >
                <FaBars size={24} />
            </motion.div>
            <motion.div variants={logoDiv} animate={hoverLogo ? "visible" : "hidden"}>
                <motion.p className="text-xl"
                    initial={"hidden"}
                    animate={"visible"}
                    exit={"hidden"}
                    variants={logoText}
                    style={{ height: "24px" }}
                >
                    Digital twin
                </motion.p>
            </motion.div>
        </motion.div >


        <motion.div className="absolute flex flex-col h-full"
            style={styleMenu} variants={menu} initial={false}
            animate={isVisible ? "visible" : "hidden"} onClick={cancelCallback}>
            <div className="flex flex-col h-full bg-white  pt-32 gap-10 shadow-2xl " style={{ width: "66%" }}>
                <motion.a href={route("dashboard")} className="bg-slate-100 rounded p-3 pr-32 text-3xl size-min "
                    style={styleEntry} variants={entry} initial={false}
                    hover="hover"
                >
                    Dashboard
                </motion.a>
                <motion.a href={route("consumption")} className="bg-slate-100 rounded p-3 pr-32 text-3xl size-min "
                    style={styleEntry} variants={entry} initial={false}
                    hover={"hover"}
                >
                    Consumption
                </motion.a>
                <motion.a href={"#"} className="bg-slate-100 rounded p-3 pr-32 text-3xl size-min "
                    style={styleEntry} variants={entry} initial={false}
                    hover={"hover"}
                >
                    Automations
                </motion.a>
                <motion.a href={route("configuration")} className="bg-slate-100 rounded p-3 pr-32 text-3xl size-min "
                    style={styleEntry} variants={entry} initial={false}
                    hover={"hover"}
                >
                    Configuration
                </motion.a>
                <div className="size-full flex relative">
                    <motion.div className="absolute bottom-3 right-3 shadow-xl bg-white rounded-full" whileHover={{ scale: 1.2 }}
                        style={{ zIndex: 100 }} >
                        <a href={route("userarea.get")}>
                            {userState == "" ?
                                <Avatar className="bg-slate-200 rounded-full "  size={"lg"} />
                                :
                                <Avatar className="bg-slate-200 rounded-full" size={"lg"} img={userState} />
                            }
                        </a>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    </>
}