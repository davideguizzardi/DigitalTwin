import UploadMap from '@/Components/ConfigurationMap/UploadMap';
import ConfigurationAppliance from '@/Components/ConfigurationMap/ConfigurationAppliance';
import { useState } from 'react';
import ConfigurationEnergy from './ConfigurationEnergy';
import WhiteCard from '../Commons/WhiteCard';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { getIcon } from "../Commons/Constants";
import ConfigurationHomeAssistant from './ConfigurationHomeAssistant';
import { DeviceConfiguration } from './DeviceConfiguration';
import { StyledButton } from '../Commons/StyledBasedComponents';
import RoomConfiguration from './RoomConfiguration';

const iconsSize = "size-10";
const steps = [
    { key: "CONFIGURATION_HOME_ASSISTANT", icon: getIcon("homeassistant", iconsSize), label: "Configure Home Assistant" },
    { key: "UPLOAD_MAP", icon: getIcon("home_empty", iconsSize), label: "Add house map" },
    { key: "CONFIGURATION_ROOM", icon: getIcon("room", iconsSize), label: "Configure rooms" },
    { key: "CONFIGURATION_APPLIANCE", icon: getIcon("light", iconsSize), label: "Configure devices" },
    { key: "SET_DEVICES_ON_MAP", icon: getIcon("home_full", iconsSize), label: "Add devices to map" },
    { key: "CONFIGURATION_ENERGY_PLAN", icon: getIcon("power", iconsSize), label: "Energy plan configuration" },
    { key: "FINISH", icon: getIcon("check", iconsSize), label: "Done!" }
];

const stepIndexes = steps.reduce((acc, step, index) => {
    acc[step.key] = index;
    return acc;
}, {});

function StepProgress({ state, setState,t }) {
    return (
        <div className="flex flex-row items-center pb-7 pt-2 px-20 rounded bg-white dark:bg-neutral-900 shadow row-span-2 ">
            {steps.map((step, index) => (
                <>
                    <div key={index} className="relative flex flex-col items-center justify-center">
                        <div
                            className={"rounded-full p-2 size-min border solid " + (state >= index ? "bg-lime-400" : "bg-gray-300")}
                            onClick={() => setState(index)}
                        >
                            {step.icon}
                        </div>
                        <div className="absolute top-14 text-center flex w-fit whitespace-nowrap">
                            {t(step.label)}
                        </div>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={"w-full h-2 rounded " + (state > index ? "bg-lime-400" : "bg-gray-300 dark:bg-neutral-700")} />
                    )}
                </>
            ))}
        </div>
    );
}

const FirstConfiguration = ({maps}) => {
    const [progressState, setProgressState] = useState(stepIndexes.UPLOAD_MAP);
    const { t } = useLaravelReactI18n();

    const renderCard = () => {
        switch (progressState) {
            case stepIndexes.CONFIGURATION_HOME_ASSISTANT:
                return <ConfigurationHomeAssistant endSection={() => setProgressState(stepIndexes.UPLOAD_MAP)}/>
            case stepIndexes.UPLOAD_MAP:
                return <UploadMap 
                maps={maps} 
                endSection={() => setProgressState(stepIndexes.CONFIGURATION_ROOM)} />;
            case stepIndexes.CONFIGURATION_ROOM:
                    return <RoomConfiguration 
                    backSection={() => setProgressState(stepIndexes.UPLOAD_MAP)}
                    endSection={() => setProgressState(stepIndexes.CONFIGURATION_APPLIANCE)} />;
            case stepIndexes.CONFIGURATION_APPLIANCE:
                return <DeviceConfiguration
                    backSection={() => setProgressState(stepIndexes.UPLOAD_MAP)}
                    endSection={() => setProgressState(stepIndexes.SET_DEVICES_ON_MAP)} />
            case stepIndexes.SET_DEVICES_ON_MAP:
                return <ConfigurationAppliance
                    editMode={true}
                    backSection={() => setProgressState(stepIndexes.CONFIGURATION_APPLIANCE)}
                    endSection={() => setProgressState(stepIndexes.CONFIGURATION_ENERGY_PLAN)} 
                    isInitialConfiguration={true}
                    />;
            case stepIndexes.CONFIGURATION_ENERGY_PLAN:
                return <ConfigurationEnergy
                    isInitialConfiguration={true}
                    backSection={() => setProgressState(stepIndexes.SET_DEVICES_ON_MAP)}
                    endSection={() => setProgressState(stepIndexes.FINISH)} />;
            case stepIndexes.FINISH:
                return (<div className='size-full flex flex-col items-center justify-center gap-2'>
                    <h1 className='font-bold text-2xl font-[Inter]'>{t("Configuration complete")}</h1>
                    <div className='flex flex-col items-center font-[Inter]'>
                        <p>{t("configuration_complete_1")}</p>
                        <p>{t("configuration_complete_2")}</p>
                    </div>
                    <StyledButton href={route('home')} className='mt-5'>{getIcon("home","mr-2 size-5")}Home</StyledButton>
                </div>)
        }
    };

    return (
        <div className="grid grid-rows-12 size-full gap-1">
            <StepProgress t={t} state={progressState} setState={setProgressState}/>
            <WhiteCard className="relative w-full row-span-11  p-1 mt-2 items-center flex flex-col overflow-y-auto">
                {renderCard()}
            </WhiteCard>
        </div>
    );
};

export default FirstConfiguration;
