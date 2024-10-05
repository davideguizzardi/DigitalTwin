import { ThemeButton } from "@/Components/Commons/ThemeButton";
import { useState } from "react";
import { FaLightbulb, FaBolt } from "react-icons/fa6";
import ConfigurationAppliance from "./ConfigurationAppliance";
import ConfigurationEnergyPlan from "./ConfigurationEnergyPlan";
import { AnimatePresence, delay, motion } from "framer-motion";
import TabLayout from "@/Layouts/TabLayout";
import SubMenuLayout from "@/Layouts/SubMenuLayout";

export default function RoutineConfiguration() {
    const [section, setSection] = useState(0)

    const endSection = () => {
        alert("Updates have been saved")
    }

    const sections = {
        "Configure Appliance" : 
            (<ConfigurationAppliance editMode={true} endSection={endSection} />),
        "Configure Energy Plan" :
            (<ConfigurationEnergyPlan endSection={endSection} />)
    }

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

    return (
        <div className="size-full flex flex-col">
            <div className="py-8 w-full"></div>
            <TabLayout sections={sections}/>
        </div>
    )
}
