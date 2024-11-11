import { useState, useEffect } from "react";
import { StyledDiv } from "@/Components/Commons/StyledBasedComponents";
import { List } from "flowbite-react";
import { getIcon } from "@/Components/Commons/Constants";

import { DAYS } from "@/Components/Commons/Constants";
import { ThemeButton } from "../Commons/ThemeButton";


export function AutomationDetails({ automation_in }) {
    const [automation, setAutomation] = useState({})

    const block_class="flex flex-row items-center gap-10 bg-gray-200 dark:bg-neutral-600 rounded-md p-2"

    useEffect(() => {
        if (automation_in != {})
            setAutomation(automation_in)
    }, [automation_in])

    function groupSuggestionsByTime(suggestions) {
        // Group suggestions by activation time
        const groupedByTime = suggestions.reduce((acc, suggestion) => {
          const time = suggestion.new_activation_time;
          
          // Check if the group already exists for this time
          if (!acc[time]) {
            acc[time] = {
              new_activation_time: time,
              saved_money: suggestion.saved_money, // Take the saved money from the first one
              days: []
            };
          }
      
          // Add the current day to the corresponding time group
          acc[time].days.push(suggestion.day);
          
          return acc;
        }, {});
      
        // Convert the grouped object back to an array of objects
        return Object.values(groupedByTime);
      }

    function formatServiceName(str) {
        // Split the string by underscores
        let words = str.split("_");
    
        // Capitalize the first word, leave the rest lowercase
        words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
    
        // Join the words with spaces
        return words.join(" ");
    }

    function formatNumber(num){
        const ritorno = "00" + num.toString()
        return ritorno.slice(-2)
    }

    function getTriggerComponent(trigger) {
        switch (trigger.platform) {
            case "time":
                return (
                    <div className={block_class}>
                        {getIcon("time")}Time is {trigger.at.slice(0,-3)}
                    </div>)

            case "sun":
                if (trigger.offset) {
                    const offset_parsed = parseInt(trigger.offset,10)
                    const offset_minutes = offset_parsed / 60
                    return (
                        <div className={block_class}>
                            {getIcon(trigger.event)} {offset_minutes.toFixed(0)} minutes {offset_parsed > 0 ? "after" : "before"} {trigger.event}
                        </div>)
                }
                return (
                    <div className={block_class}>
                        {getIcon(trigger.event)} It is the {trigger.event}
                    </div>)
            case "device":
                if (trigger.type=="power") {
                    return (
                        <div className={block_class}>
                            {getIcon("power")}Consumption below {trigger.below}kW for {formatNumber(trigger.for.hours)}:{formatNumber(trigger.for.minutes)}
                        </div>
                    )
                }else if(trigger.type=="button"){
                    return (
                        <div className={block_class}>
                            {getIcon("button")} Click to activate
                        </div>
                    )
                }else if(trigger.type=="temperature"){
                    return (
                        <div className={block_class}>
                            {getIcon("temperature")} Consumption above {trigger.above}°C for {formatNumber(trigger.for.hours)}:{formatNumber(trigger.for.minutes)}
                        </div>
                    )
                }
            case "time_pattern": 
                return (
                    <div className={block_class}>
                        {getIcon("stopwatch")} It will start in {formatNumber(trigger.hours)}:{trigger.minutes ? formatNumber(trigger.minutes): "00"}
                    </div>
                )
            default:
                return (
                    <div className={block_class}>
                        Activate
                    </div>
                )
        }
    }


    function getConditionComponent(condition) {
        switch (condition.condition) {
            case "time":
                if (condition.weekday && condition.weekday.length > 0) {
                    return (
                        <div className={block_class}>
                            {getIcon("weekday")}Day is {Object.keys(DAYS)
                            .filter(day => condition.weekday.includes(day))
                            .map(day => DAYS[day].name)
                            .join(", ")}
                        </div>)
                }
                return (
                    <div className={block_class}>
                        {getIcon("time")}Time is  {condition.condition}
                    </div>)

            default:
                return (
                    <div className={block_class}>
                        {getIcon(condition.condition)}{condition.condition}
                    </div>
                )
        }
    }

    const applyChanges = ()=>{
        alert("Suggestion applied")
    }

    return (
        <>
        {
            Object.keys(automation).length > 0 &&
            <StyledDiv variant="primary" className="flex flex-col gap-1">
                    <div>
                        <h1 className="font-semibold text-3xl">{automation.name}</h1>
                    </div>
                    <div>
                        <h2 className="text-xl font-normal">When</h2>
                        {getTriggerComponent(automation.trigger[0])}
                    </div>
                    {automation.condition.length > 0 &&
                        <div>
                            <h2 className="text-xl font-normal">And if</h2>
                            {getConditionComponent(automation.condition[0])}
                        </div>
                    }

                    <div>
                        <h2 className="text-xl font-normal">Do</h2>
                        <div className="flex flex-col gap-1">
                            {
                                automation.action.map(action => (
                                    <div className={block_class}>
                                            {getIcon(action.domain)}{formatServiceName(action.service)} "{action.device_name}"
                                        </div>
                                    ))
                                }
                        </div>
                    </div>

                    {automation.suggestions.length > 0 &&
                        <div className="mt-10">
                            <div className="bg-lime-400 dark:text-gray-800 rounded-md p-2 flex flex-row gap-2 items-center mb-4">
                                {getIcon("energy_big")}
                                <h2 className="text-2xl font-semibold">Green suggestions</h2>
                            </div>
                            <div className="flex flex-col">
                                <List className="ml-2">

                                {
                                    groupSuggestionsByTime(automation.suggestions)
                                    .map(suggestion=>(
                                        <List.Item>
                                            If you move the activation time to <span className="font-semibold">{suggestion.new_activation_time.slice(0,-3)}</span> you could save <span className="font-semibold">{(suggestion.saved_money*30).toFixed(2)}€</span> on <span className="font-semibold">{suggestion.days.map(day=>DAYS[day].name).join(", ")}</span> each month
                                            <ThemeButton className="m-2" onClick={applyChanges}>Apply</ThemeButton>
                                        </List.Item>
                                    ))
                                }
                                </List>
                            </div>

                        </div>
                    }
                    

                </StyledDiv>
        }
        </>
    )
}