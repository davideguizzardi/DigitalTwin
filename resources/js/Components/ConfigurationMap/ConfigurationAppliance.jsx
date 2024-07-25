import { useCallback, useEffect, useRef, useState } from "react";
import { ThemeButton } from "@/Components/Commons/ThemeButton"
import { motion } from "framer-motion";
import ListButtons from "@/Components/Commons/ListButtons"
import ListAppliances from "@/Components/ConfigurationMap/ListAppliances"
import DroppableLayer from "@/Components/ConfigurationMap/DroppableLayer";

export default function ConfigurationAppliance({editMode, endSection}) {
    const configRef = useRef()
    const refApplOnfFloor = useRef()
    const [applOnFloor, setApplOnFloor] = useState([])
    const [maps, setMaps] = useState([])
    refApplOnfFloor.current = applOnFloor
    const [unconfAppl, setUnconfAppl] = useState([])
    const [floor, setFloor] = useState()
    let [indexImg, setIndexImg] = useState(0);
    const [first, setFirst] = useState(true)
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

    const saveCallback = async () =>{
        const data = applOnFloor.map((e) => {
            return {
                entity_id: e.id,
                y: e.top,
                x: e.left,
                floor: e.floor
            }
        })
        console.log(data)
        const response = await fetch("http://localhost:8000/configuration/map",{
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({data: data})
        })
        console.log(response)
        response.json().then((result) => console.log(result))
        endSection()
    }

    useEffect(() => {
        const apiRoute = route('map.index')
        const fetchMap = async () =>{
            const response =  await fetch(apiRoute)
            response.json().then((result) =>{
                setMaps([...result.maps])
                setFloor(result.maps[0].floor)
            })
        }
        fetchMap()
    },[])

    useEffect(()=>{
        const fetchApplOnFloor = async () =>{
            const response = await fetch("http://localhost:8000/configuration/map")
            response.json().then((result) =>{
                const updateState = result.map((e) => { 
                    return {
                        id: e.entity_id,  
                        top: e.y,
                        left: e.x,
                        floor: e.floor
                    }
                }) 
                setApplOnFloor([...updateState])
                setFirst(false)
            })
        }
        fetchApplOnFloor()
        refApplOnfFloor.current = applOnFloor
    }, [])

    useEffect(()=>{
        const fetchUnconfAppl = async () =>{
            const response = await fetch("http://localhost:8000/virtual/entity")
            const result = await response.json()
            const updateState =result.filter((appl)=> {
                return !applOnFloor.some(e => appl.entity_id == e.id)
            }).map(e => e.entity_id)
            setUnconfAppl([...updateState])
            console.log(updateState)
        }
        fetchUnconfAppl()
    }, [first, applOnFloor])

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
                                { maps[indexImg] && (
                                    <img className="max-h-full aspect-auto p-2" src={maps[indexImg].url} alt="" />
                                )}
                                <DroppableLayer isEditMode={editMode}  dragConstraints={configRef}
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
                <div className="w-full h-full p-5">
                    <ListAppliances appliances={unconfAppl} dragConstraints={configRef} isEditMode={true}
                    addAppl={addUnconfAppl} removeAppl={removeUnconAppl}
                    />
                </div>
            </div>
            <div className="flex items-center p-5">
                <ThemeButton onClick={()=>{saveCallback()}}> Save </ThemeButton>
            </div>
        </div>
    )
}