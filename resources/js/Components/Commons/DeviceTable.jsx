import { useState, useEffect } from "react";
import { List, TextInput} from "flowbite-react"
import { CiCircleQuestion ,CiSearch} from "react-icons/ci";
import DeviceRecord from "./DeviceRecord";
import { useLaravelReactI18n } from 'laravel-react-i18n';

export function DeviceTable({ deviceContext }) {
    const [deviceList, setDeviceList] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const {t} = useLaravelReactI18n()
    useEffect(() => {
        setDeviceList(deviceContext)
    }, [deviceContext])

    return (
        <div className="size-full flex flex-col">
            <h1 className="text-2xl dark:text-white text-center">{t("Device List")}</h1>
            <div>
                <TextInput id="device_search" type="text" icon={CiSearch} placeholder="Enter device name..." onKeyUp={(value) => setSearchQuery(value.target.value)} />
            </div>
            <div className="bg-zinc-50 text-gray-800 dark:bg-neutral-900 dark:text-gray-300 rounded-md col-span-5 h-full overflow-y-scroll">
                <List unstyled className="divide-y divide-gray-300 p-1 h-full">
                    {deviceList.length > 0 &&
                        deviceList
                            .filter(d => d.name != "Sun" && d.name != "Forecast")
                            .filter(d => (d.name_by_user == null ? d.name : d.name_by_user).toUpperCase().includes(searchQuery.toUpperCase()))
                            .sort((a, b) => a.device_class < b.device_class ? -1 : 1)
                            .map(device => (<DeviceRecord device={device} key={device.device_id}/>))
                    }
                </List>
            </div >
        </div>
    )
}