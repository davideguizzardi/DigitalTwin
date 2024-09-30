import { useCallback } from "react"
import { ThemeButton } from "@/Components/Commons/ThemeButton"
import { motion } from "framer-motion"

export default function listButtons({ dataButtons, index=null, vertical=true }) {
    const buttons = dataButtons.map((dataBtn, i) => (
        <motion.div 
            className="size-min"
            whileHover={{scale: "1.2", zIndex: "50"}}
            key={"div_" + i}
        >
            <ThemeButton className={index==i ? " bg-lime-500": ""} 
            key={dataBtn.text} pill onClick={dataBtn.callback}>
                <div className="flex justify-center items-center gap-1">
                    {dataBtn.icon} <h1 className="text-center">{dataBtn.text}</h1>
                </div>
            </ThemeButton>
        </motion.div>
    ))

    return (
        <div className={"flex justify-center items-center gap-2 w-min m-2 p-2 rounded-full bg-slate-100 dark:bg-neutral-700 shadow " + (vertical && " flex-col") }>
            {buttons}
        </div>
    )
}