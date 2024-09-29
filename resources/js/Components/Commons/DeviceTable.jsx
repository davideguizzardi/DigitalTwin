import { useState, useEffect } from "react";
import { List, TextInput} from "flowbite-react"
import { CiCircleQuestion ,CiSearch} from "react-icons/ci";
import { IoMdBatteryFull } from "react-icons/io";
import { WiHumidity } from "react-icons/wi";
import { FaTemperatureThreeQuarters, FaBolt, FaCalendar, FaSun, FaFan, FaCloudSun, FaCirclePlay, FaLightbulb } from "react-icons/fa6";
import { RxSwitch } from "react-icons/rx";
import { TbCircuitSwitchOpen } from "react-icons/tb";
import { MdOutlineEnergySavingsLeaf } from "react-icons/md";
import { CiSpeaker } from "react-icons/ci";

export function DeviceTable({ deviceContext }) {

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

    const [deviceList, setDeviceList] = useState([])
    const [searchQuery, setSearchQuery] = useState("")



    useEffect(() => {
        setDeviceList(deviceContext)
    }, [deviceContext])

    return (
        <div className="size-full flex flex-col">
            <div>
                <TextInput id="device_search" type="text" icon={CiSearch} placeholder="Enter device name..." onKeyUp={(value) => setSearchQuery(value.target.value)} />
            </div>
            <div className="bg-zinc-50 text-gray-800 rounded-md col-span-5 h-full overflow-y-scroll">
                <List unstyled className="divide-y divide-gray-300 p-1 h-full">
                    {deviceList.length > 0 &&
                        deviceList
                            .filter(d => d.name != "Sun" && d.name != "Forecast")
                            .filter(d => (d.name_by_user == null ? d.name : d.name_by_user).toUpperCase().includes(searchQuery.toUpperCase()))
                            .sort((a, b) => a.device_class < b.device_class ? -1 : 1)
                            .map(device => (
                                <List.Item key={device.device_id} className="">

                                    <div className="grid grid-cols-3 gap-3 items-center m-3  text-sm">
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
                                                .map(sensor => (
                                                    <div className="flex flex-row gap-1 items-center">
                                                        {iconMap[sensor.entity_class] != null ? iconMap[sensor.entity_class] : <CiCircleQuestion className="size-5" />}
                                                        {sensor.state} {sensor.unit_of_measurement != undefined && sensor.unit_of_measurement}
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                </List.Item>
                            ))
                    }
                </List>
            </div >
        </div>
    )
}