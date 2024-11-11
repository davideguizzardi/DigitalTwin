import WhiteCard from "@/Components/Commons/WhiteCard";
import { AutomationTable } from "@/Components/Automation/AutomationTable";
import { useState } from "react";
import { useEffect } from "react";

export default function Automation({}){
    const [automationContext, setAutomationContext] = useState({})

    useEffect(()=>{
        const fetchAutomationContext = async () =>{
            const response = await fetch("http://localhost:8000/virtual/automation")
            if(response.ok){
                const result = await response.json()
                setAutomationContext(result)
            }
        }
        fetchAutomationContext()
    }, [])

    return(
        <div className="pt-16 h-full max-h-screen">
            <WhiteCard className="h-full max-h-screen overflow-y-auto">
                <AutomationTable automation_context={automationContext}/>
            </WhiteCard>
        </div>
    )
}