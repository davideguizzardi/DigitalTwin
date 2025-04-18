
import RoomConfiguration from "@/Components/ConfigurationMap/RoomConfiguration";
export default function RoomConfiguration1({ maps }) {


    return (<div className="flex items-center flex-col mt-10">

        <RoomConfiguration maps={maps} startingFloor={maps[0].floor}/>
    </div>

    )
}