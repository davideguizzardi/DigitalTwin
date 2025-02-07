import { useState, useEffect } from "react";
import { List, Button, TextInput, Tooltip } from "flowbite-react"


import { CiSearch } from "react-icons/ci";
import { Switch } from "@mui/material";
import { AutomationDetails2 } from "./AutomationDetailsV2";
import { callService, getIcon } from "@/Components/Commons/Constants";
import { StyledButton } from "@/Components/Commons/StyledBasedComponents";
import { useLaravelReactI18n } from 'laravel-react-i18n';

export function AutomationTable2({ automation_context }) {

    const [automationList, setAutomationList] = useState([])
    const [openAutomation, setOpenAutomation] = useState("")
    const [searchQuery, setSearchQuery] = useState("")

    const [currentDay, setCurrentDay] = useState("")
    const {t} = useLaravelReactI18n()



    const handleSwitchChange = async (event, entity_id) => {
        const checked = event.target.checked;
        let service = "turn_off"
        if (checked) {
            service = "turn_on"
        }
        const resp = await callService(entity_id, service, {})

        if (Object.keys(resp).length <= 0) {
            alert(t("Some error occurred while trying to change automation status, retry later..."))
        }
    }

    const handleTriggerButtonPress= async(entity_id)=>{
        const resp = await callService(entity_id, "trigger", {})
    }

    useEffect(() => {
        const currentDate = new Date();
        const options = { weekday: 'short' };  // 'short' gives the abbreviated day name
        const currentDayShortName = currentDate.toLocaleDateString('en-US', options).toLowerCase();
        setCurrentDay(currentDayShortName)
    }, [])


    useEffect(() => {
        setAutomationList(automation_context)
    }, [automation_context])

    return (
        <div className="grid grid-cols-2 gap-5">
            <div className="flex flex-col gap-2 col-span-1">
                <div>
                    <TextInput id="device_search" type="text" icon={CiSearch} placeholder={`${t("Enter automation name")}...`} onKeyUp={(value) => setSearchQuery(value.target.value)} />
                </div>
                <div className="bg-zinc-50 text-gray-800 rounded-md col-span-5">
                    <List unstyled className="divide-y divide-gray-300">
                        {automationList.length > 0 &&
                            automationList
                                .sort((a, b) => a.time < b.time ? -1 : 1)
                                .filter(a => a.name.toUpperCase().includes(searchQuery.toUpperCase()))
                                .map(automation => (
                                    <List.Item key={automation.id} >
                                        <div className="grid grid-cols-6 gap-3 items-center m-3  text-sm">
                                            <div className="col-span-3 flex flex-row gap-3 hover:cursor-pointer" onClick={() => setOpenAutomation(automation)}>
                                                <p className={openAutomation==automation? "font-bold":"font-semibold"}>{automation.name}</p>
                                                {automation.suggestions && automation.suggestions.length > 0 &&
                                                    <Tooltip content={t("Green suggestions are available")}>
                                                        {getIcon("info")}
                                                    </Tooltip>

                                                }
                                            </div>
                                            <div className="">

                                                {automation.time != "" && (automation.days.includes(currentDay)  || automation.days.length==0) &&
                                                    <div className="flex flex-row justify-end items-center ">
                                                        {getIcon("time")}{automation.time}
                                                    </div>

                                                }
                                            </div>
                                            <div className="flex justify-end">
                                                <Switch defaultChecked={automation.state == "on"}
                                                    onChange={(event) => handleSwitchChange(event, automation.entity_id)}
                                                    sx={{
                                                        "& .MuiSwitch-switchBase.Mui-checked": {
                                                            color: "#a3e635",  // Thumb color when checked
                                                        },
                                                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                                            backgroundColor: "#a3e635",  // Track color when checked
                                                        },
                                                    }} />
                                            </div>
                                            <div className="flex justify-end">
                                                <StyledButton variant={"primary"} onClick={()=>handleTriggerButtonPress(automation.entity_id)}>{getIcon("play")}</StyledButton>
                                            </div>
                                        </div>
                                    </List.Item>
                                ))
                        }
                    </List>
                </div >
            </div>

            <div className="col-span-1">
                <AutomationDetails2 automation_in={openAutomation} />
            </div>
        </div>
    )
}