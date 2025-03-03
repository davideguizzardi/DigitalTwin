import { useState, useEffect, useContext } from "react";
import { Table, TextInput, } from "flowbite-react"
import { getIcon } from "../Commons/Constants";
import { DeviceContext } from "../ContextProviders/DeviceProvider";
import { DevicesTypes } from "../Commons/Constants";

import { StyledButton } from "../Commons/StyledBasedComponents";

import { useLaravelReactI18n } from "laravel-react-i18n";

function IconSelector({ default_icon, onIconChange, open, toggleDropdown, t }) {
    const iconOptions = Object.keys(DevicesTypes)


    return (
        <div className="relative">
            {/* Selected Icon */}
            <div
                className="cursor-pointer flex items-center space-x-2"
                onClick={(e) => {
                    toggleDropdown(); // Toggle the dropdown open/close
                }}
            >
                {getIcon(default_icon, "size-8")}<span className="text-sm">{t(default_icon)}</span>
            </div>
            {/* Dropdown Options */}
            {
                open && (<>

                    <div className="absolute 2xl:-left-52 mt-2 bg-zinc-50  border border-gray-300 rounded-md shadow-lg z-10">
                        <div className="p-2  grid grid-flow-col grid-rows-4 gap-2">
                            {iconOptions.map((icon) => (
                                <div
                                    key={icon}
                                    className="cursor-pointer hover:bg-gray-100 p-1 flex items-center space-x-2"
                                    onClick={(e) => {
                                        onIconChange(icon); // Notify parent of the icon change
                                        toggleDropdown(); // Close dropdown after selection
                                    }}
                                >
                                    {getIcon(icon, "size-8")}
                                    <span className="text-sm">{t(icon)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
                )
            }
        </div >
    );
}


export function DeviceConfiguration({ backSection, endSection, isInitialConfiguration = true }) {
    const { deviceList, setDeviceList } = useContext(DeviceContext);
    const [openIndex, setOpenIndex] = useState(-1)
    const { t } = useLaravelReactI18n()



    const handleIconChange = (index, newIcon) => {
        const updatedList = [...deviceList];
        updatedList[index].category = newIcon;
        setDeviceList(updatedList);
        setOpenIndex(-1)
    };

    const handleNameChange = (index, newName) => {
        const updatedDeviceList = deviceList.map((device, i) =>
            i === index ? { ...device, name: newName } : device
        );
        setDeviceList(updatedDeviceList);
    };

    const handleMoveDevice = (index, show) => {
        setDeviceList(deviceList =>
            deviceList.map((device, i) =>
                i === index ? { ...device, show: show } : device
            )
        );
    };

    const handleConfigurationSubmit = async () => {
        const body = {
            data: deviceList.map(({ device_id, name, category, show }) => ({
                device_id,
                name,
                category,
                show: show ? 1 : 0,  // Convert boolean to 1 or 0
            }))
        }
        const response = await fetch(`http://127.0.0.1:8000${"/device_configuration/"}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
        if (response.ok) {
            endSection()
        } else {
            alert(t("Some error occurred"))
        }
    }



    useEffect(() => {
        const ignoreType = ["device_tracker", "update", "sun", "weather", "forecast"]
        const device_config = deviceList.map((device) => ({
            ...device,
            category: device.category,
            show: device.show
        }));
        setDeviceList(device_config)
    }, [])

    return (
        <div className="xl:w-full 2xl:w-3/4 px-2 flex flex-col gap-4 mb-4 overflow-y-auto">

            <div className="flex flex-col gap-1 bg-zinc-50 rounded-md">
                <div>
                    <Table className="table-auto">
                        <Table.Head className="">
                            <Table.HeadCell>
                                {t("Category")}
                            </Table.HeadCell>
                            <Table.HeadCell>
                                {t("Name")}
                            </Table.HeadCell>
                            <Table.HeadCell>
                                {t("Details")}
                            </Table.HeadCell>
                            <Table.HeadCell>
                                {t("State")}
                            </Table.HeadCell>
                            <Table.HeadCell />
                        </Table.Head>
                        <Table.Body className="divide-y">
                            {(deviceList || [])
                                .map((device, originalIndex) => ({ ...device, originalIndex })) // Store original index
                                .filter(device => device.show)
                                .map((device) => (
                                    <Table.Row key={device.device_id}>
                                        <Table.Cell>
                                            <IconSelector
                                                t={t}
                                                default_icon={device.category}
                                                onIconChange={(icon) => handleIconChange(device.originalIndex, icon)}
                                                open={openIndex === device.originalIndex}
                                                toggleDropdown={() => setOpenIndex(openIndex === device.originalIndex ? -1 : device.originalIndex)}
                                            />
                                        </Table.Cell>
                                        <Table.Cell>
                                            <TextInput
                                                id="device_name"
                                                type="text"
                                                value={device.name}
                                                onChange={(value) => handleNameChange(device.originalIndex, value.target.value)} />
                                        </Table.Cell>
                                        <Table.Cell>
                                            {device.manufacturer}-{device.model}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {device.state}
                                        </Table.Cell>
                                        <Table.Cell>
                                            <div className="flex justify-end">

                                                <StyledButton onClick={() => handleMoveDevice(device.originalIndex, false)}>
                                                    {getIcon("eye_slash")}
                                                </StyledButton>
                                            </div>
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                        </Table.Body>
                    </Table>
                </div>
            </div>
            <div className="flex flex-col gap-1 bg-zinc-50 rounded-md mt-2">

                <div className="text-2xl font-[Inter] justify-center flex mt-2">
                    <h1>{t("Ignored Devices")}</h1>
                </div>

                <Table className="">
                    <Table.Head>
                        <Table.HeadCell>
                            {t("Category")}
                        </Table.HeadCell>
                        <Table.HeadCell>
                            {t("Name")}
                        </Table.HeadCell>
                        <Table.HeadCell>
                            {t("Details")}
                        </Table.HeadCell>
                        <Table.HeadCell>
                            {t("State")}
                        </Table.HeadCell>
                        <Table.HeadCell />
                    </Table.Head>
                    <Table.Body className="divide-y">
                        {(deviceList || [])
                            .map((device, originalIndex) => ({ ...device, originalIndex })) // Store original index
                            .filter(device => !device.show)
                            .map((device) => (
                                <Table.Row className="" key={device.device_id}>
                                    <Table.Cell>
                                        <div className="flex items-center space-x-2">

                                            {getIcon(device.category, "size-8")}<span className="text-sm capitalize">{t(device.device_class)}</span>
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        {device.name}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {device.manufacturer}-{device.model}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {device.state}
                                    </Table.Cell>
                                    <Table.Cell>

                                        <div className="flex justify-end">

                                            <StyledButton onClick={() => handleMoveDevice(device.originalIndex, true)}>
                                                {getIcon("eye")}
                                            </StyledButton>
                                        </div>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                    </Table.Body>
                </Table>
            </div>

            {
                isInitialConfiguration ?
                    <div className="grid grid-cols-2 ">
                        <div className="flex justify-start">
                            <StyledButton onClick={() => backSection()}>
                                {getIcon("arrow_left")}{t("Back")}
                            </StyledButton>
                        </div>

                        <div className="flex justify-end">
                            {deviceList.filter(d => d.show).length > 0 &&

                                <StyledButton onClick={() => handleConfigurationSubmit()}>
                                    {t("Next")}{getIcon("arrow_right")}
                                </StyledButton>
                            }
                        </div>
                    </div>
                    :
                    <div className="flex w-full h-min py-3 items-end justify-center">
                        <StyledButton onClick={() => { handleConfigurationSubmit() }}>{t("Save")}</StyledButton>
                    </div>
            }
        </div>
    )
}