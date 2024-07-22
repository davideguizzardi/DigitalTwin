import { useCallback, useEffect, useRef, useState } from "react";
import { ThemeButton } from "@/Components/Commons/ThemeButton"
import { motion } from "framer-motion";
import ListButtons from "@/Components/Commons/ListButtons"
import ListAppliances from "@/Components/ConfigurationMap/ListAppliances"
import DroppableLayer from "@/Components/ConfigurationMap/DroppableLayer";

export default function ConfigurationAppliance({ maps }) {
    const configRef = useRef()
    const refApplOnfFloor = useRef()
    const [applOnFloor, setApplOnFloor] = useState([])
    refApplOnfFloor.current = applOnFloor
    const [unconfAppl, setUnconfAppl] = useState([...Array.from(Array(10).keys()).map((el)=> "appl_" + el)])
    const [floor, setFloor] = useState(maps[0].floor)
    let [indexImg, setIndexImg] = useState(0);
    let [isEditMap, setEditMap] = useState(true);
    let dataBtn = []

    maps.map((element, index) => {
        dataBtn = [...dataBtn, {
            callback: () => {
                setFloor(element.floor)
                setIndexImg(index)
            },
            text: element.floor,
            icon: (<></>)
        }]
    })

    const addApplOnFloor =(posAppl) =>{
        const updateState = [...refApplOnfFloor.current , posAppl]
        setApplOnFloor([...updateState])
    }

    const removeApplOnFloor = (posApplId) =>{
        const updateState = refApplOnfFloor.current.filter(el => el.id!==posApplId)      
        setApplOnFloor([...updateState])
    }

    const addUnconfAppl = (appl) =>{
        const updateState = [...unconfAppl, appl]
        setUnconfAppl([...updateState])
    }

    const removeUnconAppl = (appl) =>{
        const updateState = unconfAppl.filter(el => appl!==el)
        setUnconfAppl([...updateState])
    }


    useEffect(()=>{
        refApplOnfFloor.current = applOnFloor
    }, [applOnFloor])

    return (
        <div className="relative flex flex-col h-full w-full justify-center items-center"
           ref={configRef}
        >
            <p className='h-min w-full p-4 text-center text-2xl'>Configure Appliance</p>
            <div className="flex flex-col lg:flex-row w-full h-full lg:h-5/6">
                <div className="w-full h-full p-5">
                    <div className="size-full flex justify-center items-center">
                        <div className="flex size-full items-center justify-center">
                            <div className="max-w-screen max-h-screen relative flex justify-center items-center ">
                                <img className="max-h-full aspect-auto p-2" src={maps[indexImg].url} alt="" />
                                <DroppableLayer isEditMode={isEditMap}  dragConstraints={configRef}
                                 listAppliancesPos={refApplOnfFloor.current} index={floor} 
                                 addAppl={addApplOnFloor} removeAppl={removeApplOnFloor}
                                 />
                            </div>
                        </div>

                        <motion.div className="flex flex-col justify-center w-min m-2 p-1 rounded-full"
                        >
                            <ListButtons dataButtons={dataBtn} index={indexImg} />
                        </motion.div>
                    </div>
                </div>
                <div className="w-full h-full p-4 p-5 ">
                    <ListAppliances appliances={unconfAppl} dragConstraints={configRef} isEditMode={isEditMap}
                    addAppl={addUnconfAppl} removeAppl={removeUnconAppl}
                    />
                </div>
            </div>
            <div className="flex items-center p-5">
                <ThemeButton onClick={()=>(console.log(applOnFloor))}>{isEditMap ? "Save" : "Edit"}</ThemeButton>
            </div>
        </div>
    )
}