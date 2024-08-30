import {ThemeButton} from "@/Components/Commons/ThemeButton";
import { useState } from "react";
import {FaLightbulb, FaBolt} from "react-icons/fa6";
import ConfigurationAppliance from "./ConfigurationAppliance";
import ConfigurationEnergyPlan from "./ConfigurationEnergyPlan";

export default function RoutineConfiguration(){
    const [section, setSection] = useState(0)
    return (
        <div className="size-full flex flex-col">
            <div className="w-full flex pt-5 p-3">
                <div className="flex items-center p-3 m-1 bg-white shadow rounded "
                onClick={() => setSection(0)} style={{cursor: "pointer"}}>
                    <FaLightbulb size={32}></FaLightbulb>
                    <h1>Appliance</h1>
                </div>
                <div className="bg-white p-3 m-1 shadow rounded flex items-center"
                onClick={() => setSection(1)} style={{cursor: "pointer"}}>
                    <FaBolt size={32}></FaBolt>
                    <h1>Energy Plan</h1>
                </div>
            </div>
            <div className="bg-white rounded shadow size-full p-5 w-fit">
                {section == 0 ?
                    <ConfigurationAppliance editMode={true}></ConfigurationAppliance>
                    :
                    <ConfigurationEnergyPlan></ConfigurationEnergyPlan>
                    }
            </div>
        </div>
    )
}
