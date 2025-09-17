import { useCallback } from "react"
import { StyledButton } from "@/Components/Commons/StyledBasedComponents"
import { motion } from "framer-motion"

export default function listButtons({ dataButtons, index = null, vertical = true }) {
    const buttons =
        dataButtons.map((dataBtn, i) => (
            <motion.div
                className="size-min"
                whileHover={{ scale: "1.2", zIndex: "50" }}
                key={"div_" + i}
            >
                <StyledButton className={index == i ? " bg-blue-500" : ""}
                    key={dataBtn.text} pill onClick={dataBtn.callback}>
                    <div className="flex justify-center items-center gap-1">
                        {dataBtn.icon} <h1 className="text-center">{dataBtn.text}</h1>
                    </div>
                </StyledButton>
            </motion.div>
        ))

    return (
        <div className={"flex justify-center items-center gap-2 w-min m-2 p-2 rounded-full bg-slate-100 dark:bg-neutral-700 shadow " + (vertical && " flex-col")}>
            {
                dataButtons.map((dataBtn, i) => (
                    <motion.div
                        className="size-min"
                        whileHover={{ scale: "1.2", zIndex: "50" }}
                        key={"div_" + i}
                    >
                        <StyledButton className={index == i ? " bg-lime-600 dark:bg-lime-600 scale-125" : ""}
                            key={dataBtn.text} pill onClick={dataBtn.callback}>
                            <div className="flex justify-center items-center gap-1">
                                {dataBtn.icon} <h1 className="text-center">{dataBtn.text}</h1>
                            </div>
                        </StyledButton>
                    </motion.div>
                ))
            }
        </div>
    )
}