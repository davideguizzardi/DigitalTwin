import { useEffect, useState } from "react";
import { FaHouse, FaBolt, FaLaptop, FaCloud, FaStar } from "react-icons/fa6";
import Cookies from "js-cookie";
import { EcologicalFootprint } from "@/Components/Commons/EcologicalFootprint";
import { DeviceTable } from "@/Components/Commons/DeviceTable";
import AnimateMap2 from "@/Components/Commons/AnimateMap2";
import WhiteCard from "@/Components/Commons/WhiteCard";
import { backend } from "@/Components/Commons/Constants";
import { useLaravelReactI18n } from 'laravel-react-i18n';
import TabLayout from "@/Layouts/TabLayout";

const Dashboard3 = ({ maps, token }) => {
    const [homeContext, setHomeContext] = useState({})
    const [deviceContext, setDeviceContext] = useState({})
    const [appliances, setAppliance] = useState([])

    const { t } = useLaravelReactI18n()

    useEffect(() => {
        if (token) {
            Cookies.set("auth-token", token)
        }
    }, [])

    useEffect(() => {
        const fetchDeviceContext = async () => {
            const response = await fetch(backend + '/device')
            const result = await response.json()
            setDeviceContext(result)
        }
        fetchDeviceContext()
    }, [])

    useEffect(() => {
        const fetchHomeContext = async () => {
            const response = await fetch(backend + "/virtual/home")
            const result = await response.json()
            setHomeContext(result)
        }
        fetchHomeContext()
    }, [])


    useEffect(() => {
        const fetchMap = async () => {
            const response = await fetch(backend + "/map")
            response.json().then((result) => {
                const updateState = result.map((e) => {
                    const device = deviceContext.find((dev) => e.entity_id === dev.device_id);
                    return device
                        ? { ...device, top: e.y, left: e.x, floor: e.floor }
                        : {};
                })
                setAppliance([...updateState])
            })
        }
        if(deviceContext.length>0){
            fetchMap()
        }
    }, [deviceContext])

    const sections = {
        "Home": (
            <div className="flex-col gap-2 w-full" >
                {
                    maps.length > 0 ?
                        <AnimateMap2 maps={maps} appliances={appliances} />
                        :
                        <div className="size-full flex justify-center items-center">
                            <p className='text-center dark:text-white'>{t("No map has been uploded yet")}, <br></br> {t("you can add your house's map clicking")}
                                <a style={{ color: "blue" }} href={route("configuration")}> {t("here")}</a></p>
                        </div>
                }
                <div className="flex items-center justify-around py-2 gap-2 dark:text-white">
                    <div className="lg:w-48 flex flex-col p-2 bg-gray-200 dark:bg-neutral-700 rounded shadow">
                        <div className="flex items-center gap-1 text-black dark:text-white">
                            <FaBolt size={16} /> <h1>{t("Power usage")}</h1>
                        </div>
                        <div className="flex justify-end">
                            {homeContext.power_usage + " " + homeContext.power_usage_unit}
                        </div>
                    </div>
                    <div className="lg:w-48 flex flex-col p-2 bg-gray-200  dark:bg-neutral-700 rounded shadow">
                        <div className="flex items-center gap-1 text-black dark:text-white">
                            <FaLaptop size={16} /> <h1>{t("Active devices")}</h1>
                        </div>
                        <div className="flex justify-end">
                            {homeContext.power_usage}
                        </div>
                    </div>
                    <div className="lg:w-48 flex flex-col p-2 bg-gray-200  dark:bg-neutral-600 rounded shadow">
                        <div className="flex items-center gap-1 text-black dark:text-white">
                            <FaCloud /> <h1 >{t("Emissions")}</h1>
                        </div>
                        <div className="flex justify-end">
                            {homeContext.emissions} {homeContext.emissions_unit}
                        </div>
                    </div>
                </div>
            </div>

        ),
        "Devices": (<DeviceTable deviceContext={deviceContext} />),
    }




    return (
        <div className="size-full grid grid-cols-3 gap-4 p-5">
            <div className="col-span-2">
                <TabLayout sections={sections} />
            </div>
            <div className="flex flex-col">

                <EcologicalFootprint energyConsumptionIn={30} />
            </div>
        </div>
    );
}

export default Dashboard3;