
import { getIcon } from "@/Components/Commons/Constants";
import { List, Tooltip } from "flowbite-react"
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { DAYS, formatServiceName } from "@/Components/Commons/DataFormatter";
const block_class = "flex flex-row items-center gap-10 bg-gray-200 rounded-md p-2"


const renderSuggestion = (suggestion, t) => {
    switch (suggestion.suggestion_type) {
        case "better_activation":
            return (
                <>
                    {t("betterActivationTime :new_activation :saved_money", {
                        new_activation: suggestion.new_activation_time.slice(0, -3),
                        saved_money: `${(suggestion.monthly_saved_money).toFixed(2)} €`
                    })}<Tooltip content={`${suggestion.days.map(day => t(DAYS[day])).join(", ")} ${t("suggestion_tooltipDescription1")}${suggestion.new_activation_time} ${t("suggestion_tooltipDescription2")}`}>
                        {getIcon("info", "size-4")}
                    </Tooltip>
                </>
            );

        case "conflict_time_change":
            return (
                <>
                    {t("suggestion_descriptionNewTime1")}
                    <span className="font-semibold">{suggestion.new_activation_time.join(" o alle ")}</span>.

                </>
            );

        case "conflict_deactivate_automations":
            return (
                <>
                    Per risolvere il conflitto potresti disattivare le seguenti automazioni:
                    <span className="font-semibold">{suggestion.automations_list.join(", ")}</span>.

                </>
            );

        case "conflict_split_automation":
            return (
                <div className="flex flex-col">
                    <div>
                        Per risolvere il conflitto potresti dividere l'automazione in {suggestion.actions_split.length}:
                    </div>
                    <div className="flex flex-row ">

                        {suggestion.actions_split.map((split, index) => (
                            <div className="pl-5 flex flex-col gap-1" key={index}>
                                Automazione #{index + 1}
                                {split.map((action) => (
                                    <div className={block_class}>
                                        {getIcon(action.domain)}{formatServiceName(action.service)} "{action.device_name}"
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            );


        default:
            return <>{t("suggestion_defaultDescription")}</>;
    }
};


export function SuggestionsDisplay({ suggestion_list }) {
    const { t } = useLaravelReactI18n()
    return (
        <div className="flex flex-col">
            <div className="bg-lime-400 rounded-md p-2 flex flex-row gap-2 items-center mb-4">
                {getIcon("energy_big")}
                <h2 className="text-2xl font-semibold">{t("Green suggestions")}</h2>
            </div>
            <div>
                <List className="ml-2">
                    {
                        suggestion_list
                            .map(suggestion => (
                                <List.Item className="flex flex-row items-center gap-2">
                                    {getIcon("dot", "size-3")}
                                    {renderSuggestion(suggestion, t)}
                                </List.Item>
                            ))
                    }
                </List>
            </div>
        </div>
    )
}