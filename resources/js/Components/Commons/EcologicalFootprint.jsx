import { useState, useEffect } from "react";
import { CiUser, CiPizza } from "react-icons/ci";
import { FaCarSide } from "react-icons/fa";
import { LuSmartphoneCharging } from "react-icons/lu";
import { motion } from "framer-motion"

export function EcologicalFootprint({ energyConsumptionIn }) {
    const [gCO2, setGCO2] = useState(0)
    const averageGCO2 = 50000
    const gCO2PerKwh = 431.14
    const gCO2PerPizza = 5000
    const gCO2PerKm = 161.9
    const kWhPerPhoneCharge = 0.01
    const [averageBarWidth, setAverageBarWidth] = useState(50)
    const [yourBarWidth, setYourBarWidth] = useState(50)


    useEffect(() => {
        setGCO2(energyConsumptionIn * gCO2PerKwh)

    }, [energyConsumptionIn])

    useEffect(() => {
        if (gCO2 > averageGCO2) {
            setAverageBarWidth(Math.round(50 * (averageGCO2 / gCO2)))
        } else {
            setYourBarWidth(Math.round(50 * (gCO2 / averageGCO2)))
        }
    }, [gCO2])

    return (
        <div className="bg-white w-full h-full rounded-lg shadow items-center flex flex-col gap-3 text-gray-800 p-4">
            <div className="w-full flex justify-center">
                <h1 className="uppercase font-bold text-3xl">Your <span className="text-lime-400 underline underline-offset-1">Ecological</span> footprint</h1>
            </div>
            <div className="w-full flex justify-center items-center flex-col">
                <p className="text-base"> The past month your actions produced <span className="font-bold">{Math.round(gCO2 / 1000)} kg of CO2e</span>.</p>
                {gCO2 < averageGCO2 ?
                    <p>Congratulations your emissions were <span className="font-bold text-lime-400">{Math.round((1 - gCO2 / averageGCO2) * 100)}% less</span> than the average person!</p>
                    :
                    <p>Congratulations your emissions were <span className="font-bold text-red-400">{Math.round((gCO2 / averageGCO2 - 1) * 100)}% more</span> than the average person!</p>
                }
            </div>
            <div className="flex flex-col size-full justify-center gap-3">
                <div className="flex flex-row gap-3.5 w-full pl-8 2xl:pl-24">
                    <CiUser className="size-9" />
                    <p className="w-24">Average user</p>
                    <motion.div className="bg-green-800 h-5 rounded-tr rounded-br"
                        initial={{ width: "0px" }}
                        animate={{ width: averageBarWidth + "%" }}
                        transition={{
                            delay: 0.5,
                            duration: 0.5
                        }}
                    />
                    <p>{Math.round(averageGCO2 / 1000)}kg CO2e</p>
                </div>
                <div className="flex flex-row gap-3.5 w-full pl-8 2xl:pl-24">
                    <CiUser className="size-9" />
                    <p className="w-24">You</p>
                    <motion.div className="bg-lime-400 h-5 rounded-tr rounded-br"
                        initial={{ width: "0px" }}
                        animate={{ width: yourBarWidth + "%" }}
                        transition={{
                            delay: 0.5,
                            duration: 0.5
                        }}
                    />
                    <p>{Math.round(gCO2 / 1000)}kg CO2e</p>
                </div>
            </div>
            <div>
                <p>You produced as much CO2 as:</p>
            </div>
            <div className="flex size-full grid grid-cols-3 gap-1">
                <div className="flex flex-col items-center">
                    <FaCarSide className="size-16" />
                    <p>Driving a car for</p>
                    <p className="font-bold text-green-900 underline">{Math.round(gCO2 / gCO2PerKm)}km</p>
                </div>
                <div className="flex flex-col items-center">
                    <CiPizza className="size-16" />
                    <p>Eating <span className="font-bold text-green-900 underline">{Math.round(gCO2 / gCO2PerPizza)} Margheritas</span></p>
                    <p>at the pizzeria</p>
                </div>
                <div className="flex flex-col items-center">
                    <LuSmartphoneCharging className="size-16" />
                    <p>Charging an average  </p>
                    <p>smartphone <span className="font-bold text-green-900 underline">{Math.round(energyConsumptionIn / kWhPerPhoneCharge)} times</span></p>
                </div>
            </div>
        </div>
    )
}