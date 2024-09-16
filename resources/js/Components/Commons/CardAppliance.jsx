import { motion } from "framer-motion"
import IconAppliance from "./IconAppliance"

export default function CardAppliance({appliance}){
    const [typeAppl, name] = appliance.id.split(".", 2)

    return (
        <motion.div
        className="absolute py-1 bg-white z-10"
        style={{top: appliance.top +"%", left: appliance.left +"%"}}
        >
        <IconAppliance typeAppl={typeAppl}></IconAppliance>
        </motion.div>
    )
}