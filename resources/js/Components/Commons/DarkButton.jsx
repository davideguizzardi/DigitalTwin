import {FaSun, FaMoon} from "react-icons/fa6"

export default function DarkButton(){
    const setDarkMode = (dark) =>{
        if(dark)
            document.documentElement.classList.add("dark")
        else
            document.documentElement.classList.remove("dark")
        localStorage.setItem("darkMode", dark)
        
    }

    return (
        <div className="border-2 rounded border-gray-400 dark:border-neutral-600 bg-gray-300 dark:bg-neutral-700 flex justify-around items-center px-3 gap-2">
            <div className="w-full p-2 "
                style={{cursor: "pointer"}}
                onClick={() =>{
                    setDarkMode(false)
                }}
            >
                <FaSun />
            </div>
            <div className="w-2 h-full bg-gray-400 dark:bg-neutral-600" />
            <div className="w-full p-2"
                style={{cursor: "pointer"}}
                onClick={() =>{
                    setDarkMode(true)
                }}
            >
                <FaMoon />
            </div>
        </div>
    )
}