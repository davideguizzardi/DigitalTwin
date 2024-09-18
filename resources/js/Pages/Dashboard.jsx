import { useEffect, useState } from "react";
import ListButtons from "@/Components/Commons/ListButtons";
import CardAppliance from "@/Components/Commons/CardAppliance";
import {FaHouse, FaBolt, FaLaptop, FaCloud, FaStar} from "react-icons/fa6";
import Cookies from "js-cookie";
import AnimateMap from "@/Components/Commons/AnimateMap";

const Dashboard = ({ maps, token }) => {
    const firstFloor = maps.length > 0 ? maps[0].floor : 0
    const [floor, setFloor] = useState(firstFloor)
    const [up, setUp] = useState(false)
    const [homeContext, setHomeContext] = useState({})
    const [consumption, setConsumption] = useState({})
    const [indexImg, setIndexImg] = useState(0)
    const [appliance, setAppliance] = useState([])
    
    const floorBtn = maps.map((element, index) => {
        return {
            callback: () => {
                setUp(element.floor > floor)
                setFloor(element.floor)
                setIndexImg(index)
            },
            text: element.floor,
            icon: (<></>)
    }})

    useEffect(()=>{
        const fetchAppliance = async () =>{
            const response = await fetch("http://localhost:8000/map")
            response.json().then((result) => {
                const updateState = result.map((e) =>{
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
        const fetchHomeContext = async() =>{
            const response = await fetch("http://localhost:8000/virtual/home")
            const result = await response.json()
            setHomeContext(result)
        }
        const fetchConsuption = async () =>{
            const response = await fetch("http://localhost:8000/virtual/history/total/hourly")
            const result = await response.json()
            let consumptionState = []
            Object.keys(result).forEach((e, i) =>{
                    if(i >23){
                        const [day, hour] = e.split(" ", 2)
                        const con = Math.round(result[e].power_consumption *10)/10
                        consumptionState = [...consumptionState, con]
                    }
            })
            setConsumption({x: Array.from(Array(24).keys()), y: consumptionState})            
        }
        fetchHomeContext()
        fetchAppliance()
        fetchConsuption()
        Cookies.set("auth-token", token)
    }, [floor])

    return (
        <div className="size-full flex gap-2 p-2">
            <div className='size-full flex flex-col bg-white gap-4 p-1 shadow rounded w-3/5 lg:w-full'>
                <div className="w-full flex items-center justify-center mt-6 gap-2 p-3">
                    <FaHouse size={36}/>
                    <h1 className="text-2xl">Your Home</h1>
                </div>
                {
                    maps.length > 0 ?
                        <div className="size-full flex items-center justify-center">
                            <div className="relative flex flex-col-reverse w-full justify-center items-center shadow">
                                <AnimateMap map={maps[indexImg].url} up={up}/>
                                {appliance.filter((e) => e.floor==floor).map((e) => (<CardAppliance key={e.id} appliance={e}/>))}
                            </div>
                            <div className="flex flex-col justify-center items-center">
                                <h1>Floors</h1>
                                <ListButtons dataButtons={floorBtn} index={indexImg}/>
                            </div>
                        </div>
                        :
                        <div className="size-full flex justify-center items-center">
                            <p className='text-center'>No map has been uploded yet, <br></br> you can add your house's map clicking
                                <a style={{ color: "blue" }} href={route("configuration")}> here</a></p>
                        </div>
                }
                <div className="flex items-center justify-around p-2">
                    <div className="lg:w-48 flex flex-col p-2 bg-gray-200 rounded shadow">
                        <div className="flex items-center gap-1">
                            <FaBolt size={16}/> <h1>Power usage</h1>
                        </div>
                        <div className="flex justify-end">
                            {homeContext.power_usage + " " + homeContext.power_usage_unit}
                        </div>
                    </div>
                    <div className="lg:w-48 flex flex-col p-2 bg-gray-200 rounded shadow">
                        <div className="flex items-center gap-1">
                            <FaLaptop size={16}/> <h1>Active devices</h1>
                        </div>
                        <div className="flex justify-end">
                            {homeContext.power_usage}
                        </div>
                    </div>
                    <div className="lg:w-48 flex flex-col p-2 bg-gray-200 rounded shadow">
                        <div className="flex items-center gap-1">
                            <FaCloud size={16}/> <h1>Emissions</h1>
                        </div>
                        <div className="flex justify-end">
                            {homeContext.emissions} {homeContext.emissions_unit}
                        </div>
                    </div>
                </div>
            </div>
            <div className='h-full xl:w-full flex flex-col gap-2 w-2/5 '>
                <div className="flex bg-white shadow rounded max-w-full p-4 items-center justify-center">
                    
                </div>
                <div className="w-full h-1/2 bg-white shadow rounded p-4">
                    <h1>Prova</h1>
                </div>

            </div>
        </div>
    );
}

export default Dashboard;