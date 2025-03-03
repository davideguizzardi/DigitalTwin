import { AutomationTable } from "@/Components/Automation/AutomationTable";
import { ThemeButton } from "@/Components/Commons/ThemeButton";
import { useState } from "react";
import { useEffect } from "react";
import { getIcon } from "@/Components/Commons/Constants";

export default function Automation({id=""}) {
    const [automationContext, setAutomationContext] = useState({})

    useEffect(() => {
        const fetchAutomationContext = async () => {
            const response = await fetch("http://localhost:8000/automation?get_suggestions=false")
            if (response.ok) {
                const result = await response.json()
                setAutomationContext(result)
            }
        }
        fetchAutomationContext()
    }, [])

    return (
        <div className="p-5 h-full max-h-screen">
            <AutomationTable className="" automation_context={automationContext} openId={id}/>
            <a href={route("automation.add")}>
                <ThemeButton className="absolute bottom-0 right-0 m-5 rounded-full bg">
                    {getIcon("plus", "size-8")}
                </ThemeButton>
            </a>
        </div>
    )
}