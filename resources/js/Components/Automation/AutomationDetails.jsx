import { useState, useEffect } from "react";
import { StyledDiv } from "@/Components/Commons/StyledBasedComponents";
import AutomationStats from "./AutomationStats";
import { getIcon } from "@/Components/Commons/Constants";
import { SuggestionsDisplay } from "./SuggestionDisplay";

import { useLaravelReactI18n } from 'laravel-react-i18n';
import { getTriggerDescription, getConditionDescription } from "@/Components/Commons/DataFormatter";


export function AutomationDetails({ automation_in }) {
    const [automation, setAutomation] = useState({})
    const { t } = useLaravelReactI18n()

    const block_class = "flex flex-row items-center gap-10 bg-gray-200 rounded-md p-2"

    useEffect(() => {
        if (automation_in != {})
            setAutomation(automation_in)
    }, [automation_in])


    function formatServiceName(str) {
        // Split the string by underscores
        let words = str.split("_");

        // Capitalize the first word, leave the rest lowercase
        words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();

        // Join the words with spaces
        return words.join(" ");
    }


    return (
        <>
            {
                Object.keys(automation).length > 0 &&
                <StyledDiv variant="primary" className="flex flex-col gap-10">
                    <div className="flex flex-col gap-3">
                        <div>
                            <h1 className="font-semibold text-2xl">{automation.name.charAt(0).toUpperCase() + automation.name.slice(1)}</h1>
                        </div>


                        <div>
                            <h2 className="text-xl font-normal">{t("When")}</h2>
                            {automation.trigger.map(trigger => (
                                <div className={block_class}>
                                    {getIcon(trigger.platform || trigger.trigger ||trigger.triggers)}{getTriggerDescription(trigger, t)}
                                </div>
                            ))}
                        </div>

                        {automation.condition.length > 0 &&
                            <div>
                                <h2 className="text-xl font-normal">{t("And if")}</h2>
                                {automation.condition.map(cond => (
                                    <div className={block_class}>
                                        {getIcon(cond.weekday ? "weekday" : cond.condition)}{getConditionDescription(cond, t)}
                                    </div>
                                ))
                                }
                            </div>
                        }

                        <div>
                            <h2 className="text-xl font-normal">{t("Do")}</h2>
                            <div className="flex flex-col gap-1">
                                {
                                    automation.action.map(action => (
                                        <div className={block_class}>
                                            {getIcon(action.domain)}{t(formatServiceName(action.service))} "{action.device_name}"
                                        </div>
                                    ))
                                }
                            </div>
                        </div>

                    </div>
                    <AutomationStats
                        monthlyCost={automation.monthly_cost}
                        minCost={automation.minimum_cost_per_run}
                        maxCost={automation.maximum_cost_per_run}
                        powerDrawn={automation.average_power_drawn}
                        energyConsumption={automation.energy_consumption}
                    />

                    {automation.suggestions && automation.suggestions.length > 0 &&
                        <>
                            <SuggestionsDisplay suggestion_list={automation.suggestions} />

                        </>
                    }
                </StyledDiv>
            }
        </>
    )
}