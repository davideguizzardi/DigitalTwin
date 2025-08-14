

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

export function getTriggerDescription(trigger, t) {
    const platform = trigger.platform || trigger.trigger || t("unknown platform");
    let description = "";
    let deviceName = trigger.device_name || t("Unknown device");

    switch (platform) {
        case "device":
            const domain = trigger.domain || t("unknown domain");

            if (domain === "sensor") {

                description = t(":device_name's :type", {
                    device_name: deviceName,
                    type: t(trigger.type || t("unknown type")),
                });
                description = description.charAt(1).toUpperCase() + description.slice(2)
                if ("above" in trigger && "below" in trigger) {
                    description += ` ${t("is between")} ${trigger.above} ${t("and")} ${trigger.below}`;
                } else if ("above" in trigger) {
                    description += ` ${t("is above")} ${trigger.above}`;
                } else if ("below" in trigger) {
                    description += ` ${t("is below")} ${trigger.below}`;
                } else {
                    description += ` ${t("changes")}`;
                }
            } else if (domain === "bthome") {
                description = `${t("When you")} ${trigger.subtype.replace("_", " ") || t("unknown action")} "${deviceName}"`;
            } else {
                description = `${t("When")} "${deviceName}" ${t("is")} ${trigger.type || t("unknown action")}`;
            }

            if (trigger.for) {
                const durationDescription = formatDuration(trigger.for, t);
                if (durationDescription) {
                    description += ` ${t("for")} ${durationDescription}`;
                }
            }
            break;

        case "numeric_state":
            description = t(":device_name's :type", {
                device_name: deviceName,
                type: t(trigger.type || t("unknown type")),
            });
            description = description.charAt(1).toUpperCase() + description.slice(2)
            if ("above" in trigger && "below" in trigger) {
                description += ` ${t("is between")} ${trigger.above} ${trigger.unit_of_measurement || ""} ${t("and")} ${trigger.below} ${trigger.unit_of_measurement || ""} `;
            } else if ("above" in trigger) {
                description += ` ${t("is above")} ${trigger.above} ${trigger.unit_of_measurement || ""}`;
            } else if ("below" in trigger) {
                description += ` ${t("is below")} ${trigger.below} ${trigger.unit_of_measurement || ""}`;
            } else {
                description += ` ${t("changes")}`;
            }
            break;

        case "time":
            let time = t("unknown time");
            if (trigger.at) {
                time = trigger.at.slice(0, -3); // Removing seconds part
            }
            description = `${t("Time is")} ${time}`;
            break;

        case "sun":
            const event = trigger.event || t("unknown event");
            const offset = trigger.offset ? parseInt(trigger.offset) : null;

            if (offset !== null) {
                const offsetMinutes = Math.abs(offset) / 60;
                const beforeAfter = offset > 0 ? t("after") : t("before");
                description = `${offsetMinutes} ${t("minutes")} ${beforeAfter} ${event}`;
            } else {
                description = `${t("It is the")} ${event}`;
            }
            break;

        case "time_pattern":
            description = t("Time pattern-based trigger description");
            break;

        default:
            description = t("Unknown platform trigger");
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

export function getConditionDescription(condition, t) {
    const platform = condition.condition || t("unknown condition");
    let description = "";

    switch (platform) {
        case "device": {
            let deviceName = condition.device_name || t("Unknown device");
            const domain = condition.domain || t("unknown domain");

            if (domain === "sensor") {
                description = t(":device_name's :type", {
                    device_name: deviceName,
                    type: t(condition.type.replace("is_", "")) || t("unknown type"),
                });
                description = description.charAt(1).toUpperCase() + description.slice(2)
                if ("above" in condition && "below" in condition) {
                    description += ` ${t("is between")} ${condition.above} ${condition.unit_of_measurement || ""} ${t("and")} ${condition.below} ${condition.unit_of_measurement || ""}`;
                } else if ("above" in condition) {
                    description += ` ${t("is above")} ${condition.above} ${condition.unit_of_measurement || ""}`;
                } else if ("below" in condition) {
                    description += ` ${t("is below")} ${condition.below} ${condition.unit_of_measurement || ""}`;
                } else {
                    description += ` ${t("changes")}`;
                }
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
                        descriptionParts.push(`${beforeTime} ${t("before")} ${condition.before}`);
                    } else {
                        descriptionParts.push(`${t("at")} ${condition.before}`);
                    }
                } else {
                    descriptionParts.push(`${t("before")} ${condition.before}`);
                }
            }

            if (condition.after) {
                const afterOffset = condition.after_offset ? parseInt(condition.after_offset) : null;
                if (afterOffset !== null) {
                    if (afterOffset > 0) {
                        const afterTime = formatTimeOffset(afterOffset, t);
                        descriptionParts.push(`${afterTime} ${t("after")} ${condition.after}`);
                    } else {
                        descriptionParts.push(`${t("at")} ${condition.after}`);
                    }
                } else {
                    descriptionParts.push(`${t("after")} ${condition.after}`);
                }
            }

            description = descriptionParts.length > 0
                ? `${t("Sun is")} ${descriptionParts.join(` ${t("and")} `)}`
                : t("No sun conditions available.");

            break;
        }

        default:
            description = t("Unknown condition");
    }

    return description;
}


export function formatServiceName(str) {
    // Split the string by underscores
    let words = str.split("_");

    // Capitalize the first word, leave the rest lowercase
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();

    // Join the words with spaces
    return words.join(" ");
}
