import { ConsumptionComparisonGraph } from "@/Components/Consumption/ConsumptionComparisonGraph"
import { TotalConsumptionGraph } from "@/Components/Consumption/TotalConsumptionGraph"
import { getOpacity } from "@mui/material/styles/createColorScheme"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { motion } from "framer-motion"
import { useState } from "react"
import { FaExpand } from "react-icons/fa6";

export default function Consumption() {
    const [selectTab, setSelectTab] = useState(0)

    const variants = {
        hidden: {
            width: "0px",
            height: "0px"
        },
        visible: {
            width: "49%",
            height: "49%"
        },
        full: {
            width: "98.5%",
            height: "98%"
        }
    }

    const stateDiv1 = ["visible", "full", "hidden", "hidden", "hidden"]
    const variants1 = {
        hidden: {
            top: "0%",
            left: "0%",
            right: "100%",
            bottom: "100%",
        },
        visible: {
            top: "1%",
            left: "1%",
            right: "50.5%",
            bottom: "51%"
        },
        full: {
            top: "0%",
            left: "0%",
            right: "0%",
            bottom: "0%",
        }
    }
    const variants2 = {
        hidden: {
            top: "0%",
            left: "100%",
            right: "0%",
            bottom: "100%",
        },
        visible: {
            top: "1%",
            left: "50.5%",
            right: "1%",
            bottom: "51%"
        },
        full: {
            top: "0%",
            left: "0%",
            right: "0%",
            bottom: "0%",
        }
    }
    const variants3 = {
        hidden: {
            top: "100%",
            left: "0%",
            right: "100%",
            bottom: "0%",
        },
        visible: {
            top: "51%",
            left: "1%",
            right: "50.5%",
            bottom: "1%"
        },
        full: {
            top: "0%",
            left: "0%",
            right: "0%",
            bottom: "0%",
        }
    }
    const variants4 = {
        hidden: {
            top: "100%",
            left: "100%",
            right: "0%",
            bottom: "0%",
        },
        visible: {
            top: "51%",
            left: "50.5%",
            right: "1%",
            bottom: "1%"
        },
        full: {
            top: "0%",
            left: "0%",
            right: "0%",
            bottom: "0%",
        }
    }

    const variantsPreview = {
        hidden: {
            display:"none",
            opacity: 0,
        },
        visible: {
            display: "flex",
            opacity: 1,
            paddingTop: "10%",
            paddingBottom: "0%",
            width: "100%",
            height: "100%"
        },
        full: {
            display: "flex",
            opacity: 1,
            paddingTop: "1%",
            paddingBottom: "1%",
            width: "100%",
            height: "auto"
        }
    }

    const stateDiv2 = ["visible", "hidden", "full", "hidden", "hidden"]
    const stateDiv3 = ["visible", "hidden", "hidden", "full", "hidden"]
    const stateDiv4 = ["visible", "hidden", "hidden", "hidden", "full"]

    return (
        <div className="size-full relative">
            <motion.div className="absolute top-0 left-0 flex flex-col bg-white rounded shadow "
                variants={variants1}
                initial="hidden"
                animate={stateDiv1[selectTab]}
            >
                {stateDiv1[selectTab] != "hidden" &&
                    <div className="flex w-full h-min justify-end p-2">
                        <FaExpand size={32} onClick={() => selectTab > 0 ? setSelectTab(0) : setSelectTab(1)} />
                    </div>
                }
                <motion.div className="justify-center" variants={variantsPreview} >
                    <h1 className="text-2xl">Consumption comparison</h1>
                </motion.div>

                {stateDiv1[selectTab] == "full" &&
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <ConsumptionComparisonGraph   device_id={""} device_name={""}/>
                </LocalizationProvider>

                }
            </motion.div>
            <motion.div className="absolute top-0 right-0 flex flex-col bg-white shadow "
                variants={variants2}
                initial="hidden"
                animate={stateDiv2[selectTab]}
            >
                {stateDiv2[selectTab] != "hidden" &&
                    <div className="flex w-full h-min justify-end p-2">
                        <FaExpand size={32} onClick={() => selectTab > 0 ? setSelectTab(0) : setSelectTab(2)} />
                    </div>
                }
                <motion.div className="justify-center" variants={variantsPreview} >
                    <h1 className="text-2xl">Total Consumption </h1>
                </motion.div>

                {stateDiv2[selectTab] == "full" &&
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TotalConsumptionGraph  device_id={""} device_name={""}/>
                </LocalizationProvider>

                }
            </motion.div>

            <motion.div className="absolute bottom-0 left-0 flex flex-col bg-red-500 round"
                variants={variants3}
                initial="hidden"
                animate={stateDiv3[selectTab]}
            >
                {stateDiv3[selectTab] != "hidden" &&
                    <div className="flex w-full h-min justify-end p-2">
                        <FaExpand size={32} onClick={() => selectTab > 0 ? setSelectTab(0) : setSelectTab(3)} />
                    </div>
                }
            </motion.div>

            <motion.div className="absolute bottom-0 right-0 flex flex-col bg-gray-500 round"
                variants={variants4}
                initial="hidden"
                animate={stateDiv4[selectTab]}
            >
                {stateDiv4[selectTab] != "hidden" &&
                    <div className="flex w-full h-min justify-end p-2">
                        <FaExpand size={32} onClick={() => selectTab > 0 ? setSelectTab(0) : setSelectTab(4)} />
                    </div>
                }
            </motion.div>


        </div>
    )
}