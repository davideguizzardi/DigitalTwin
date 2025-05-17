import { motion } from "framer-motion"
import IconAppliance from "./IconAppliance"
import { LightPopup } from "../ControlAppliance/LightPopup"
import { useState } from "react"
import { useEffect } from "react"
import { MediaPlayerControl } from "../ControlAppliance/MediaPlayerPopup"
import ControlPopup from "../ControlAppliance/ControlPopup"
import { getDeviceIcon, getIcon } from "./Constants"


export default function CardAppliance({ appliancePos, setClickedDevice }) {
    const [openControl, isOpenControl] = useState(false)
    const [openName, setOpenName] = useState(false)
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

    const getPower = (device) => {
        const power_entity = device.list_of_entities.find(e => e.entity_id == device.power_entity_id)
        if (power_entity) {
            return parseFloat(power_entity.state)
        } else {
            return 0
        }
    }

    const getScale=(device)=>{
        const power=getPower(device)
        return 1+(Math.min(Math.floor(power/50),6)/10)
    }

    const isActive=(appliance)=>{
        if(appliance.device_class=="sensor")
            return true

        if(appliance.power_entity_id=="")
            return appliance.state=="on"

        return getPower(appliance)>1
    }

    return (
        <motion.div
            className={`absolute rounded-full bg-gray-200`}
            style={{
                top: appliancePos.top + "%", 
                left: appliancePos.left + "%",
            }}
            variants={variants}
            initial="initial" 
            animate="animate"
            onHoverStart={() => setOpenName(true)} 
            onHoverEnd={() => setOpenName(false)}
        >
            <div className={`flex flex-row gap-1 items-center scale-[${getScale(appliancePos)}]`}
                style={{ cursor: "pointer", zIndex: "20" }}
                onClick={() => setClickedDevice(appliancePos)}
            >

                {getDeviceIcon(appliancePos.category, "size-9", isActive(appliancePos))}
                {openName && false &&
                    appliancePos.name
                }
            </div>
        </motion.div>
    )
}