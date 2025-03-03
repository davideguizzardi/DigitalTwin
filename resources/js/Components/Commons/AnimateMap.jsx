import { AnimatePresence, delay, motion } from "framer-motion"

export default function AnimateMap({ map, up = true }) {
    const offset = up ? -10 : 10

    const variants = {
        initial: {
            display: "none",
            y: offset,
            transition:{
                delay: 0.4,
                duration: 0.02
            }
        },
        animate: {
            display: "block",
            y: 0,
            transition: {
                delay: 0.1,
                duration: 0.4
            }
        },
        exit: {
            display: "none",
            opacity: 0,
            y: -offset,
            transition:{
                duration: 0.3
            }
        }
    }

    return (
            <motion.img className="" key={map} src={map}
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "65vh"
                }}
            />
    )
}