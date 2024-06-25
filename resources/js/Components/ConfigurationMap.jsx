import { useCallback, useRef, useState } from "react";
import { ThemeButton } from "./ThemeButton"
import { motion } from "framer-motion";
import ListButtons from "@/Components/ListButtons"
import ListAppliances from "@/Components/ListAppliances"

export default function ConfigurationMap({ maps }) {
    let configRef = useRef()
    let [indexImg, setIndexImg] = useState(0);
    let [isEditMap, setEditMap] = useState(false);
    let dataBtn = []

    maps.map((element, index) => {
        dataBtn = [...dataBtn, {
            callback: useCallback(() => {
                setIndexImg(index)
            }, []),
            text: index,
            icon: (<></>)
        }]
    })

    const handleToggleEditMap = () => {
        setEditMap(!isEditMap);
    }

    const variantListButton = {
        hidden: {
            visibility: "hidden",
            x: 50,
            opacity: 0,
            width: 0
        },
        show: {
            visibility: "visible",
            x: 0,
            opacity: 1,
            width: 100
        }
    }

    return (
        <div className="flex flex-col h-full w-full justify-center items-center"
           ref={configRef}
           onPointerUp={(event) => {console.log(event)}}
        >
            <p className='h-min w-full p-4 text-center text-2xl'>Configure map house</p>
            <div className="flex flex-col lg:flex-row w-full h-full lg:h-5/6">
                <div className="w-full h-full p-5">
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
                        <div className={'bg-opacity-0 bg-red-100 absolute top-0 left-0 size-full ' + (isEditMap ? ' z-10' : '-z-10')}
                        ></div>
                    </div>
                </div>
                <div className="w-full h-full p-4 p-5 overflow-y-scroll">
                    <p className='h-min w-full p-4 text-center text-2xl'>Configure map house</p>
                    <ListAppliances appliance={Array.from(Array(10).keys())} dragConstraints={configRef} isEditMode={isEditMap}></ListAppliances>
                </div>
            </div>
            <div className="flex items-center p-5">
                <ThemeButton onClick={handleToggleEditMap}>{isEditMap ? "Save" : "Edit"}</ThemeButton>
            </div>
        </div>
    )
}