import { useState, useEffect } from "react";
import { CiUser, CiPizza } from "react-icons/ci";
import { FaCarSide } from "react-icons/fa";
import { FaHouse } from "react-icons/fa6";
import { LuSmartphoneCharging } from "react-icons/lu";
import { animate, motion, useMotionValue, useTransform } from "framer-motion"
import { useLaravelReactI18n } from 'laravel-react-i18n';

export function EcologicalFootprint({ energyConsumptionIn, home=true }) {
    const [gCO2, setGCO2] = useState(0)
    const averageGCO2 = 50000
    const gCO2PerKwh = 431.14
    const gCO2PerPizza = 5000
    const gCO2PerKm = 161.9
    const kWhPerPhoneCharge = 0.01
    const [averageBarWidth, setAverageBarWidth] = useState(50)
    const [yourBarWidth, setYourBarWidth] = useState(50)

    const {t} = useLaravelReactI18n()

    const countKm = useMotionValue(0)
    const countPizza = useMotionValue(0)
    const countCharge = useMotionValue(0)

    const roundedKm = useTransform(countKm, latest => Math.round(latest) + " km")
    const roundedPizza = useTransform(countPizza, latest => Math.round(latest) + " Margherita")
    const roundedCharge = useTransform(countCharge, latest => Math.round(latest) + " " + t("times"))
    
    const animationProp = {
        duration: 0.7,
        delay: 0.5
    }

    useEffect(() => {
        setGCO2(energyConsumptionIn * gCO2PerKwh)

    }, [energyConsumptionIn])

    useEffect(() => {
        if (gCO2 > averageGCO2) {
            setAverageBarWidth(Math.round(50 * (averageGCO2 / gCO2)))
            setYourBarWidth(50)
        } else {
            setAverageBarWidth(50)
            setYourBarWidth(Math.round(50 * (gCO2 / averageGCO2)))
        }
    }, [gCO2])

    useEffect(()=>{
        const controlsKm = animate(countKm, Math.round(gCO2/gCO2PerKm), animationProp)
        const controlsPizza = animate(countPizza, Math.round(gCO2/gCO2PerPizza),animationProp)
        const controlsCharge = animate(countCharge, Math.round(energyConsumptionIn/kWhPerPhoneCharge),animationProp )
        return () => {
            controlsKm.stop()
            controlsPizza.stop()
            controlsCharge.stop()
        }
    },[gCO2])

    return (
        <div className="w-full h-full rounded-lg items-center flex flex-col gap-3 text-gray-800 p-4 dark:text-white bg-zinc-50 shadow-md">
            <div className="w-full flex justify-center">
                <h1 className="uppercase font-bold text-3xl">{home ? t("Home Ecological Footprint"):t("Your Ecological Footprint")}</h1>
            </div>
            <div className="w-full flex flex-col">
                {gCO2 < averageGCO2 ? 
                    <p className="text-base"> {t("The past month your actions produced")} <span className="font-bold">{Math.round(gCO2 / 1000)} kgCO2e</span>. 
                    {t("Congratulations your emissions were")} <span className="font-bold text-lime-600 dark:text-lime-400">{Math.round((1 - gCO2 / averageGCO2) * 100)}% {t("less")}</span> {t("than the average person")}!
                    </p>
                    :
                    <p className="text-base"> {t("The past month your actions produced")} <span className="font-bold">{Math.round(gCO2 / 1000)} kgCO2e</span>. 
                    {t("Congratulations your emissions were")} <span className="font-bold text-red-400">{Math.round((gCO2 / averageGCO2 - 1) * 100)}% {t("more")}</span> {t("than the average person")}!
                    </p>
                }

            </div>
            <div className="flex flex-col size-full justify-center gap-3">
                <div className="flex flex-row gap-2 w-full 2xl:pl-24">
                    {home? 
                    <FaHouse className="size-9"></FaHouse>
                    :
                    <CiUser className="size-9" />
                    }
                    <p className="w-24">{home? t("Average Home") : t("Average User")}</p>
                    <motion.div className="bg-green-800 h-5 rounded-tr rounded-br"
                        initial={{ width: "0px" }}
                        animate={{ width: averageBarWidth + "%" }}
                        transition={animationProp}
                    />
                    <p>{Math.round(averageGCO2 / 1000)} kgCO2e</p>
                </div>
                <div className="flex flex-row gap-2 w-full 2xl:pl-24">
                    {home? 
                    <FaHouse className="size-9"></FaHouse>
                    :
                    <CiUser className="size-9" />
                    }
                    <p className="w-24">{home ? t("Home"):t("You")}</p>
                    <motion.div className="bg-lime-400 h-5 rounded-tr rounded-br"
                        initial={{ width: "0px" }}
                        animate={{ width: yourBarWidth + "%" }}
                        transition={animationProp}
                    />
                    <p>{Math.round(gCO2 / 1000)} kgCO2e</p>
                </div>
            </div>
            <div>
                <p>{t("You produced as much CO2 as")}:</p>
            </div>
            <div className="flex size-full grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center">
                    <FaCarSide className="size-16" />
                    <p>{t("Driving a car for")} </p>
                    <motion.div className="font-bold text-lime-600 dark:text-lime-400 underline">{roundedKm}</motion.div>
                </div>
                <div className="flex flex-col items-center">
                    <CiPizza className="size-16" />
                    <p>{t("Eating")} <motion.span className="font-bold text-lime-600 dark:text-lime-400 underline">{roundedPizza}</motion.span> <br /> {t("at the pizzeria")}</p>
                </div>
                <div className="flex flex-col items-center">
                    <LuSmartphoneCharging className="size-16" />
                    <p>{t("Charging an average")} <br /> <motion.span className="font-bold text-lime-600 dark:text-lime-400 underline">{roundedCharge}</motion.span> {t("smartphone")} </p>
                </div>
            </div>
        </div>
    )
}