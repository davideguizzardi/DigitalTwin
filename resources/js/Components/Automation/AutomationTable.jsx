import { useState, useEffect } from "react";
import { List, TextInput, Tooltip, Pagination, Drawer, DrawerHeader, DrawerItems } from "flowbite-react";
import { CiSearch } from "react-icons/ci";
import { Switch } from "@mui/material";
import { AutomationDetails } from "./AutomationDetails";
import { callService, getIcon, rulebot, apiFetch } from "@/Components/Commons/Constants";
import { StyledButton } from "@/Components/Commons/StyledBasedComponents";
import { useLaravelReactI18n } from 'laravel-react-i18n';
import Cookies from "js-cookie";
import ToastNotification from "../Commons/ToastNotification";

export function AutomationTable({ automation_context, openId = "", automationRefreshFun = () => { } }) {
    const [automationList, setAutomationList] = useState([]);
    const [openAutomation, setOpenAutomation] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [currentDay, setCurrentDay] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showToast,setShowToast]=useState(false)
    const [toastType,setToastType]=useState("success")
    const [is2xlOrLarger, setIs2xlOrLarger] = useState(false)
    const itemsPerPage = 5;

    const { t } = useLaravelReactI18n();


    useEffect(() => {
        const checkScreenSize = () => {
            // 1536 is Tailwinds 2xl breakpoint
            setIs2xlOrLarger(window.innerWidth >= 1536)
        }

        checkScreenSize()

        window.addEventListener("resize", checkScreenSize)
        return () => window.removeEventListener("resize", checkScreenSize)
    }, [])

    const handleAutomationDelete = async (automation_id) => {

        const data = await apiFetch(`/automation/${automation_id}`, "DELETE");
        if (data) {
            setShowToast(true)
            setToastType("success")
            automationRefreshFun()
        } else {
            setShowToast(true)
            setToastType("error")
        }
        // TODO: Handle toast and refresh list
    };

    const handleSwitchChange = async (event, entity_id,automation_id) => {
        const checked = event.target.checked;
        let service = checked ? "turn_on" : "turn_off";
        const resp = await callService(entity_id, service, {});
        if (Object.keys(resp).length <= 0) {
            alert(t("Some error occurred while trying to change automation status, retry later..."));
        }
        else{
            const response=apiFetch("/rulebot/automation/state","PUT",{automation_id:automation_id,state:checked? "on":"off"})
        }
    };

    const handleTriggerButtonPress = async (entity_id) => {
        await callService(entity_id, "trigger", {});
    };

    useEffect(() => {
        const currentDate = new Date();
        const options = { weekday: 'short' };
        const currentDayShortName = currentDate.toLocaleDateString('en-US', options).toLowerCase();
        setCurrentDay(currentDayShortName);
    }, []);

    useEffect(() => {
        if (Object.keys(automation_context).length > 0) {
            setAutomationList(automation_context);
            if (openId) {
                const auto = automation_context.find(automation => automation.id == openId);
                if (auto) setOpenAutomation(auto);
            }
        }
    }, [automation_context]);

    // Apply filtering and pagination
    const filteredAutomations = automationList
        .sort((a, b) => a.time < b.time ? -1 : 1)
        .filter(a => a.name.toUpperCase().includes(searchQuery.toUpperCase()));

    const totalPages = Math.ceil(filteredAutomations.length / itemsPerPage);
    const paginatedAutomations = filteredAutomations.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="grid grid-cols-2 2xl:grid-cols-1 2xl:grid-rows-2 gap-5">
            <ToastNotification
                message={t("Configuration saved successfully")}
                isVisible={showToast}
                onClose={() => setShowToast(false)}
                type={toastType}
            />
            <div className="flex flex-col gap-2 h-fit">
                <div className="bg-zinc-50 text-gray-800 rounded-md p-2 text-center">
                    <span className="text-lg font-semibold uppercase">
                    {t("Automations")}
                    </span>
                </div>
                <div>
                    <TextInput
                        id="device_search"
                        type="text"
                        icon={CiSearch}
                        placeholder={`${t("Enter automation name")}...`}
                        onKeyUp={(value) => {
                            setSearchQuery(value.target.value);
                            setCurrentPage(1); // Reset to first page on search
                        }}
                    />
                </div>
                <div className="bg-zinc-50 text-gray-800 rounded-md">
                    <List unstyled className="divide-y divide-gray-300">
                        {paginatedAutomations.map(automation => (
                            <List.Item key={automation.id}>
                                <div className="grid grid-cols-6 gap-3 items-center m-3 text-sm">
                                    <div className="col-span-3 flex flex-row gap-3 hover:cursor-pointer" onClick={() => setOpenAutomation(automation)}>
                                        <p className={openAutomation === automation ? "font-bold" : "font-semibold"}>{automation.name}</p>
                                        {automation.suggestions?.length > 0 && (
                                            <Tooltip content={t("Green suggestions are available")}>
                                                {getIcon("info")}
                                            </Tooltip>
                                        )}
                                    </div>
                                    <div className="">
                                        {automation.time && (automation.days.includes(currentDay) || automation.days.length === 0) && (
                                            <div className="flex flex-row justify-end items-center gap-1">
                                                {getIcon("time")}{automation.time}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-end col-span-2">
                                        <StyledButton variant="secondary" onClick={() => handleAutomationDelete(automation.id)}>
                                            {getIcon("delete")}
                                        </StyledButton>
                                        <Switch
                                            defaultChecked={automation.state === "on"}
                                            onChange={(event) => handleSwitchChange(event, automation.entity_id,automation.id)}
                                            sx={{
                                                "& .MuiSwitch-switchBase.Mui-checked": {
                                                    color: "#a3e635",
                                                },
                                                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                                    backgroundColor: "#a3e635",
                                                },
                                            }}
                                        />
                                    </div>
                                </div>
                            </List.Item>
                        ))}
                    </List>
                </div>
                <div className="flex justify-center">
                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={page => setCurrentPage(page)}
                        />
                    )}
                </div>
            </div>

            <div className="">
                <AutomationDetails automation_in={openAutomation} />
            </div>

            {is2xlOrLarger &&
            

            <Drawer className="w-[50vw] z-[200]" open={Object.keys(openAutomation).length > 0} onClose={() => setOpenAutomation({})} position="left">
                 <DrawerHeader title="" titleIcon={() => <></>} />
                <DrawerItems>
                    <AutomationDetails automation_in={openAutomation} />
                </DrawerItems>
            </Drawer>
            }
        </div>
    );
}
