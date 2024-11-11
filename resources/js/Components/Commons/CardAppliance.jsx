import { motion } from "framer-motion"
import IconAppliance from "./IconAppliance"
import { LightPopup } from "../ControlAppliance/LightPopup"
import { useState } from "react"
import { useEffect } from "react"
import { MediaPlayerPopup } from "../ControlAppliance/MediaPlayerPopup"
import ControlPopup from "../ControlAppliance/ControlPopup"
import { getIcon } from "./Constants"

export default function CardAppliance({ appliancePos }) {
    const [openControl, isOpenControl] = useState(false)
    const [typeAppl, ] = appliancePos.id.split(".", 2)

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
            variants={variants} initial="initial" animate="animate"
        >
            <ControlPopup applianceId={appliancePos.id} open={openControl} closeFun={closeFun} classDevice={typeAppl}/> 
            <div className="z-10"
                    style={{ cursor: "pointer", zIndex: "20" }}
                    onClick={() => isOpenControl(true)}
            >
                <IconAppliance typeAppl={typeAppl} className="z-20"
                ></IconAppliance>
            </div>
        </motion.div>
    )
}