import UploadMap from '@/Components/UploadMap';
import ConfigurationMap from '@/Components/ConfigurationMap';

const Configuration = ({maps}) => {
    return (
        <div className="w-full p-10 m-10 bg-white shadow items-center flex flex-col ">
            {maps.length > 0 ? <ConfigurationMap maps={maps}/> :<UploadMap/>}
        </div>
    )
}

export default Configuration;