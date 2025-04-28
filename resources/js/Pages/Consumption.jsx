import { useState ,useContext} from "react"
import { animate, AnimatePresence, motion, useAnimate } from "framer-motion"
import { ConsumptionComparisonGraph } from "@/Components/Consumption/ConsumptionComparisonGraph"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { backend } from "@/Components/Commons/Constants"
import { TotalConsumptionGraph } from "@/Components/Consumption/TotalConsumptionGraph"
import { ConsumptionPredictionGraph } from "@/Components/Consumption/ConsumptionPredictionGraph"
import WhiteCard from "@/Components/Commons/WhiteCard"
import TabLayout from "@/Layouts/TabLayout"
import { DeviceContextRefresh } from "@/Components/ContextProviders/DeviceProviderRefresh"

export default function Consumption() {
    const [tab, setTab] = useState(0)
    const [previousTab, setPreviousTab] = useState(0)
    const [scopeTotal, animateTotal] = useAnimate()
    const [scopePredicted, animatePredicted] = useAnimate()
    const [scopeDevice, animateDevice] = useAnimate()
    const [scopeAutomation, animateAutomation] = useAnimate()
    const {deviceList}=useContext(DeviceContextRefresh)

    const scopes = [scopeTotal, scopePredicted, scopeDevice, scopeAutomation]

    const offset = 1900

    const variants = {
        initial: {
            x: (tab < previousTab ? -offset : offset),
            display: "none",
            opacity: 0.8,
        },
        animate: {
            display: "block",
            x: 0,
            opacity: 1,
            transition: {
                ease: "linear",
                duration: 0.25,
                delay: 0.25
            }
        },
        exit: {
            display: "none",
            opacity: 0.8,
            transition: {
                ease: "linear",
                duration: 0.25,
            }
        }
    }

    const handleClickTab = (ntab) => {
        if (ntab != tab) {
            animate(scopes[tab].current,
                { x: (tab < ntab ? -offset : offset) },
                { duration: 0.25 }
            )
            setPreviousTab(tab)
            setTab(ntab)
        }
    }

    const sections = {
        "Total energy consumption": (
            <TotalConsumptionGraph device_list={deviceList.filter(d=>d.show)} />
        ),
        "Predicted consumption": (<ConsumptionPredictionGraph url_in={`/prediction/recursive`} future_steps={12} />),
        "Consumption comparison": (<ConsumptionComparisonGraph device_list={deviceList.filter(d=>d.show)} />),
    }

    return (
        <div className="size-full flex flex-col p-3">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TabLayout sections={sections}/>        
            </LocalizationProvider>
        </div>
    )
}