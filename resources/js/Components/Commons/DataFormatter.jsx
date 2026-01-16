

export const DAYS = {
    "mon": "Monday",
    "tue": "Tuesday",
    "wed": "Wednesday",
    "thu": "Thursday",
    "fri": "Friday",
    "sat": "Saturday",
    "sun": "Sunday",
};

function formatDuration(duration, t) {
    const hours = duration.hours || 0;
    const minutes = duration.minutes || 0;
    const seconds = duration.seconds || 0;

    const parts = [];
    if (hours > 0) {
        parts.push(`${hours} ${t("hour" + (hours > 1 ? "s" : ""))}`);
    }
    if (minutes > 0) {
        parts.push(`${minutes} ${t("minute" + (minutes > 1 ? "s" : ""))}`);
    }
    if (seconds > 0) {
        parts.push(`${seconds} ${t("second" + (seconds > 1 ? "s" : ""))}`);
    }

    return parts.join(", ");
}


function formatStateDescr(obj, t) {
    let deviceName = obj.device_name || t("Unknown device");

    //Two cases:
    //trigger deviceName shifts [from] [to]
    //condition deviceName is [state]

    if ("state" in obj) {
        return `"${deviceName}" ${t("is")} ${t(obj.state)}`
    }
    return `"${deviceName}" ${t("shifts")} ${"from" in obj ? `${t("from")} ${t(obj.from)}` : ""} ${"to" in obj ? `${t("to")} ${t(obj.to)}` : ""}`
}

function formatTemplateDesc(obj, t) {
    return `${t("The template")} "${obj.value_template}" ${t("is")} ${t("True")}`
}


function formatNumericOrSensorDesc(obj, t) {
    let deviceName = obj.device_name || t("Unknown device");
    const typeKey = obj.type?.replace(/^is_/, "") || t("unknown type");

    let description = t(":device_name's :type", {
        device_name: deviceName,
        type: t(typeKey),
    });

    description = description.charAt(0).toUpperCase() + description.slice(1);

    if ("above" in obj && "below" in obj) {
        description += ` ${t("is between")} ${obj.above} ${obj.unit_of_measurement || ""} ${t("and")} ${obj.below} ${obj.unit_of_measurement || ""}`;
    } else if ("above" in obj) {
        description += ` ${t("is above")} ${obj.above} ${obj.unit_of_measurement || ""}`;
    } else if ("below" in obj) {
        description += ` ${t("is below")} ${obj.below} ${obj.unit_of_measurement || ""}`;
    } else {
        description += ` ${t("changes")}`;
    }

    return description;
}

export function getTriggerDescription(trigger, t) {
    const platform = trigger.platform || trigger.trigger || t("unknown platform");
    let description = "";
    let deviceName = trigger.device_name || t("Unknown device");

    switch (platform) {
        case "device":
            const domain = trigger.domain || t("unknown domain");

            if (domain === "sensor") {
                description = formatNumericOrSensorDesc(trigger, t);
            } else if (domain === "bthome") {
                description = `${t("You")} ${trigger.subtype.replace("_", " ") || t("unknown action")} "${deviceName}"`;
            } else {
                description = `"${deviceName}" ${t("is")} ${trigger.type || t("unknown action")}`;
            }
            break;

        case "numeric_state":
            description = formatNumericOrSensorDesc(trigger, t);
            break;

        case "time":
            let time = t("unknown time");
            if (trigger.at) {
                time = trigger.at.slice(0, -3); // Removing seconds part
            }
            description = `${t("Time is")} ${time}`;
            break;

        case "sun":
            const event = t(trigger.event) || t("unknown event");
            const offset = trigger.offset ? parseInt(trigger.offset) : null;

            if (offset !== null) {
                const offsetMinutes = Math.abs(offset) / 60;
                const beforeAfter = offset > 0 ? t("after") : t("before");
                description = `${offsetMinutes.toFixed(0)} ${t("minutes")} ${beforeAfter} ${event}`;
            } else {
                description = `${t("It is")} ${event}`;
            }
            break;

        case "time_pattern":
            description = t("Time pattern-based trigger description");
            break;

        case "state":
            description = formatStateDescr(trigger, t)
            break;

        case "template":
            description = formatTemplateDesc(trigger, t)
            break;

        default:
            description = t("Unknown platform trigger");
    }

    if (trigger.for) {
        const durationDescription = formatDuration(trigger.for, t);
        if (durationDescription) {
            description += ` ${t("for")} ${durationDescription}`;
        }
    }

    return description;
}



export function getConditionDescription(condition, t) {
    const platform = condition.condition || t("unknown condition");
    let description = "";

    switch (platform) {
        case "device": {
            let deviceName = condition.device_name || t("Unknown device");
            const domain = condition.domain || t("unknown domain");

            if (domain === "sensor") {
                description = formatNumericOrSensorDesc(condition, t);
            } else {
                description = `"${deviceName}" ${t("is in")} ${condition.type || t("unknown state")}`;
            }

            if (condition.for) {
                const durationDescription = formatDuration(condition.for, t);
                if (durationDescription) {
                    description += ` ${t("for")} ${durationDescription}`;
                }
            }

            break;
        }

        case "numeric_state":
            description = formatNumericOrSensorDesc(condition, t);
            break;

        case "time": {
            if (condition.before && condition.after) {
                description += `${t("Time is between")} ${condition.after} ${t("and")} ${condition.before}`;
            } else if (condition.before) {
                description += `${t("Time is before")} ${condition.before}`;
            } else if (condition.after) {
                description += `${t("Time is after")} ${condition.after}`;
            }

            if (condition.weekday) {
                const daysString = `${t("Day is")} ${Object.keys(DAYS)
                    .filter(day => condition.weekday.includes(day))
                    .map(day => t(DAYS[day]))
                    .join(", ")}`;
                description += description ? ` ${t("and")} ${daysString}` : daysString;
            }

            break;
        }

        case "sun": {
            const descriptionParts = [];

            if (condition.before) {
                const beforeOffset = condition.before_offset ? parseInt(condition.before_offset) : null;
                if (beforeOffset !== null) {
                    if (beforeOffset > 0) {
                        const beforeTime = formatTimeOffset(beforeOffset, t);
                        descriptionParts.push(`${beforeTime} ${t("before")} ${t(condition.before)}`);
                    } else {
                        descriptionParts.push(`${t("at")} ${t(condition.before)}`);
                    }
                } else {
                    descriptionParts.push(`${t("before")} ${t(condition.before)}`);
                }
            }

            if (condition.after) {
                const afterOffset = condition.after_offset ? parseInt(condition.after_offset) : null;
                if (afterOffset !== null) {
                    if (afterOffset > 0) {
                        const afterTime = formatTimeOffset(afterOffset, t);
                        descriptionParts.push(`${afterTime} ${t("after")} ${t(condition.after)}`);
                    } else {
                        descriptionParts.push(`${t("at")} ${t(condition.after)}`);
                    }
                } else {
                    descriptionParts.push(`${t("after")} ${t(condition.after)}`);
                }
            }

            description = descriptionParts.length > 0
                ? `${t("Sun is")} ${descriptionParts.join(` ${t("and")} `)}`
                : t("No sun conditions available.");

            break;
        }

        case "state":
            description = formatStateDescr(condition, t)
            break;

        case "template":
            description = formatTemplateDesc(condition, t)
            break;

        default:
            description = t("Unknown condition");
    }

    return description;
}

function formatTimeOffset(seconds, t) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const parts = [];
    if (hours > 0) {
        parts.push(`${hours} ${t("hour")}${hours > 1 ? "s" : ""}`);
    }
    if (minutes > 0) {
        parts.push(`${minutes} ${t("minute")}${minutes > 1 ? "s" : ""}`);
    }

    return parts.length > 0 ? parts.join(", ") : `0 ${t("minutes")}`;
}

export function formatServiceName(str) {
    // Split the string by underscores
    let words = str.split("_");

    // Capitalize the first word, leave the rest lowercase
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();

    // Join the words with spaces
    return words.join(" ");
}

export function formatActionData(data,t) {
    return (<ul className="list-disc ml-5 w-full">
        {data &&
            Object.keys(data).map((key) => (
                <li>
                    <span className="font-semibold">
                        {t(key)}
                    </span>
                    {": "}
                    {JSON.stringify(data[key])}
                </li>
            ))
        }
    </ul>
    )
}


export function formatAction(action) {
    const block_class = "flex flex-row items-center gap-3 md:gap-5 bg-gray-200 rounded-md p-2 my-2 text-sm md:text-base"
    return (<div className={block_class}>
        {getIcon(action.domain)}
        <div className="flex flex-col items-start">
            {t(formatServiceName(action.service))} "{action.device_name}"
            {formatActionData(action.data)}
        </div>
    </div>)
}