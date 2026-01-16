import { AutomationTable } from "@/Components/Automation/AutomationTable";
import { StyledButton } from "@/Components/Commons/StyledBasedComponents";
import { useState } from "react";
import { useEffect } from "react";
import { apiFetch, getIcon } from "@/Components/Commons/Constants";
import { Modal } from "flowbite-react";
import { rulebot } from "@/Components/Commons/Constants";
import AddAutomation from "./AddAutomation";

export default function Automation({ id = "" }) {
    const [automationContext, setAutomationContext] = useState({})
    const [showAutomationModal, setShowAutomationModal] = useState(false)

    const automationRefreshTime = 3000


    const [is2xlOrLarger, setIs2xlOrLarger] = useState(false)


    useEffect(() => {
        const checkScreenSize = () => {
            // 1536 is Tailwinds 2xl breakpoint
            setIs2xlOrLarger(window.innerWidth >= 1536)
        }

        checkScreenSize()

        window.addEventListener("resize", checkScreenSize)
        return () => window.removeEventListener("resize", checkScreenSize)
    }, [])

    const fetchAutomationContext = async () => {
        const response = await apiFetch("/automation?get_suggestions=true")
        if (response) {
            setAutomationContext(response)
        }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            fetchAutomationContext()
        }, automationRefreshTime)

        // the function is also called at component mount
        fetchAutomationContext()

        return () => clearInterval(interval)
    }, [])

    const refreshRulebot = () => {
        document.getElementById('rulebot-iframe').src += "";
    }


    return (
        <div className="p-3 h-full max-h-screen">
            <Modal size={"7xl"} show={showAutomationModal} popup dismissable onClose={() => setShowAutomationModal(false)}>
                <Modal.Header />
                <Modal.Body>
                    <iframe className="w-full h-[70vh]" src={rulebot} allow="microphone"></iframe>
                </Modal.Body>
            </Modal>
            <div className="flex flex-col 2xl:grid 2xl:grid-cols-2 gap-4 pb-2">
                <AutomationTable className="" automation_context={automationContext} openId={id} automationRefreshFun={fetchAutomationContext} />
                {is2xlOrLarger &&
                    <div className="relative">

                        <StyledButton className=" absolute top-0 right-0 rounded-md" variant="secondary" onClick={() => refreshRulebot()}>
                            {getIcon("refresh", "size-7")}
                        </StyledButton>

                        <iframe id="rulebot-iframe" className="h-[70vh] w-full rounded-md" src={rulebot} allow="microphone"></iframe>
                    </div>
                }
            </div>
            {!is2xlOrLarger &&

            <StyledButton className=" absolute bottom-0 right-0 m-5 rounded-full" onClick={() => setShowAutomationModal(true)}>
                {getIcon("plus", "size-8")}
            </StyledButton>
            }
            {/*<a href={route("automation.add")}>
                <StyledButton className="absolute bottom-0 right-0 m-5 rounded-full bg">
                    {getIcon("plus", "size-8")}
                </StyledButton>
            </a>*/}
        </div>
    )
}