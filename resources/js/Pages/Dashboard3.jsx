import { useEffect, useState, useContext, useMemo } from "react";
import { FaBolt, FaLaptop, FaCloud } from "react-icons/fa6";
import { EcologicalFootprint } from "@/Components/Commons/EcologicalFootprint";
import { DeviceTable } from "@/Components/Commons/DeviceTable";
import AnimateMap2 from "@/Components/Commons/AnimateMap2";
import TabLayout from "@/Layouts/TabLayout";
import { useLaravelReactI18n } from 'laravel-react-i18n';

import { DeviceContextRefresh } from "@/Components/ContextProviders/DeviceProviderRefresh";
import WhiteCard from "@/Components/Commons/WhiteCard";
import { apiFetch, useIsMobile } from "@/Components/Commons/Constants";
import dayjs from "dayjs";
import { domain } from "@/Components/Commons/Constants";

import { UserContext } from "@/Layouts/UserLayout";

import DiaryCheck from "@/Components/Commons/DiaryCheck";

function PowerConsumptionGauge({ powerUsage = 0, maxPower = 3000 }) {
    const radius = 90; // The radius of the semicircle
    const circumference = 2 * Math.PI * radius; // Full circumference of the circle
    const semicircleCircumference = circumference / 2; // Half the circumference for a semicircle

    // Calculate the percentage of power usage
    const percentage = Math.min((powerUsage / maxPower) * 100, 100);

    // The dash offset is based on the percentage of the semicircle circumference
    const offset = semicircleCircumference - (percentage / 100) * semicircleCircumference;

    // Determine the color based on the percentage
    const getColor = () => {
        if (percentage < 50) return "text-lime-400";  // Low usage
        if (percentage < 80) return "text-yellow-400";  // Medium usage
        return "text-red-500";  // High usage
    };

    return (
        <div className="flex flex-col items-center justify-center relative">
            <svg viewBox="0 0 200 100" className="relative size-32">
                {/* Background semicircle (gray color) */}
                <path
                    d="M 10 100 A 90 90 0 0 1 190 100"
                    fill="none"
                    stroke="gray"
                    strokeWidth="20"
                    strokeLinecap="round"
                />
                {/* Foreground semicircle (animated) */}
                <path
                    d="M 10 100 A 90 90 0 0 1 190 100"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="20"
                    strokeDasharray={semicircleCircumference} // Full semicircle circumference
                    strokeDashoffset={offset} // Adjust based on the power usage
                    strokeLinecap="round"
                    className={getColor() + " transition-all duration-500"}
                />
            </svg>
            <p className="absolute bottom-6 text-xl font-semibold text-gray-700 dark:text-white">
                {powerUsage >= 1000 ? `${(powerUsage / 1000).toFixed(2)} kW` : `${powerUsage.toFixed(2)} W`}
            </p>
        </div>
    );
}




const Dashboard3 = ({ maps, token }) => {
    const [appliances, setAppliance] = useState([]);
    const [rooms, setRooms] = useState([])

    const [pastConsumption, setPastConsumption] = useState(0)
    const [totalPower, setTotalPower] = useState(0)
    const [activeDevices, setActiveDevices] = useState(0)

    const user = useContext(UserContext);

    const w2gCO2 = 0.431
    const minimumPower = 3

    const { deviceList = [], fetchDevices } = useContext(DeviceContextRefresh);
    const { t } = useLaravelReactI18n();

    useEffect(() => {
        const fetchData = async () => {
            const data = await apiFetch("/room");

            if (data && data.length > 0) {
                setRooms(data);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            await fetchDevices();
            const end = dayjs();
            const start = end.add(-1, "month");
            const url = `/consumption/total?` +
                `start_timestamp=${encodeURIComponent(start.format("YYYY-MM-DD"))}` +
                `&end_timestamp=${encodeURIComponent(end.format("YYYY-MM-DD"))}` +
                `&group=total&minutes=60`;

            const resp = await apiFetch(url, "GET", null);
            if (resp) {
                setPastConsumption(
                    resp[0].energy_consumption_unit === "Wh"
                        ? resp[0].energy_consumption / 1000
                        : resp[0].energy_consumption
                );
            }
        }
        fetchData();
    }, []);

/*     useEffect(() => {//TODO:remove this if not necessary
        const fetchUser = async () => {
            await fetch(`${domain}/sanctum/csrf-cookie`, {
                credentials: 'include'
            });
            const response = await fetch(domain + "/api/user", {
                method: "GET",
                credentials: "include",
                headers: {
                    "X-Requested-With": "XMLHttpRequest"
                }
            })
            if (response.ok) {
                const result = await response.json()
                //apiLog(result.user.username, logsEvents.LOGIN, "", "")
                //setUser(result.user.username)
            }
        }
        fetchUser()
    }, []); */

    useEffect(() => {
        const updateState = deviceList
            .filter(dev => dev.map_data)
            .map(dev => ({
                ...dev,
                top: dev.map_data.y,
                left: dev.map_data.x,
                floor: dev.map_data.floor
            }));
        setAppliance(updateState);
    }, [deviceList]);


    useEffect(() => {
        if (deviceList) {
            let total_power = 0
            let active_devices = 0
            deviceList.map(dev => {
                if (dev.power_entity_id != "") {
                    const power_entity = dev.list_of_entities.find(e => e.entity_id == dev.power_entity_id)
                    const current_power_state = power_entity ? power_entity.state : "0"
                    const current_power = parseFloat(current_power_state) || 0
                    total_power += current_power
                    if (current_power > minimumPower)
                        active_devices++
                }
            })
            setTotalPower(total_power)
            setActiveDevices(active_devices)
        }
    }, [deviceList])

    const pastEnergyConsumption = useMemo(() => {
        return pastConsumption;
    }, [pastConsumption]);

    const isMobile = useIsMobile();

    const sections = useMemo(() => {
        const orderedSections = {};

        if (!isMobile) {
            orderedSections["Home"] = (
                <div className="flex-col gap-2 size-full">
                    {maps.length > 0 ? (
                        <AnimateMap2 maps={maps} appliances={appliances} rooms={rooms} />
                    ) : (
                        <div className="size-full flex justify-center items-center">
                            <p className="text-center dark:text-white">
                                {t("No map has been uploaded yet")}, <br />
                                {t("you can add your house's map clicking")}
                                <a style={{ color: "blue" }} href={route("configuration")}>
                                    {t("here")}
                                </a>
                            </p>
                        </div>
                    )}
                </div>
            );
        }

        orderedSections["Devices"] = <DeviceTable deviceContext={deviceList} />;

        return orderedSections;
    }, [isMobile, maps, appliances, rooms, deviceList]);



    return (
        <div className="h-fit w-full flex flex-col lg:grid lg:grid-cols-3 gap-4 p-3 overflow-auto">
            <DiaryCheck user={user}/>
            <div className="col-span-2">
                <TabLayout sections={sections} />
            </div>
            <div className="flex flex-col gap-2">
                <div className="grid 2xl:grid-cols-3 xl:grid-cols-2 gap-2 dark:text-white">
                    <WhiteCard className="flex flex-col p-2 bg-gray-200 dark:bg-neutral-700 rounded shadow 2xl:row-span-1 xl:row-span-2">
                        <div className="flex items-center gap-1 text-black dark:text-white">
                            <FaBolt size={16} /> <h1>{t("Power usage")}</h1>
                        </div>
                        <div className="flex justify-center items-center">
                            <PowerConsumptionGauge powerUsage={totalPower} />
                        </div>
                    </WhiteCard>
                    <WhiteCard className="flex flex-col p-2 rounded shadow">
                        <div className="flex items-center gap-1 text-black dark:text-white">
                            <FaLaptop size={16} /> <h1>{t("Active devices")}</h1>
                        </div>
                        <div className="flex justify-center items-center h-full lg:flex-col 2xl:flex-row">
                            <p className="text-3xl mr-1">
                                {activeDevices}
                            </p>
                        </div>
                    </WhiteCard>
                    <WhiteCard className="flex flex-col p-2 rounded shadow">
                        <div className="flex items-center gap-1 text-black dark:text-white">
                            <FaCloud /> <h1>{t("Emissions")}</h1>
                        </div>
                        <div className="flex justify-center items-center h-full lg:flex-col 2xl:flex-row">
                            <p className="text-3xl mr-1">
                                {(totalPower * w2gCO2).toFixed(2)}
                            </p>
                            <p>

                                gCO<sub>2</sub>/h
                            </p>
                        </div>
                    </WhiteCard>
                </div>
                <EcologicalFootprint energyConsumptionIn={pastEnergyConsumption} />
            </div>
        </div>
    );
};

export default Dashboard3;
