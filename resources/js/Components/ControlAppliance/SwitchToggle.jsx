import { useState,useEffect } from "react";
import { callService,getIcon,apiFetch,backend } from "../Commons/Constants";

export function SwitchToggle({state,stateId,user,setErrorFun={}}) {
  const [isOn, setIsOn] = useState(false);
  useEffect(()=>{setIsOn(state)},[state])

  const handleClick=async()=>{
    const service=isOn? "turn_off":"turn_on"
    const ret=await callService(stateId,service,{},user)
    setIsOn(!isOn)
  }

  return (
    <>
    <div
      className={`relative flex items-center w-[60%] h-28 p-1 bg-gray-400 rounded-2xl cursor-pointer transition-colors ${
        isOn ? "bg-lime-500" : "bg-gray-400"
      }`}
      onClick={() => handleClick()}
      >
      <div
        className={`size-24 bg-zinc-50 rounded-2xl shadow-xl flex items-center justify-center transition-transform duration-300 ${
          isOn ? "translate-x-[15.7rem]" : "translate-x-0"
        }`}
        >
        {getIcon(isOn ? "power_off" : "power_on", `size-12 text-sm ${isOn ? "text-lime-600" : "text-gray-600"}`)}
      </div>
    </div>
        </>
  );
  
}