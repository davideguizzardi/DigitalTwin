import FirstConfiguration from '@/Components/ConfigurationMap/FirstConfiguration';
import RoutineConfiguration from '@/Components/ConfigurationMap/RoutineConfiguration';
import { DeviceProvider } from '@/Components/ContextProviders/DeviceProvider';


const Configuration = ({ maps }) => {
    const mapsLength = maps.length
    return (
        <DeviceProvider>

            <div className='size-full flex min-w-fit min-h-fit p-3'>
                {
                    mapsLength > 0 ?
                        <RoutineConfiguration /> : <FirstConfiguration />
                }
            </div>
        </DeviceProvider>
    )
}

export default Configuration;