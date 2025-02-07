import { ThemeButton } from "@/Components/Commons/ThemeButton";
import { useState, useEffect } from "react";
import { FaLightbulb, FaBolt } from "react-icons/fa6";
import ConfigurationApplianceRef from "./ConfigurationApplianceRef";
import ConfigurationEnergyPlan from "./ConfigurationEnergyPlan";
import ConfigurationEnergy from "./ConfigurationEnergy";
import { AnimatePresence, delay, motion } from "framer-motion";
import TabLayout from "@/Layouts/TabLayout";
import SubMenuLayout from "@/Layouts/SubMenuLayout";

import { DeviceProvider } from "../ContextProviders/DeviceProvider";
import { DeviceConfiguration } from "./DeviceConfiguration";
import { Toast } from "flowbite-react";
import { getIcon } from "../Commons/Constants";
import { useLaravelReactI18n } from "laravel-react-i18n";

const ToastNotification = ({ message, isVisible, onClose, duration = 3000 }) => {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        let timer;
        let progressInterval;

        if (isVisible) {
            setProgress(100);
            timer = setTimeout(() => {
                onClose();
                setProgress(0);
            }, duration);

            progressInterval = setInterval(() => {
                setProgress((prev) => Math.max(prev - 100 / (duration / 100), 0));
            }, 100);
        }

        return () => {
            clearTimeout(timer);
            clearInterval(progressInterval);
        };
    }, [isVisible, duration, onClose]);

    return (
        <div
            className={`fixed left-1/2 top-5 transform -translate-x-1/2 transition-opacity duration-500 ${isVisible ? "opacity-100" : "opacity-0"
                }`}
        >
            {isVisible && (
                <Toast className="overflow-hidden">
                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-lime-100 text-lime-500">
                        {getIcon("check")}
                    </div>
                    <div className="ml-3 text-sm font-normal">{message}</div>
                    <Toast.Toggle onDismiss={onClose} />
                    {/* Progress Bar */}
                    <div
                        className="absolute bottom-0 left-0 rounded-lg h-1 bg-lime-400 transition-all duration-100"
                        style={{ width: `${progress}%` }}
                    />
                </Toast>
            )}
        </div>
    );
};







export default function RoutineConfiguration() {
    const [section, setSection] = useState(0)
    const [showToast, setShowToast] = useState(false)

    const { t } = useLaravelReactI18n()

    const endSection = () => {
        setShowToast(true)
    }

    const sections = {
        "Configure devices":
            (<DeviceProvider>
                <DeviceConfiguration isInitialConfiguration={false} endSection={endSection} />
            </DeviceProvider>),
        "Configure Appliance":
            (<ConfigurationApplianceRef isInitialConfiguration={false} editMode={true} endSection={endSection} />),
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
