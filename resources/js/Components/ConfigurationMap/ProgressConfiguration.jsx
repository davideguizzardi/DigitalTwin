import { FaHouse, FaLightbulb, FaBolt,FaCheck } from "react-icons/fa6";
import { useState } from "react";

export default function ({state, setState}){
    return(
        <div className="w-full flex justify-start items-center my-2 py-2 px-4
        rounded bg-white shadow">
            <div className={"rounded-full p-1 size-min border solid bg-lime-400"}
            onClick={() => setState(0)}
            >
                <FaHouse size={32}></FaHouse>
            </div>            
            <div className={"w-full p-2 mx-2 rounded " + (state>0 ? "bg-lime-400": "bg-gray-300")}></div>
            <div className={"rounded-full p-1 size-min border solid " + (state>0 ? "bg-lime-400": "bg-gray-300")}
            onClick={() => setState(1)}
                >
                <FaLightbulb size={32}></FaLightbulb>
            </div>            
            <div className={"w-full p-2 mx-2 rounded " + (state>1 ? "bg-lime-400": "bg-gray-300")}></div>
            <div className={"rounded-full p-1 size-min border solid " + (state>1 ? "bg-lime-400": "bg-gray-300")}
            onClick={() => setState(2)}
                >
                <FaBolt size={32}></FaBolt>
            </div>            
            <div className={"w-full p-2 mx-2 rounded " + (state>2 ? "bg-lime-400": "bg-gray-300")}></div>
            <div className={"rounded-full p-1 size-min border solid " + (state>2 ? "bg-lime-400": "bg-gray-300") }
            onClick={() => setState(3)}
                >
                <FaCheck size={32}></FaCheck>
            </div>            
            
        </div>
    )
}