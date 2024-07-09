import UploadMap from '@/Components/ConfigurationMap/UploadMap';
import ConfigurationAppliance from '@/Components/ConfigurationMap/ConfigurationAppliance';

const Configuration = ({maps}) => {
    return (
        <div className="w-full p-10 m-10 bg-white shadow items-center flex flex-col ">
            {maps.length > 0 ? <ConfigurationAppliance maps={maps}/> :<UploadMap/>}
        </div>
    )
}

export default Configuration;