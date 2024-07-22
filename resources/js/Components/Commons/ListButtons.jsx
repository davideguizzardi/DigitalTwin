import { useCallback } from "react"
import { ThemeButton } from "@/Components/Commons/ThemeButton"
import { motion } from "framer-motion"

export default function listButtons({ dataButtons, index, vertical=true }) {
    const buttons = dataButtons.map((dataBtn, i) => (
        <motion.div 
            className="size-min"
            whileHover={{scale: 1.2}}
            key={"div_" + i}
        >
            <ThemeButton className={index==i ? " bg-lime-500": ""} 
            key={dataBtn.text} pill onClick={dataBtn.callback}>
                {dataBtn.text} {dataBtn.icon}
            </ThemeButton>
        </motion.div>
    ))

    return (
        <div className={"flex justify-center items-center gap-2 w-min m-2 p-1 rounded-full bg-gray-100 shadow " + (vertical && " flex-col") }>
            {buttons}
        </div>
    )
}