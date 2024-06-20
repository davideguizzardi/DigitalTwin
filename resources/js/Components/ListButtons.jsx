import { useCallback } from "react"
import { ThemeButton } from "./ThemeButton"
import { motion } from "framer-motion"

export default function listButtons({ dataButtons, index }) {
    console.log(dataButtons)
    const buttons = dataButtons.map((dataBtn, i) => (
        <motion.div 
            className="my-2 size-min"
            whileHover={{scale: 1.2}}
            key={"div_" + i}
        >
            <ThemeButton className={index==i ? " bg-lime-300": ""} 
            key={dataBtn.text} pill onClick={dataBtn.callback}>
                {dataBtn.text} {dataBtn.icon}
            </ThemeButton>
        </motion.div>
    ))

    return (
        <div className="flex flex-col justify-center w-min m-2 p-1 rounded-full bg-gray-100 shadow">
            {buttons}
        </div>
    )
}