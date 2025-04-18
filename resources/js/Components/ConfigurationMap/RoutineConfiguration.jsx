
import { useState, useEffect } from "react";

import ConfigurationAppliance from "./ConfigurationAppliance";

import ConfigurationEnergy from "./ConfigurationEnergy";

import TabLayout from "@/Layouts/TabLayout";


import { DeviceProvider } from "../ContextProviders/DeviceProvider";
import { DeviceConfiguration } from "./DeviceConfiguration";
import { Toast } from "flowbite-react";
import { getIcon } from "../Commons/Constants";
import { useLaravelReactI18n } from "laravel-react-i18n";

import ToastNotification from "../Commons/ToastNotification";

import RoomConfiguration from "./RoomConfiguration";







export default function RoutineConfiguration() {
    const [section, setSection] = useState(0)
    const [showToast, setShowToast] = useState(false)

    const { t } = useLaravelReactI18n()

    const endSection = () => {
        setShowToast(true)
    }

    const sections = {
        "Configure devices":
            (
                <DeviceConfiguration isInitialConfiguration={false} endSection={endSection} />
            ),
        "Configure map":
            (<ConfigurationAppliance isInitialConfiguration={false} editMode={true} endSection={endSection} />),
        "Configure rooms":
            (
                <RoomConfiguration isInitialConfiguration={false} endSection={endSection} />
            ),
        "Configure Energy Plan":
            (<ConfigurationEnergy isInitialConfiguration={false} endSection={endSection} />)
    }

    const variantsAppliance = {
        initial: {
            display: "none",
            opacity: 0.8,
            x: -20,
        },
        animate: {
            display: "block",
            opacity: 1,
            x: 0,
            transition: {
                delay: 0.3,
                duration: 0.2
            }
        },
        exit: {
            display: "none",
            opacity: 0.8,
            x: -20,
            transition: {
                duration: 0.2
            }
        }
    }


    const variantsEnergy = {
        initial: {
            display: "none",
            x: 20,
            transition: {
                duration: 0.3
            }
        },
        animate: {
            display: "block",
            x: 0,
            transition: {
                delay: 0.3,
                duration: 0.3
            }
        },
        exit: {
            display: "none",
            x: 20,
            transition: {
                duration: 0.2
            }
        }
    }

    return (
        <div className="size-full flex flex-col">
            <ToastNotification
                message={t("Configuration saved successfully")}
                isVisible={showToast}
                onClose={() => setShowToast(false)}
            />

            <TabLayout sections={sections} />
        </div>
    )
}
