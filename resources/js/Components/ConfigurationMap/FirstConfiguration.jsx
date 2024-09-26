import UploadMap from '@/Components/ConfigurationMap/UploadMap';
import ProgressConfiguration from '@/Components/ConfigurationMap/ProgressConfiguration';
import ConfigurationAppliance from '@/Components/ConfigurationMap/ConfigurationAppliance';
import { useState } from 'react';
import { ThemeButton } from '@/Components/Commons/ThemeButton';
import ConfigurationEnergyPlan from './ConfigurationEnergyPlan';

const STATE_UPLOAD_MAP = 0
const STATE_CONFIGURATION_APPLIANCE = 1
const STATE_CONFIGURATION_ENERGY_PLAN = 2
const STATE_FINISH = 3


const FirstConfiguration = () => {
    const [progressState, setProgressState] = useState(STATE_UPLOAD_MAP)
    
    const renderCard = () =>{
        switch(progressState){
            case STATE_UPLOAD_MAP:
                return <UploadMap endSection={() => setProgressState(STATE_CONFIGURATION_APPLIANCE)}/>;
            case STATE_CONFIGURATION_APPLIANCE:
                return <ConfigurationAppliance editMode={true} endSection={() => setProgressState(STATE_CONFIGURATION_ENERGY_PLAN)}/>;
            case STATE_CONFIGURATION_ENERGY_PLAN:
                return <ConfigurationEnergyPlan endSection={() => setProgressState(STATE_FINISH)}/>;
            case STATE_FINISH:
                return  <div className="size-full flex flex-col gap-5 py-5 bg-white shadow-xl rounded">
                    <div className="h-5/6 flex justify-center items-center">
                        <h1>Configuration complete</h1>
                    </div>
                    <div className="w-full flex justify-center">
                        <ThemeButton href={route('configuration')}>Finish</ThemeButton>
                    </div>
                </div>
        } 
    }

    return(
        <div className="flex flex-col size-full min-h-fit min-w-fit">
            <ProgressConfiguration state={progressState} setState={setProgressState}></ProgressConfiguration>
            <div className="size-full p-1 my-2 items-center flex flex-col min-w-fit min-h-fit">
                {renderCard()}
            </div>
        </div>
    )
} 


export default FirstConfiguration