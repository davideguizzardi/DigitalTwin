import FirstConfiguration from '@/Components/ConfigurationMap/FirstConfiguration';
import RoutineConfiguration from '@/Components/ConfigurationMap/RoutineConfiguration';
import { useEffect } from 'react';
import { DeviceProvider } from '@/Components/ContextProviders/DeviceProvider';

const FirstConfigurationPage = ({ maps,token }) => {
    useEffect(() => {
        if (token) {
            Cookies.set("auth-token", token)
        }
    }, [])

    const mapsLength = maps.length
    return (
        <div className='size-full flex min-w-fit min-h-fit p-4'>
            <DeviceProvider>
                <FirstConfiguration maps={maps} />
            </DeviceProvider>

        </div>
    )
}

export default FirstConfigurationPage;