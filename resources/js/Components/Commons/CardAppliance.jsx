import { motion } from "framer-motion"
import IconAppliance from "./IconAppliance"
import { LightPopup } from "../ControlAppliance/LightPopup"
import { useState } from "react"
import { useEffect } from "react"
import { MediaPlayerControl } from "../ControlAppliance/MediaPlayerPopup"
import ControlPopup from "../ControlAppliance/ControlPopup"
import { getDeviceIcon, getIcon } from "./Constants"


export default function CardAppliance({ appliancePos,setClickedDevice }) {
    const [openControl, isOpenControl] = useState(false)
    const [openName,setOpenName]=useState(false)
    //const [typeAppl,] = appliancePos.id.split(".", 2)

    const variants = {
        initial: {
            opacity: 0.7,
            rotate: "-120deg",
            transition: {
                delay: 0.3
            }
        },
        animate: {
            opacity: 1,
            rotate: "0deg",
            transition: {
                duration: 0.3
            }

        }
    }

    const closeFun = () => {
        isOpenControl(false)

    }

    return (
        <motion.div
            className="absolute rounded-full p-1 bg-gray-200"
            style={{ top: appliancePos.top + "%", left: appliancePos.left + "%" }}
            variants={variants} initial="initial" animate="animate" onHoverStart={()=>setOpenName(true)} onHoverEnd={()=>setOpenName(false)}
        >
            <div className="z-10 flex flex-row gap-1 items-center"
                style={{ cursor: "pointer", zIndex: "20" }}
                onClick={() => setClickedDevice(appliancePos)}
            >

                {getDeviceIcon(appliancePos.category)}
                {openName &&
                    appliancePos.name
                }
            </div>
        </motion.div>
    )
}