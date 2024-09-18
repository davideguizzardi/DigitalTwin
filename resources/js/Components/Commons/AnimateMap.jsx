import { AnimatePresence, delay, motion } from "framer-motion"

export default function AnimateMap({ map, up = true }) {
    const offset = up ? -10 : 10

    const variants = {
        initial: {
            display: "none",
            y: offset,
            transition:{
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
            transition:{
                duration: 0.01
            }
        }
    }

    return (
        <AnimatePresence>
            <motion.img className='w-full' key={map} src={map}
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
            />
        </AnimatePresence>
    )
}