import { getIcon } from "../Commons/Constants";
import { List,Tooltip } from "flowbite-react"
import { DAYS } from "../Commons/DataFormatter";

import { useLaravelReactI18n } from "laravel-react-i18n";

function getConflictDescription(conflict,t){
    if(conflict.type=="Excessive energy consumption"){
        var description=t("excessive energy consumption :threshold :start :end",{
            threshold:conflict.threshold,
            start:conflict.start,
            end: conflict.end
        })
        description= `${description} ${conflict.days.map(day => t(DAYS[day])).join(", ")}.` 

        return description
    }
    if(conflict.type=="Not feasible automation"){
        var description=t("not feasible :threshold",{threshold:conflict.threshold})
        return description
    }
}

export function ConflicsDisplay({ conflicts_list }) {
    const { t } = useLaravelReactI18n();
    return (
        <div className="flex flex-col">
            <div className="bg-red-300 rounded-md p-2 flex flex-row gap-2 items-center mb-4">
                {getIcon("warning")}
                <h2 className="text-2xl font-semibold">{t("conflictList")}</h2>
            </div>
            <div>
                <List className="ml-2">
                    {
                        conflicts_list
                            .map(conflict => (
                                <List.Item className="flex flex-row items-center gap-2">
                                    {getIcon("dot", "size-3")}
                                    {getConflictDescription(conflict,t)}
                                </List.Item>
                            ))
                    }
                </List>
            </div>
        </div>
    )
}