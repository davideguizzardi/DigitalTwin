import { AutomationTable } from "@/Components/Automation/AutomationTable";
import { ThemeButton } from "@/Components/Commons/ThemeButton";
import { useState } from "react";
import { useEffect } from "react";
import { apiFetch, getIcon } from "@/Components/Commons/Constants";

export default function Automation({id=""}) {
    const [automationContext, setAutomationContext] = useState({})

    useEffect(() => {
        const fetchAutomationContext = async () => {
            const response = await apiFetch("/automation?get_suggestions=true")
            if (response) {
                setAutomationContext(response)
            }
        }
        fetchAutomationContext()
    }, [])

    return (
        <div className="p-3 h-full max-h-screen">
            <AutomationTable className="" automation_context={automationContext} openId={id}/>
            <a href={route("automation.add")}>
                <ThemeButton className="absolute bottom-0 right-0 m-5 rounded-full bg">
                    {getIcon("plus", "size-8")}
                </ThemeButton>
            </a>
        </div>
    )
}