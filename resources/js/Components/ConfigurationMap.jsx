import { useCallback, useRef, useState } from "react";
import { ThemeButton } from "./ThemeButton"
import { motion } from "framer-motion";
import ListButtons from "@/Components/ListButtons"
import ListAppliances from "@/Components/ListAppliances"
import DroppableLayer from "./DroppableLayer";

export default function ConfigurationMap({ maps }) {
    let configRef = useRef()
    let [indexImg, setIndexImg] = useState(0);
    let [isEditMap, setEditMap] = useState(false);
    let dataBtn = []

    let appliances = Array.from(Array(5).keys()).map((el)=> "appl_" + el)

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
        <div className="relative flex flex-col h-full w-full justify-center items-center"
           ref={configRef}
        >
            <p className='h-min w-full p-4 text-center text-2xl'>Configure map house</p>
            <div className="flex flex-col lg:flex-row w-full h-full lg:h-5/6">
                <div className="w-full h-full p-5">
                    <div className="size-full flex justify-center items-center">
                        <div className="w-full h-full max-w-screen max-h-screen relative flex justify-center items-center ">
                            <img className="max-h-full aspect-auto p-2" src={maps[indexImg].url} alt="" />
                        <DroppableLayer isEditMode={isEditMap} listAppliancesPos={Array.from(Array(0).keys())} dragConstraints={configRef}></DroppableLayer>
                        </div>

                        <motion.div className="flex flex-col justify-center w-min m-2 p-1 rounded-full"
                            animate={isEditMap ? "hidden" : "show"}
                            variants={variantListButton}
                        >
                            <ListButtons dataButtons={dataBtn} index={indexImg} />
                        </motion.div>
                    </div>
                </div>
                <div className="w-full h-full p-4 p-5 overflow-y-scroll">
                    <p className='h-min w-full p-4 text-center text-2xl'>Configure map house</p>
                    <ListAppliances appliances={appliances} dragConstraints={configRef} isEditMode={isEditMap}></ListAppliances>
                </div>
            </div>
            <div className="flex items-center p-5">
                <ThemeButton onClick={handleToggleEditMap}>{isEditMap ? "Save" : "Edit"}</ThemeButton>
            </div>
        </div>
    )
}