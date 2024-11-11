import { CiCircleQuestion } from "react-icons/ci";
import { FaGear, FaClock, FaInfo, FaTowerBroadcast, FaStopwatch } from "react-icons/fa6";
import { IoMdBatteryFull } from "react-icons/io";
import { WiHumidity } from "react-icons/wi";
import {
    FaTemperatureThreeQuarters, FaBolt, FaCalendar,
    FaSun, FaFan, FaCloudSun, FaCirclePlay, FaLightbulb
} from "react-icons/fa6";
import { FaInfoCircle } from "react-icons/fa";
import { RxSwitch } from "react-icons/rx";
import { TbCircuitSwitchOpen } from "react-icons/tb";
import { MdOutlineEnergySavingsLeaf } from "react-icons/md";
import { CiSpeaker, CiClock1, CiSearch } from "react-icons/ci";
import { FiSunrise, FiSunset, FiClock, FiCalendar } from "react-icons/fi";

export const backend = "http://localhost:8000"

export const daysOrder = [
    "mon",
    "tue",
    "wed",
    "thu",
    "fri",
    "sat",
    "sun"
]

//new verision, use this instead of daysOrder
export const DAYS = {
    "mon": { "name": "Monday" },
    "tue": { "name": "Tuesday" },
    "wed": { "name": "Wedsneday" },
    "thu": { "name": "Thursday" },
    "fri": { "name": "Friday" },
    "sat": { "name": "Saturday" },
    "sun": { "name": "Sunday" },
}

export const iconMap = {
    battery: <IoMdBatteryFull className="size-5" />,
    humidity: <WiHumidity className="size-5" />,
    temperature: <FaTemperatureThreeQuarters className="size-5" />,
    power: <FaBolt className="size-5" />,
    energy: <MdOutlineEnergySavingsLeaf className="size-5" />,
    energy_big: <MdOutlineEnergySavingsLeaf className="size-8" />,
    timestamp: <FaCalendar className="size-5" />,
    sun: <FaSun className="size-5" />,
    fan: <FaFan className="size-5" />,
    sensor: <TbCircuitSwitchOpen className="size-5" />,
    weather: <FaCloudSun className="size-5" />,
    media_player: <FaCirclePlay className="size-5" />,
    play: <FaCirclePlay className="size-5" />,
    light: <FaLightbulb className="size-5" />,
    button: <RxSwitch className="size-5" />,
    switch: <RxSwitch className="size-5" />,
    speaker: <CiSpeaker className="size-5" />,
    info: <FaInfoCircle className="size-5" />,
    search: <CiSearch className="size-5" />,
    sunset: <FiSunset className="size-5" />,
    sunrise: <FiSunrise className="size-5" />,
    time: <FiClock className="size-5" />,
    unknown: <CiCircleQuestion className="size-5" />,
    weekday: <FiCalendar className="size-5" />,
    sensorTrigger: <FaTowerBroadcast className="size-5"/>,
    stopwatch: <FaStopwatch className="size-5"/>
}



export function getIcon(key, size=null) {
    if (key in iconMap) {
        if (size){
            let iconSize = iconMap[key]
            console.log(iconSize)
            return iconSize
        }
        return (iconMap[key])
    }
    else {
        return (iconMap["unknown"])
    }
}


export const callService = async (entity_id,service, data) => {
    let body = {}
    body["entity_id"] = entity_id
    body["service"] = service
    body["data"] = data;
    body["user"]="Davide" //TODO: Mettere il nome giusto
    const response = await fetch(`http://127.0.0.1:8000${"/service"}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
    });
    if (response.ok) {
        const ret = await response.json();
        return ret
    }
    else {
        return {}
    }
}