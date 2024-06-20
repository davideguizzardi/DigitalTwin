import { useCallback, useState } from "react";
import { ThemeButton } from "./ThemeButton"
import { motion } from "framer-motion";
import ListButtons from "@/Components/ListButtons"

export default function ConfigurationMap({ maps }) {
    let [indexImg, setIndexImg] = useState(0);
    let [isEditMap, setEditMap] = useState(false);
    let dataBtn = []
    maps.map((element, index) => {
        dataBtn = [...dataBtn, useCallback(() => {
                setIndexImg(index)
            }, [])
        ]
    });

    const handleToggleEditMap = () => {
        setEditMap(!isEditMap);
    }

    const variantListButton = {
        hidden: {
            x: 50,
            opacity: 0,
            width: 0
        },
        show: {
            x: 0,
            opacity: 1,
            width: 100
        }
    }

    const droppableClass = 'bg-opacity-0 absolute top-0 left-0 size-full ' + isEditMap ? ' z-10 ' : ' -z-10' 

    return (
        <div className="flex flex-col h-full w-full justify-center items-center">
            <p className='h-min w-full p-4 text-center text-2xl'>Configure map house</p>
            <div className="flex flex-col lg:flex-row w-full h-full lg:h-5/6">
                <div className="w-full lg:w-5/6 h-full p-5">
                    <div className="size-full flex justify-center items-center relative">
                        <div className="w-full h-full max-w-screen max-h-screen flex justify-center items-center ">
                            <img className="max-h-full aspect-auto" src={maps[indexImg].url} alt="" />
                        </div>

                        <motion.div className="flex flex-col justify-center w-min m-2 p-1 rounded-full"
                            animate={isEditMap ? "hidden" : "show"}
                            variants={variantListButton}
                        >
                            <ListButtons dataButtons={dataBtn} index={indexImg} />
                        </motion.div>
                        <div className={droppableClass}></div>
                    </div>
                </div>
                <div className="w-full lg:w-5/6 h-full p-5">
                </div>
            </div>
            <ThemeButton onClick={handleToggleEditMap}>Edit</ThemeButton>
        </div>
    )
}