// Font Awesome 5 icons (react-icons/fa)
import {
    FaLeaf, FaDoorOpen, FaFan, FaCalendar, FaRobot,
    FaWindowMaximize, FaBell, FaCamera, FaIceCream, FaShieldAlt, FaTint, FaLock,
    FaUnlock, FaWindowClose, FaEye, FaEyeSlash, FaCheck,
    FaInfoCircle
} from "react-icons/fa";


// Font Awesome 6 icons (react-icons/fa6)
import {
    FaCircleQuestion, FaGear, FaClock, FaInfo, FaTemperatureThreeQuarters, FaBolt, FaSun, FaCloudSun,
    FaCirclePlay, FaLightbulb, FaHouse,
    FaArrowRight,
    FaArrowLeft,
    FaPlus
} from "react-icons/fa6";

// Other icon libraries
import {
    CiCircleQuestion, CiSpeaker, CiClock1, CiSearch, CiWarning
} from "react-icons/ci";

import {
    IoMdBatteryFull, IoMdLeaf
} from "react-icons/io";

import {
    WiHumidity
} from "react-icons/wi";

import {
    MdOutlineEnergySavingsLeaf, MdThermostat, MdAirlineSeatReclineExtra, MdOutlinePower
} from "react-icons/md";

import {
    TbCircuitSwitchOpen
} from "react-icons/tb";

import {
    RiMoneyEuroCircleFill
} from "react-icons/ri";

import {
    FiSunrise, FiSunset, FiClock, FiCalendar
} from "react-icons/fi";

import {
    GoDotFill
} from "react-icons/go";

import {
    RxSwitch
} from "react-icons/rx";

import { PiTelevisionSimple, PiVideoCameraFill, PiDesktopTowerFill, PiForkKnife } from "react-icons/pi";
import { TbMicrowave } from "react-icons/tb";
import { BiSolidWasher, BiSolidFridge } from "react-icons/bi";
import { LuBlinds } from "react-icons/lu";
import { TbAirConditioning } from "react-icons/tb";
import { MdSensorWindow } from "react-icons/md";
import { IoWater } from "react-icons/io5";
import { IoExtensionPuzzleSharp } from "react-icons/io5";
import { RiHome2Fill } from "react-icons/ri";

import { RiHomeLine } from "react-icons/ri";



export const backend = "http://localhost:8000"
export const domain = "http://localhost"

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
    battery: (className) => <IoMdBatteryFull className={className} />,
    humidity: (className) => <WiHumidity className={className} />,
    temperature: (className) => <FaTemperatureThreeQuarters className={className} />,
    power: (className) => <FaBolt className={className} />,
    energy: (className) => <MdOutlineEnergySavingsLeaf className={className} />,
    energy_big: (className) => <MdOutlineEnergySavingsLeaf className={className} />,
    timestamp: (className) => <FaCalendar className={className} />,
    sun: (className) => <FaSun className={className} />,
    fan: (className) => <FaFan className={className} />,
    sensor: (className) => <TbCircuitSwitchOpen className={className} />,
    weather: (className) => <FaCloudSun className={className} />,
    media_player: (className) => <FaCirclePlay className={className} />,
    play: (className) => <FaCirclePlay className={className} />,
    light: (className) => <FaLightbulb className={className} />,
    button: (className) => <RxSwitch className={className} />,
    switch: (className) => <RxSwitch className={className} />,
    speaker: (className) => <CiSpeaker className={className} />,
    info: (className) => <FaInfoCircle className={className} />,
    search: (className) => <CiSearch className={className} />,
    sunset: (className) => <FiSunset className={className} />,
    sunrise: (className) => <FiSunrise className={className} />,
    time: (className) => <FiClock className={className} />,
    unknown: (className) => <CiCircleQuestion className={className} />,
    weekday: (className) => <FiCalendar className={className} />,
    leaf: (className) => <IoMdLeaf className={className} />,
    dot: (className) => <GoDotFill className={className} />,
    warning: (className) => <CiWarning className={className} />,
    money: (className) => <RiMoneyEuroCircleFill className={className} />,
    door: (className) => <FaDoorOpen className={className} />,
    lock: (className) => <FaLock className={className} />,
    camera: (className) => <PiVideoCameraFill className={className} />,
    tv: (className) => <PiTelevisionSimple className={className} />,
    air_conditioner: (className) => <TbAirConditioning className={className} />,
    thermostat: (className) => <MdThermostat className={className} />,
    refrigerator: (className) => <BiSolidFridge className={className} />,
    microwave: (className) => <TbMicrowave className={className} />,
    light_bulb: (className) => <FaLightbulb className={className} />,
    window: (className) => <MdSensorWindow className={className} />,
    doorbell: (className) => <FaBell className={className} />,
    blinds: (className) => <LuBlinds className={className} />,
    dishwasher: (className) => <div className="relative">
        <PiForkKnife className={className} />
        <IoWater className="absolute -right-1 -bottom-1 size-5" />
    </div>,
    oven: (className) => <CiCircleQuestion className={className} />,
    washing_machine: (className) => <BiSolidWasher className={className} />,
    induction_stove: (className) => <CiCircleQuestion className={className} />,
    desktop: (className) => <PiDesktopTowerFill className={className} />,
    eye: (className) => <FaEye className={className} />,
    eye_slash: (className) => <FaEyeSlash className={className} />,
    puzzle: (className) => <IoExtensionPuzzleSharp className={className} />,
    gear: (className) => <FaGear className={className} />,
    home: (className) => <FaHouse className={className} />,
    check: (className) => <FaCheck className={className} />,
    home_empty: (className) => <RiHomeLine className={className} />,
    home_full: (className) =>
        <div className="relative flex items-center justify-center">
            <RiHomeLine className={className} />
            <FaLightbulb className={`size-5 absolute inset-0 m-auto`} />
        </div>,
    arrow_right:(className) => <FaArrowRight className={className} />,
    arrow_left:(className) => <FaArrowLeft className={className} />,
    plus:(className) => <FaPlus className={className} />,
}

export const DevicesTypes = {
    fan: { color: "bg-blue-300" },
    sensor: { color: "bg-gray-300" },
    media_player: { color: "bg-purple-300" },
    light: { color: "bg-yellow-200" },
    button: { color: "bg-green-300" },
    switch: { color: "bg-indigo-300" },
    speaker: { color: "bg-pink-300" },
    door: { color: "bg-red-300" },
    lock: { color: "bg-gray-400" },
    camera: { color: "bg-blue-400" },
    tv: { color: "bg-purple-400" },
    air_conditioner: { color: "bg-cyan-300" },
    thermostat: { color: "bg-orange-300" },
    refrigerator: { color: "bg-teal-300" },
    microwave: { color: "bg-amber-300" },
    window: { color: "bg-sky-300" },
    doorbell: { color: "bg-lime-300" },
    blinds: { color: "bg-violet-300" },
    dishwasher: { color: "bg-blue-200" },
    oven: { color: "bg-red-400" },
    washing_machine: { color: "bg-indigo-200" },
    induction_stove: { color: "bg-gray-500" },
    desktop: { color: "bg-zinc-300" }
};


export function getDeviceIcon(key, classname = "size-9") {
    const colorclass = key in DevicesTypes ? DevicesTypes[key].color : "bg-white"
    return <div className={`rounded-full p-2 ${colorclass}`}>
        {getIcon(key, classname)}
    </div>
}




// Function to get an icon with optional className
export function getIcon(key, className = "size-5") {
    if (key in iconMap) {
        return iconMap[key](className); // Pass the className to the icon function
    } else {
        return iconMap["unknown"](className); // Fallback icon
    }
}

/*
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
}*/


export const callService = async (entity_id, service, data) => {
    let body = {}
    body["entity_id"] = entity_id
    body["service"] = service
    body["data"] = data;
    body["user"] = "Davide" //TODO: Mettere il nome giusto
    const response = await fetch(`${backend}${"/service"}`, {
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

export const apiFetch = async (url, method = "GET", body = null) => {
    const response = await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json",
        },
    });
    const data = await response.json();
    return data;
};