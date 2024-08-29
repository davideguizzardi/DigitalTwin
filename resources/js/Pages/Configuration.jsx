import FirstConfiguration from '@/Components/ConfigurationMap/FirstConfiguration';
import RoutineConfiguration from '@/Components/ConfigurationMap/RoutineConfiguration';

const Configuration = ({maps}) => {
    const mapsLength = maps.length
    return (
        <div className='size-full flex'>
            {
                mapsLength > 0 ? 
                <RoutineConfiguration/>: <FirstConfiguration/>
            }
        </div>
    )
}

export default Configuration;