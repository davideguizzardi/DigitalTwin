import { useEffect, useState } from "react";
import ListButtons from "@/Components/Commons/ListButtons";
import CardAppliance from "@/Components/Commons/CardAppliance";
import { FaHouse, FaBolt, FaLaptop, FaCloud, FaStar } from "react-icons/fa6";
import Cookies from "js-cookie";
import AnimateMap from "@/Components/Commons/AnimateMap";
import { EcologicalFootprint } from "@/Components/Commons/EcologicalFootprint";
import { DeviceTable } from "@/Components/Commons/DeviceTable";
import { AnimatePresence } from "framer-motion";
import AnimateMap2 from "@/Components/Commons/AnimateMap2";
import WhiteCard from "@/Components/Commons/WhiteCard";
import { IconContext } from "react-icons";


const Dashboard = ({ maps, token }) => {
    const [homeContext, setHomeContext] = useState({})
    const [deviceContext, setDeviceContext] = useState({})
    const [appliances, setAppliance] = useState([])
    const darkMode = localStorage.getItem("darkMode") == "true"

    useEffect(() => {
        const fetchDeviceContext = async () => {
            const response = await fetch("http://localhost:8000/virtual/device")
            const result = await response.json()
            setDeviceContext(result)
            console.log(result)
        }
        fetchDeviceContext()
    }, [])

    useEffect(() => {
        const fetchHomeContext = async () => {
            const response = await fetch("http://localhost:8000/virtual/home")
            const result = await response.json()
            setHomeContext(result)
        }
        fetchHomeContext()
    }, [])


    useEffect(() => {
        const fetchAppliance = async () => {
            const response = await fetch("http://localhost:8000/map")
            response.json().then((result) => {
                const updateState = result.map((e) => {
                    return {
                        id: e.entity_id,
                        top: e.y,
                        left: e.x,
                        floor: e.floor,
                    }
                })
                setAppliance([...updateState])
            })
        }
        fetchAppliance()
        Cookies.set("auth-token", token)
    }, [])

    return (
        <div className="size-full flex gap-2 p-2">
            <WhiteCard className=" flex-col gap-4 p-2 w-full" direction="left">
                <IconContext.Provider value={{ color: (darkMode ? "white" : "black") }}>
                    <div className="w-full flex items-center justify-center mt-6 gap-2 p-3">
                        <FaHouse size={36} />
                        <h1 className="text-2xl dark:text-white">Your Home</h1>
                    </div>
                </IconContext.Provider>
                    {
                        maps.length > 0 ?
                            <AnimateMap2 maps={maps} appliances={appliances} />
                            :
                            <div className="size-full flex justify-center items-center">
                                <p className='text-center dark:text-white'>No map has been uploded yet, <br></br> you can add your house's map clicking
                                    <a style={{ color: "blue" }} href={route("configuration")}> here</a></p>
                            </div>
                    }
                <IconContext.Provider value={{ color: (darkMode ? "white" : "black") }}>
                    <div className="flex items-center justify-around p-2 dark:text-white">
                        <div className="lg:w-48 flex flex-col p-2 bg-slate-100 dark:bg-neutral-700 rounded shadow">
                            <div className="flex items-center gap-1">
                                <FaBolt size={16} /> <h1>Power usage</h1>
                            </div>
                            <div className="flex justify-end">
                                {homeContext.power_usage + " " + homeContext.power_usage_unit}
                            </div>
                        </div>
                        <div className="lg:w-48 flex flex-col p-2 bg-gray-200  dark:bg-neutral-700 rounded shadow">
                            <div className="flex items-center gap-1">
                                <FaLaptop size={16} /> <h1>Active devices</h1>
                            </div>
                            <div className="flex justify-end">
                                {homeContext.power_usage}
                            </div>
                        </div>
                        <div className="lg:w-48 flex flex-col p-2 bg-gray-200  dark:bg-neutral-700 rounded shadow">
                            <div className="flex items-center gap-1">
                                <FaCloud size={16} /> <h1>Emissions</h1>
                            </div>
                            <div className="flex justify-end">
                                {homeContext.emissions} {homeContext.emissions_unit}
                            </div>
                        </div>
                    </div>
                </IconContext.Provider>
            </WhiteCard>
            <div className='h-full xl:w-full flex flex-col gap-2 w-2/5 '>
                <WhiteCard className="size-full " direction="right">
                    <EcologicalFootprint energyConsumptionIn={100} />
                </WhiteCard>
                <WhiteCard className="size-full " direction="right">
                    <DeviceTable deviceContext={deviceContext} />
                </WhiteCard>

            </div>
        </div>
    );
}

export default Dashboard;