import { motion } from "framer-motion"
import IconAppliance from "./IconAppliance"

export default function CardAppliance({ appliance }) {
    const [typeAppl, name] = appliance.id.split(".", 2)

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

    return (
        <motion.div
            className="absolute py-1 rounded-full p-1 bg-white z-10"
            style={{ top: appliance.top + "%", left: appliance.left + "%" }}
            variants={variants} initial="initial" animate="animate"
        >
            <IconAppliance typeAppl={typeAppl}></IconAppliance>
        </motion.div>
    )
}