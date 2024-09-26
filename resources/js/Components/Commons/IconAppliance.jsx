import { FaLightbulb, FaFan, FaMusic, FaToggleOn, FaCloudSun, FaTowerBroadcast, FaMobileButton, FaRegSun, FaQuestion } from "react-icons/fa6"
export default function IconAppliance ({typeAppl, size=36}) {
    let icon = null
    let color = null
    switch(typeAppl){
        case "sun":
            color = "bg-amber-300"
            icon = (<FaRegSun size={36}/>)
            break
        case "media_player":
            color = "bg-violet-300"
            icon = (<FaMusic size={36}/>)
            break
        case "button":
            color = "bg-orange-400"
            icon = (<FaToggleOn size={36}/>)
            break
        case "weather":
            color = "bg-cyan-300"
            icon = (<FaCloudSun size={36}/>)
            break
        case "sensor":
            color = "bg-emerald-300"
            icon = (<FaTowerBroadcast size={36}/>)
            break
        case "device_tracker":
            color = "bg-red-400"
            icon = (<FaMobileButton size={36}/>)
            break
        case "light":
            color = "bg-yellow-200"
            icon = (<FaLightbulb size={36}/>)
            break
        case "fan": 
            color = "bg-slate-400"
            icon = (<FaFan size={36}/>)
            break
        default :
            color = "bg-gray-300"
            icon = (<FaQuestion size={36}/>)
    }
    return(
        <div className={"rounded-full p-2 " + color}>
            {icon}
        </div>
    )
}