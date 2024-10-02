import { List } from "flowbite-react";
import { CiCircleQuestion } from "react-icons/ci";
import { IoMdBatteryFull } from "react-icons/io";
import { WiHumidity } from "react-icons/wi";
import { FaTemperatureThreeQuarters, FaBolt, FaCalendar, FaSun, FaFan, FaCloudSun, FaCirclePlay, FaLightbulb } from "react-icons/fa6";
import { RxSwitch } from "react-icons/rx";
import { TbCircuitSwitchOpen } from "react-icons/tb";
import { MdOutlineEnergySavingsLeaf } from "react-icons/md";
import { CiSpeaker } from "react-icons/ci";
import { useState } from "react";
import ControlPopup from "../ControlAppliance/ControlPopup";
import { useEffect } from "react";

export default function DeviceRecord({ device }) {
    const [openControl, isOpenControl] = useState(false)

    const closeFun = () =>{
        isOpenControl(false)
    }

    const iconMap = {
        battery: <IoMdBatteryFull className="size-5" />,
        humidity: <WiHumidity className="size-5" />,
        temperature: <FaTemperatureThreeQuarters className="size-5" />,
        power: <FaBolt className="size-5" />,
        energy: <MdOutlineEnergySavingsLeaf className="size-5" />,
        timestamp: <FaCalendar className="size-5" />,
        sun: <FaSun className="size-5" />,
        fan: <FaFan className="size-5" />,
        sensor: <TbCircuitSwitchOpen className="size-5" />,
        weather: <FaCloudSun className="size-5" />,
        media_player: <FaCirclePlay className="size-5" />,
        light: <FaLightbulb className="size-5" />,
        button: <RxSwitch className="size-5" />,
        switch: <RxSwitch className="size-5" />,
        speaker: <CiSpeaker className="size-5" />
    }

    return (
        <List.Item key={device.device_id} className="">

            <ControlPopup applianceId={device.state_entity_id} open={openControl}
            closeFun={closeFun} classDevice={device.device_class}/> 
            <div className="grid grid-cols-3 gap-3 items-center p-3  text-sm"
                onClick={() => {isOpenControl(true)}}
                style={{cursor: "pointer", zIndex: "20"}}
            >
                <div className="flex flex-row gap-4 items-center col-span-1">
                    {iconMap[device.device_class] != null ? iconMap[device.device_class] : <CiCircleQuestion className="size-5" />}
                    <p className="font-semibold">{device.name_by_user == null ? device.name : device.name_by_user}</p>
                </div>
                {device.state != "" &&
                    <div>
                        <p>{device.state}</p>
                    </div>
                }
                <div className={"flex flex-row gap-4 items-center justify-end " + (device.state != "" ? "" : "col-span-2")}>
                    {device.list_of_entities
                        .filter(e => e.entity_id.startsWith('sensor') && e.entity_class != "energy")
                        .sort((a, b) => a.entity_class > b.entity_class ? -1 : 1)
                        .map((sensor, index) => (
                            <div className="flex flex-row gap-1 items-center" key={index}>
                                {iconMap[sensor.entity_class] != null ? iconMap[sensor.entity_class] : <CiCircleQuestion className="size-5" />}
                                {sensor.state} {sensor.unit_of_measurement != undefined && sensor.unit_of_measurement}
                            </div>
                        ))
                    }
                </div>
            </div>
        </List.Item>
    )
}