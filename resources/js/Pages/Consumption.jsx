import { useState } from "react"
import { animate, AnimatePresence, motion, useAnimate } from "framer-motion"
import { ConsumptionComparisonGraph } from "@/Components/Consumption/ConsumptionComparisonGraph"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { TotalConsumptionGraph } from "@/Components/Consumption/TotalConsumptionGraph"

export default function Consumption() {
    const [tab, setTab] = useState(0)
    const [previousTab, setPreviousTab] = useState(0)
    const [scopeTotal, animateTotal] = useAnimate()
    const [scopePredicted, animatePredicted] = useAnimate()
    const [scopeDevice, animateDevice] = useAnimate()
    const [scopeAutomation, animateAutomation] = useAnimate()

    const scopes = [scopeTotal, scopePredicted, scopeDevice, scopeAutomation]

    const offset = 300

    const variants = {
        initial: {
            x: (tab < previousTab ?  -offset : offset),
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

    const handleClickTab = (ntab)=>{
        animate(scopes[tab].current,
            {x: (tab < ntab ? -offset : offset)},
            {duration: 0.25}
        )
        setPreviousTab(tab)
        setTab(ntab)
    }

    return (
        <div className="size-full flex flex-col p-3 gap-3">
            <div className="flex w-full h-min justify-center">
                <h1 className="text-xl">Consumption</h1>
            </div>
            <div className="flex flex-col size-full bg-white shadow rounded gap-1">
                <div className="flex w-full h-min border-b-2 border-slate-200">
                    <div className="flex flex-col items-center w-full"
                        style={{ cursor: "pointer" }}
                        onClick={() => { handleClickTab(0)}}
                    >
                        <h1 className="text-xl py-2">Total energy consumption</h1>
                        <motion.div className="flex bg-lime-400 rounded"
                            animate={{
                                width: (tab == 0 ? "50%" : "0px"),
                                height: (tab == 0 ? "2px" : "0px")
                            }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                    <div className="flex flex-col items-center w-full"
                        style={{ cursor: "pointer" }}
                        onClick={() => { handleClickTab(1)}}
                    >
                        <h1 className="text-xl py-2">Predicted energy consumption</h1>
                        <motion.div className="flex bg-lime-400 rounded"
                            animate={{
                                width: (tab == 1 ? "50%" : "0px"),
                                height: (tab == 1 ? "2px" : "0px")
                            }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                    <div className="flex flex-col items-center w-full"
                        style={{ cursor: "pointer" }}
                        onClick={() => { handleClickTab(2) }}
                    >
                        <h1 className="text-xl py-2">Consumption per device</h1>
                        <motion.div className="flex bg-lime-400 rounded"
                            animate={{
                                width: (tab == 2 ? "50%" : "0px"),
                                height: (tab == 2 ? "2px" : "0px")
                            }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                    <div className="flex flex-col items-center w-full"
                        style={{ cursor: "pointer" }}
                        onClick={() => { handleClickTab(3)}}
                    >
                        <h1 className="text-xl py-2">Consumption per automation</h1>
                        <motion.div className="flex bg-lime-400 rounded"
                            animate={{
                                width: (tab == 3 ? "50%" : "0px"),
                                height: (tab == 3 ? "2px" : "0px")
                            }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>
                <div className="bg-slate-200 w-full" />
                <div className="flex w-full h-full">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <AnimatePresence>
                            {tab == 0 &&
                                <motion.div className="flex size-full"
                                    ref={scopes[0]}
                                    key={"TotalEnergy"}
                                    variants={variants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                >
                                    <TotalConsumptionGraph key={"TotalComp"} device_id={""} device_name={""} />
                                </motion.div>
                            }
                        </AnimatePresence>
                        <AnimatePresence>
                            {tab == 1 &&
                                <motion.div className="flex size-full"
                                    ref={scopes[1]}
                                    key={"PredictedEnergy"}
                                    variants={variants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                >
                                    <TotalConsumptionGraph key={"PredictedComp"} device_id={""} device_name={""} />
                                </motion.div>
                            }
                        </AnimatePresence>
                        <AnimatePresence>
                            {tab == 2 &&
                                <motion.div className="flex size-full"
                                    ref={scopes[2]}
                                    key={"DeviceEnergy"}
                                    variants={variants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                >
                                    <ConsumptionComparisonGraph key={"DeviceComp"} device_id={""} device_name={""} />
                                </motion.div>
                            }
                        </AnimatePresence>
                        <AnimatePresence>
                            {tab == 3 &&
                                <motion.div className="flex size-full"
                                    ref={scopes[3]}
                                    key={"AutomationEnergy"}
                                    variants={variants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                >
                                    <TotalConsumptionGraph key={"AutomationComp"} device_id={""} device_name={""} />
                                </motion.div>
                            }
                        </AnimatePresence>
                    </LocalizationProvider>
                </div>

            </div>
        </div>
    )
}