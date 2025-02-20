import { useEffect, useMemo } from "react";
import { CiUser } from "react-icons/ci";
import { FaHouse } from "react-icons/fa6";
import { motion, animate, useMotionValue, useTransform } from "framer-motion";
import { useLaravelReactI18n } from "laravel-react-i18n";
import { EcologicalFootprintCarousel, EcologicalFootprintGrid } from "./EcologialFootprintCarousel";
import { kgCO2e_kWh } from "./Constants";

export function EcologicalFootprint({ energyConsumptionIn, home = true }) {
    const { t } = useLaravelReactI18n();

    const AVERAGE_GCO2 = 60;
    const kgCO2 = useMemo(() => energyConsumptionIn * kgCO2e_kWh, [energyConsumptionIn]);
    const kgCO2Motion = useMotionValue(0);
    const animatedKgCO2 = useTransform(kgCO2Motion, (value) => `${value.toFixed(0)} kg`);

    useEffect(() => {
        const cancelAnimation = animate(kgCO2Motion, energyConsumptionIn * kgCO2e_kWh, {
            duration: 0.7,
            delay: 0.2,
            ease: "easeOut",
        });

        return () => cancelAnimation.stop(); // Cleanup function
    }, [energyConsumptionIn]);

    const maxBarWidth = Math.max(kgCO2Motion.get(), AVERAGE_GCO2);

    const averageBarWidth = Math.round((AVERAGE_GCO2 / maxBarWidth) * 100);
    const yourBarWidth = Math.round((kgCO2 / maxBarWidth) * 100);

    return (
        <div className="w-full h-full flex flex-col xl:gap-8 2xl:gap-10 rounded-lg p-4 bg-zinc-50 shadow-md text-gray-800 dark:text-white">
            <h1 className="uppercase text-xl font-semibold text-center">
                {home ? t("Home Ecological Footprint") : t("Your Ecological Footprint")}
            </h1>

            <div className="flex items-center flex-col">
                <p>{t("In the last 30 days you produced:")}</p>
                <motion.div className="text-2xl">
                    {animatedKgCO2}
                </motion.div>
                <p>{t("of")} CO<sub>2</sub>e</p>
            </div>

            <div className="flex items-center flex-col gap-2">
                <p>{t("It's the ")}<span className={`font-semibold ${kgCO2 > AVERAGE_GCO2 ? "text-red-500" : "text-lime-500"}`}>{((kgCO2 / AVERAGE_GCO2) * 100).toFixed(0)}%</span>{t("of what the average familty produce!")}</p>

                <div className="flex flex-col w-full items-center gap-2 justify-center">
                    <FootprintBar
                        icon={home ? <FaHouse className="size-6" /> : <CiUser className="size-6" />}
                        label={home ? t("Average Home") : t("Average User")}
                        barColor="bg-green-800"
                        barWidth={averageBarWidth}
                        value={AVERAGE_GCO2}
                    />
                    <FootprintBar
                        icon={home ? <FaHouse className="size-6" /> : <CiUser className="size-6" />}
                        label={home ? t("Home") : t("You")}
                        barColor="bg-lime-400"
                        barWidth={yourBarWidth}
                        value={kgCO2}
                    />
                </div>

            </div>
            <div className="flex flex-col gap-2 items-center">
                <p>{t("You produced as much CO2 as")}:</p>
                <EcologicalFootprintCarousel kWh={energyConsumptionIn} />

                <EcologicalFootprintGrid kWh={energyConsumptionIn} />
            </div>
        </div>
    );
}

// Reusable Component for Footprint Bars
const FootprintBar = ({ icon, label, barColor, barWidth, value }) => (
    <div className="grid grid-cols-4 items-center justify-start gap-3 w-full">
        <p className="text-center">{label}</p>
        <motion.div
            className={`${barColor} h-5 col-span-2 rounded-r-md`}
            initial={{ width: "0px" }}
            animate={{ width: `${barWidth}%` }}
            transition={{ duration: 0.7, delay: 0.2 }}
        />
        <p>{Math.round(value)} kg</p>
    </div>
);
