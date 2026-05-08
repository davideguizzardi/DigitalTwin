import FirstConfiguration from '@/Components/ConfigurationMap/FirstConfiguration';
import RoutineConfiguration from '@/Components/ConfigurationMap/RoutineConfiguration';
import { DeviceProvider } from '@/Components/ContextProviders/DeviceProvider';


const Configuration = () => {
    return (
        <DeviceProvider>

            <div className='size-full flex min-w-fit min-h-fit p-3'>
                {
                    <RoutineConfiguration />
                }
            </div>
        </DeviceProvider>
    )
}

export default Configuration;