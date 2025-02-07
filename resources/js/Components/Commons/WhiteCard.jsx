import { duration } from "@mui/material"
import { motion } from "framer-motion"

export default function WhiteCard({children, className="", direction="none"}){
    const offset = direction == "top" || direction =="left" ? -500: 500
    const variants ={
        initial: {
            y: direction=="top" || direction=="bottom"  ? offset : 0,
            x: direction=="left" || direction=="right" ? offset : 0,
        },
        animate: {
            y: 0,
            x: 0,
            transition: {duration: 0.3, delay:0.1}
        },
        exit: {
            y: direction=="top" || direction=="bottom"  ? offset : 0,
            x: direction=="left" || direction=="right" ? offset : 0
        }
    }
    return (
        <motion.div className={"flex bg-zinc-50 dark:bg-neutral-900 shadow-md dark:border-black rounded-md " + className} 
        variants={variants} initial="initial" animate="animate" exit="exit">
            {children}
        </motion.div>
    )
}