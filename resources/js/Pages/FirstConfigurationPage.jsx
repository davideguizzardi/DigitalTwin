import FirstConfiguration from '@/Components/ConfigurationMap/FirstConfiguration';
import RoutineConfiguration from '@/Components/ConfigurationMap/RoutineConfiguration';
import { useEffect } from 'react';
import { DeviceProvider } from '@/Components/ContextProviders/DeviceProvider';
import Cookies from "js-cookie";

const FirstConfigurationPage = ({ maps,token }) => {
    useEffect(() => {
        if (token) {
            Cookies.set("auth-token", token)
        }
    }, [])

    return (
        <div className='size-full flex min-w-fit min-h-fit p-4'>
            <DeviceProvider>
                <FirstConfiguration maps={maps} />
            </DeviceProvider>

        </div>
    )
}

export default FirstConfigurationPage;