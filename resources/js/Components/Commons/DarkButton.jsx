import {FaSun, FaMoon} from "react-icons/fa6"
import WhiteCard from "./WhiteCard"
import { useState } from "react"
import { useEffect } from "react"

export default function DarkButton(){
    const [darkMode, setDarkMode] = useState()

    const handleDarkMode = (dark) =>{
        if(dark)
            document.documentElement.classList.add("dark")
        else
            document.documentElement.classList.remove("dark")
        localStorage.setItem("darkMode", dark)
        setDarkMode(dark)
    }

    useEffect(() =>{
        setDarkMode( document.documentElement.classList.contains("dark"))
    })

    return (
        <WhiteCard className="border-2 rounded flex justify-around items-center p-1 gap-1">
            <div className="w-full py-2 px-4 rounded bg-zinc-300 dark:bg-neutral-900"
                style={{cursor: "pointer"}}
                onClick={() =>{
                    handleDarkMode(false)
                }}
            >
                <FaSun color={darkMode ? "#e4e4e7" : "#404040" } size={24}/>
            </div>
            <div className="w-2 h-full bg-gray-400 dark:bg-neutral-700" />
            <div className="w-full py-2 px-4 dark:bg-neutral-700 rounded"
                style={{cursor: "pointer"}}
                onClick={() =>{
                    handleDarkMode(true)
                }}
            >
                <FaMoon color={darkMode ? "#e4e4e7": "#404040" } size={24}/>
            </div>
        </WhiteCard>
    )
}