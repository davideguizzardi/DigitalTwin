import { useCallback, useEffect, useRef, useState } from "react";
import { ThemeButton } from "@/Components/Commons/ThemeButton"
import { motion } from "framer-motion";
import ListButtons from "@/Components/Commons/ListButtons"
import ListAppliances from "@/Components/ConfigurationMap/ListAppliances"
import DroppableLayer from "@/Components/ConfigurationMap/DroppableLayer";
import { Modal } from "flowbite-react";
import Cookies from 'js-cookie';
import AnimateMap from "../Commons/AnimateMap";

const token = Cookies.get("auth-token")

export default function ConfigurationAppliance({editMode, endSection}) {
    const configRef = useRef()
    const refApplOnfFloor = useRef()
    const [applOnFloor, setApplOnFloor] = useState([])
    const [up, setUp] = useState(false)
    const [maps, setMaps] = useState([])
    refApplOnfFloor.current = applOnFloor
    const [unconfAppl, setUnconfAppl] = useState([])
    const [floor, setFloor] = useState()
    let [indexImg, setIndexImg] = useState(0);
    const [first, setFirst] = useState(true)
    const [openModal, setOpenModal] = useState(false)
    let dataBtn = []

    maps.map((element, index) => {
        dataBtn = [...dataBtn, {
            callback: () => {
                setUp(element.floor>floor)
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

    const deleteAppl = async (appl) =>{
        const response = await fetch("http://localhost:8000/map/entity/" + appl,{
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token 
            },
        })
        console.log(response)
    }

    const deleteUnconfAppl = async () =>{
        unconfAppl.forEach((appl) => {
            console.log(appl)
            deleteAppl(appl)
        })
    }

    const putApplOnFloor = async () =>{
        const data = applOnFloor.map((e) => {
            return {
                entity_id: e.id,
                y: e.top,
                x: e.left,
                floor: e.floor
            }
        })
        const response = await fetch("http://localhost:8000/map",{
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': 'Bearer ' + token 
            },
            body: JSON.stringify({data: data})
        })       
    }

    const saveCallback = () =>{
        if(unconfAppl.length > 0 ){
            setOpenModal(true)
            
        } else{
            putApplOnFloor()
            endSection()
        }
    }

    useEffect(() => {
        const apiRoute = route('map.index')
        const fetchMap = async () =>{
            const response =  await fetch(apiRoute, {
            headers: {
                'Authorization': 'Bearer ' + token 
            },
            })
            response.json().then((result) =>{
                setMaps([...result.maps])
                setFloor(result.maps[0].floor)
            })
            
        }
        fetchMap()
    },[])

    useEffect(()=>{
        const fetchApplOnFloor = async () =>{
            const response = await fetch("http://localhost:8000/map")
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
        }
        fetchUnconfAppl()
    }, [first, applOnFloor])

    return (
        <div className="relative size-full flex flex-col justify-center items-center bg-white shadow "
           ref={configRef}
        >
            <Modal size="3xl" show={openModal} onClose={()=>setOpenModal(false)}>
                <Modal.Header>Unconfigured Appliances</Modal.Header>
                <Modal.Body>
                    <div className="flex flex-col h-3/6">
                        <div className="flex w-full h-fit pb-4 gap-2 justify-center items-center ">
                            <p>Those appliances are not configured</p>
                        </div>
                        <div className="w-full h-full p-5">
                            <ListAppliances appliances={unconfAppl} dragConstraints={configRef}
                            addAppl={addUnconfAppl} removeAppl={removeUnconAppl}
                            />
                        </div>
                        <div className="flex items-center justify-around p-2 mt-2">
                            <ThemeButton onClick={()=>{setOpenModal(false)}}>Cancel</ThemeButton>
                            <ThemeButton onClick={()=>{
                                deleteUnconfAppl()
                                putApplOnFloor()
                                setOpenModal(false)
                                endSection()
                            }}>Save</ThemeButton>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
            <p className='h-min w-full p-4 text-center text-2xl'>Configure Appliance</p>
            <div className="flex w-full h-full">
                <div className="w-4/6 xl:w-full h-full p-2">
                    <div className="size-full flex justify-center items-center">
                            <div className="relative size-full flex justify-center items-center shadow">
                                { maps[indexImg] && (
                                    <AnimateMap map={maps[indexImg].url} up={up}/>
                                )}
                                <DroppableLayer isEditMode={editMode}  dragConstraints={configRef}
                                 listAppliancesPos={refApplOnfFloor.current} index={floor} 
                                 addAppl={addApplOnFloor} removeAppl={removeApplOnFloor}
                                 />
                            </div>

                        <motion.div className="flex flex-col justify-center items-center w-min m-2 p-1 rounded-full"
                        >
                            <p>Floors</p>
                            <ListButtons dataButtons={dataBtn} index={indexImg} />
                        </motion.div>
                    </div>
                </div>
                <div className="w-2/6 xl:w-full h-5/6 p-2">
                    <p className="text-center text-xl">Appliances</p>
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