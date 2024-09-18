import { ThemeButton } from "@/Components/Commons/ThemeButton";
import { useState } from "react";
import { FaLightbulb, FaBolt } from "react-icons/fa6";
import ConfigurationAppliance from "./ConfigurationAppliance";
import ConfigurationEnergyPlan from "./ConfigurationEnergyPlan";
import { AnimatePresence, delay, motion } from "framer-motion";

export default function RoutineConfiguration() {
    const [section, setSection] = useState(0)

    const variantsAppliance = {
        initial: {
            display: "none",
            opacity: 0.8,
            x: -20,
        },
        animate: {
            display: "block",
            opacity: 1,
            x: 0,
            transition: {
                delay: 0.3,
                duration: 0.2
            }
        },
        exit: {
            display: "none",
            opacity: 0.8,
            x: -20,
            transition: {
                duration: 0.2
            }
        }
    }
    const variantsEnergy = {
        initial: {
            display: "none",
            x: 20,
            transition: {
                duration: 0.3
            }
        },
        animate: {
            display: "block",
            x: 0,
            transition: {
                delay: 0.3,
                duration: 0.3
            }
        },
        exit: {
            display: "none",
            x: 20,
            transition: {
                duration: 0.2
            }
        }
    }

    const endSection = () => {
        alert("Updates have been saved")
    }
    return (
        <div className="size-full flex flex-col">
            <div className="w-full flex justify-center pb-2">
                <div className={"flex items-center p-3 m-1 shadow rounded " + 
                (section==0 ? " bg-green-200 ":" bg-white " )}
                    onClick={() => setSection(0)} style={{ cursor: "pointer" }}>
                    <FaLightbulb size={32}></FaLightbulb>
                    <h1>Appliance</h1>
                </div>
                <div className={"p-3 m-1 shadow rounded flex items-center " +
                (section==1 ? " bg-green-200 ":" bg-white " )}
                    onClick={() => setSection(1)} style={{ cursor: "pointer" }}>
                    <FaBolt size={32}></FaBolt>
                    <h1>Energy Plan</h1>
                </div>
            </div>
            <AnimatePresence>
                {section == 0 ?
                    <motion.div className="size-full"
                        variants={variantsAppliance} initial="initial"
                        animate="animate" exit="exit" key={section}
                    >
                        <ConfigurationAppliance editMode={true} endSection={endSection} />
                    </motion.div>
                    :
                    <motion.div className="size-full"
                        variants={variantsEnergy} initial="initial"
                        animate="animate" exit="exit" key={section}
                    >
                        <ConfigurationEnergyPlan endSection={endSection} />
                    </motion.div>
                }
            </AnimatePresence>
        </div>
    )
}
