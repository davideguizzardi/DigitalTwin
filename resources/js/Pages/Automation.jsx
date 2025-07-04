import { AutomationTable } from "@/Components/Automation/AutomationTable";
import { ThemeButton } from "@/Components/Commons/ThemeButton";
import { useState } from "react";
import { useEffect } from "react";
import { apiFetch, getIcon } from "@/Components/Commons/Constants";
import { Modal } from "flowbite-react";
import { rulebot } from "@/Components/Commons/Constants";

export default function Automation({ id = "" }) {
    const [automationContext, setAutomationContext] = useState({})
    const [showAutomationModal, setShowAutomationModal] = useState(false)

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
            <Modal size={"7xl"} show={showAutomationModal} popup dismissable onClose={()=>setShowAutomationModal(false)}>
                <Modal.Header/>
                <Modal.Body>
                    <iframe className="w-full h-[70vh]" src={rulebot}></iframe>
                </Modal.Body>
            </Modal>
            <AutomationTable className="" automation_context={automationContext} openId={id} />
            <ThemeButton className="absolute bottom-0 right-0 m-5 rounded-full bg" onClick={()=>setShowAutomationModal(true)}>
                {getIcon("plus", "size-8")}
            </ThemeButton>
            {/*<a href={route("automation.add")}>
                <ThemeButton className="absolute bottom-0 right-0 m-5 rounded-full bg">
                    {getIcon("plus", "size-8")}
                </ThemeButton>
            </a>*/}
        </div>
    )
}