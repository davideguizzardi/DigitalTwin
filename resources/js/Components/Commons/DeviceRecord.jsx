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
import { getIcon } from "./Constants";

export default function DeviceRecord({ device }) {
    const [openControl, isOpenControl] = useState(false)

    const closeFun = () =>{
        isOpenControl(false)
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
                    {getIcon(device.category,"size-7")}
                    <p className="font-semibold">{device.name}</p>
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
                                {getIcon(sensor.entity_class)}
                                {sensor.state} {sensor.unit_of_measurement != undefined && sensor.unit_of_measurement}
                            </div>
                        ))
                    }
                </div>
            </div>
        </List.Item>
    )
}