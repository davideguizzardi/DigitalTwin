
import { useState, useEffect} from "react";
import { getIcon ,backend,apiFetch} from "@/Components/Commons/Constants";

import { TimePicker } from "@mui/x-date-pickers";
import { Label, TextInput, List, Select, Textarea } from "flowbite-react";
import { ServicePopup } from "@/Components/Automation/ServicePopup";

import { AutomationSimulation } from "@/Components/Automation/AutomationSimulation";
import { formatServiceName } from "@/Components/Commons/DataFormatter";

import { StyledDiv,StyledButton } from "@/Components/Commons/StyledBasedComponents";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { useLaravelReactI18n } from "laravel-react-i18n";


//icons
import { FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { FiSunrise, FiSunset, FiClock } from "react-icons/fi";

export default function AddAutomation({ }) {
    const {t} = useLaravelReactI18n()
    const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]

    //Automations variable
    const [automationName, setAutomationName] = useState("")
    const [automationDescription, setAutomationDescription] = useState("")
    const [automationTrigger, setAutomationTrigger] = useState([])
    const [automationCondition, setAutomationCondition] = useState([])
    const [automationAction, setAutomationAction] = useState([])

    const [selectedTrigger, setSelectedTrigger] = useState("time")
    const [sunOffset, setSunoffset] = useState(0)
    const [daysList, setDaysList] = useState(DAYS)
    const [entityList, setEntityList] = useState([])
    const [deviceList, setDeviceList] = useState([])
    const [openModal, setOpenModal] = useState(false)
    const [selectedEntity, setSelectedEntity] = useState(null)

    const [servicesToAdd, setServiceToAdd] = useState({})
    const [deviceIdToAdd, setDeviceIdToAdd] = useState({})

    const [automation, setAutomation] = useState({})
    const [simulateAutomationAddition, setSimulateAutomationAddition] = useState(false)

    function servicesClick(selectedId) {
        setOpenModal(true)
        let entity = entityList.filter(en => en.entity_id == selectedId)[0]
        setSelectedEntity(entity)
    }


    function getDeviceName(device_id) {
        const device = deviceList.filter(dev => dev.device_id == device_id)[0]
        return device.name_by_user ? device.name_by_user : device.name
    }

    function buildAutomation(e) {
        if (e)
            e.preventDefault()

        // Validation: Check if trigger and action are provided
        if (!automationTrigger || automationTrigger.length === 0) {
            alert(t("triggerRequired"));
            return;
        }

        if (!automationAction || automationAction.length === 0) {
            alert(t("actionRequired"));
            return; 
        }
        let automation = {}
        automation["id"] = Math.floor(1000000000000 + Math.random() * 9000000000000) //produce a random 13 digit int
        automation["alias"] = automationName
        automation["description"] = automationDescription
        automation["trigger"] = automationTrigger
        automation["condition"] = automationCondition
        automation["action"] = automationAction
        automation["mode"] = "single"

        setAutomation(automation)
        setSimulateAutomationAddition(true)
        return automation
    }

    function handleTimeChange(value) {
        setAutomationTrigger([{
            "platform": "time",
            "at": value.format("HH:mm")
        }])
    }

    function handleSunChange(event_type, offset = undefined) {
        setSelectedTrigger(event_type)
        setAutomationTrigger([
            {
                "platform": "sun",
                "event": event_type,
                "offset": offset ? offset : sunOffset
            }
        ])
    }

    function handleDaysChange(day) {
        let newList = daysList.slice()
        const index = newList.indexOf(day);

        if (index === -1) {
            // Element is not present, so add it
            newList.push(day);
        } else {
            // Element is present, so remove it
            newList.splice(index, 1);
        }
        setDaysList(newList)
        setAutomationCondition([{
            "condition": "time",
            "weekday": newList
        }])
    }

    useEffect(() => {
        if (Object.keys(servicesToAdd).length > 0) {
            let newActions = automationAction.slice()
            let action = {
                "metadata": {},
                "target": {
                    "device_id": deviceIdToAdd
                },
                ...servicesToAdd
            }
            newActions.push(action)
            setAutomationAction(newActions)
        }
    }, [servicesToAdd])

    useEffect( async () => {
        var data = await apiFetch(`${backend}${"/entity"}`)
        setEntityList(data)
        data = await apiFetch(`${backend}${"/device?skip_services=true"}`)
        setDeviceList(data)
    }, [])

    useEffect(() => {
        buildAutomation(null)
    }, [automationAction])


    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className="grid grid-cols-2 gap-3 p-5">
            <ServicePopup open={openModal} selectedEntity={selectedEntity} entityList={entityList} closeFun={() => setOpenModal(false)} submitFun={setServiceToAdd} />
            <StyledDiv variant="primary" className="">
                <form className="flex flex-col gap-3" onSubmit={buildAutomation}>
                    <h1 className="font-[Inter] font-light text-xl">{t("creationTitle")}</h1>
                    <div className="block">
                        <Label htmlFor="name" value={t("nameLabel")} />
                        <TextInput id="name" type="text" placeholder={t("namePlaceholder")}
                            onKeyUp={(value) => setAutomationName(value.target.value)} required />
                    </div>
                    <div className="block">
                        <Label htmlFor="description" value={t("descriptionLabel")}/>
                        <Textarea id="description" type="text" placeholder={t("descriptionPlaceholder")}
                            onKeyUp={(value) => setAutomationDescription(value.target.value)} rows={4} />
                    </div>
                    <div className="flex flex-row gap-3 items-center">
                        <div className="block">
                            <Label htmlFor="trigger" value={t("triggerLabel")}/>
                            <div className="flex flex-row gap-3">
                                <StyledButton variant="primary" className={(selectedTrigger == "time" ? "bg-lime-400" : "bg-neutral-50")}
                                    onClick={() => setSelectedTrigger("time")}>
                                    {t("time")} <FiClock className="ml-2 size-5" />
                                </StyledButton>
                                <StyledButton variant="secondary" className={(selectedTrigger == "sunset" ? "bg-lime-400" : "bg-neutral-50")}
                                    onClick={() => handleSunChange("sunset", 0)}>
                                    {t("sunset")} <FiSunset className="ml-2 size-5" />
                                </StyledButton>
                                <StyledButton variant="secondary" className={(selectedTrigger == "sunrise" ? "bg-lime-400" : "bg-neutral-50")}
                                    onClick={() => handleSunChange("sunrise", 0)}>
                                    {t("sunrise")} <FiSunrise className="ml-2 size-5" />
                                </StyledButton>
                            </div>
                        </div>
                        <div className="block">
                            <Label htmlFor="trigger" value={selectedTrigger == "time" ? t("atLabel"): t("offsetLabel")} />
                            <div>

                                {selectedTrigger == "time" &&
                                    <TimePicker ampm={false} size="small" onChange={(value) => handleTimeChange(value)}
                                        sx={{ ".css-nxo287-MuiInputBase-input-MuiOutlinedInput-input": { height: "0.9rem" } }}
                                    />
                                }
                                {(selectedTrigger == "sunset" || selectedTrigger == "sunrise") &&
                                    <TextInput id="offset" type="number" min={-5 * 3600} max={5 * 3600} placeholder="0"
                                        onChange={(value) => {
                                            setSunoffset(value.target.value);
                                            handleSunChange(selectedTrigger, value.target.value)
                                        }} />
                                }
                            </div>
                        </div>

                    </div>
                    <div className="block">
                        <Label htmlFor="days" value={t("daysLabel")}/>
                        <div className="flex flex-row gap-2">
                            {
                                DAYS.map(day => (
                                    <StyledButton variant="secondary" className={daysList.includes(day) ? "bg-lime-400" : "bg-neutral-50"}
                                        onClick={() => handleDaysChange(day)}>
                                        {day}
                                    </StyledButton>
                                ))
                            }
                        </div>
                    </div>
                    <div className="flex flex-col gap-5 mt-10">
                        <div className="block">

                            <Label htmlFor="newaction" value={t("addActionLabel")} />
                            <div className="flex flex-row gap-2">

                                <Select onChange={(sel) => setDeviceIdToAdd(sel.target.value)}>
                                    {
                                        deviceList.map(dev => (
                                            <option value={dev.device_id} key={dev.device_id}>{dev.name_by_user ? dev.name_by_user : dev.name}</option>
                                        ))
                                    }
                                </Select>
                                <StyledButton variant="secondary" className="bg-green-200 hover:bg-green-300 "
                                    onClick={() => servicesClick(deviceList.filter(el => el.device_id == deviceIdToAdd)[0].state_entity_id)}
                                >
                                    <FaPlus className="size-5" />
                                </StyledButton>
                            </div>
                        </div>
                        <div className="block">
                            <Label htmlFor="actions" value={t("actionsLabel")} />
                            <List unstyled className="divide-y divide-gray-300 text-gray-800">
                                {
                                    automationAction.map((action_el, index) => (
                                        <List.Item key={action_el.target.device_id} >
                                            <div className="grid grid-cols-2 rounded-md p-2">

                                                <div className="flex flex-row items-center gap-10 col-span-1">

                                                    {getIcon(action_el.service.split(".")[0])}{formatServiceName(action_el.service.split(".")[1])}{` "${getDeviceName(action_el.target.device_id)}"`}
                                                </div>
                                                <div className="flex flex-row justify-end items-end col-span-1 ">
                                                    <StyledButton variant="delete" onClick={() => setAutomationAction(automationAction.filter((el, ind) => ind != index))}>
                                                        <MdDelete className="size-5" />{t("delete")}
                                                    </StyledButton>
                                                </div>


                                            </div>
                                        </List.Item>
                                    ))
                                }
                            </List>
                        </div>
                    </div>
                    <StyledButton type="submit" variant={"primary"}
                        onClick={(ev) => buildAutomation(ev)}
                    >
                        {t("buildAutomationButton")}
                    </StyledButton>
                </form>
            </StyledDiv>
            <div className="flex flex-col gap-3">
                {simulateAutomationAddition &&
                    <div className="col-span-2">
                        <AutomationSimulation automation_to_simulate={JSON.stringify(automation)} />
                    </div>
                }
                {Object.keys(automation).length > 0 &&

                    <Textarea id="automation" placeholder="automation" rows={30} value={JSON.stringify(automation, null, 4)} readOnly />

                }
            </div>
        </div >
        </LocalizationProvider>
    )
}