import UploadMap from '@/Components/ConfigurationMap/UploadMap';
import ProgressConfiguration from '@/Components/ConfigurationMap/ProgressConfiguration';
import ConfigurationAppliance from '@/Components/ConfigurationMap/ConfigurationAppliance';
import { useState } from 'react';
import { ThemeButton } from '@/Components/Commons/ThemeButton';

const STATE_UPLOAD_MAP = 0
const STATE_CONFIGURATION_APPLIANCE = 1
const STATE_CONFIGURATION_ENERGY_PLAN = 2
const STATE_FINISH = 3


const FirstConfiguration = ({maps}) => {
    const [progressState, setProgressState] = useState(STATE_UPLOAD_MAP)
    
    const renderCard = () =>{
        switch(progressState){
            case STATE_UPLOAD_MAP:
                return <UploadMap/>;
            case STATE_CONFIGURATION_APPLIANCE:
                return <ConfigurationAppliance maps={maps}/>;
        } 
    }

    return(
        <div className="flex flex-col size-full p-5">
            <ProgressConfiguration state={progressState}></ProgressConfiguration>
            <div className="w-full h-full p-5 my-2 bg-white shadow items-center flex flex-col ">
                {renderCard()}
            </div>
            <ThemeButton onClick={()=>{
                const temp = progressState + 1
                if(temp > 3){
                    setProgressState(0)
                }
                else{
                    setProgressState(temp)
                }
                console.log(progressState)
            }}>Bottone</ThemeButton>
        </div>
    )
} 


export default FirstConfiguration