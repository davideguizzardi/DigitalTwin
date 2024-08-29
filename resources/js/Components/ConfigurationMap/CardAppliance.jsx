import { FaLightbulb, FaFan, FaMusic, FaToggleOn, FaCloudSun, FaTowerBroadcast, FaMobileButton, FaRegSun, FaQuestion } from "react-icons/fa6"
import { animate, motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { AVAILABLE_DROP, DRAG_END, DRAG_END_OUT, DRAG_START, emit, subscribe, unsubscribe } from "@/Utils/events"

export const FULL = 0
export const MIN = 1
export const ICON = 2

const typeMode = ["full", "min", "icon"]


export default function CardAppliance({ id, draggable, parentRef, dragConstraints, type, style = {} }) {
    const [typeAppl, name] = id.split(".", 2)
    const cardRef = useRef()
    const parent = parentRef
    let droppableList = useRef([])
    const [oldPos, setOldPos] = useState({ top: 0, left: 0 })
    let [mode, setMode] = useState(type)
    let [firstTime, setFirstTime] = useState(true)

    const variantCard = {
        full: {
            zIndex: 0,
            width: '100%',
            padding: '8px',
            borderRadius: '6px'
        },
        min: {
            width: 'min-content',
            padding: '8px',
            borderRadius: '50px'
        },
        icon: {
            zIndex: 100,
            width: 'min-content',
            padding: '1px',
            borderRadius: '99999px'
        }
    }

    const setFirstPosition = (event, info) => {
        if (mode == FULL) {
            const elem = cardRef.current
            const oldX = info.point.x - dragConstraints.current.offsetLeft - event.layerX
            const oldY = info.point.y - dragConstraints.current.offsetTop - event.layerY
            const sequence = [
                [elem, {
                    position: 'absolute',
                    left: oldX,
                    top: oldY,
                }, { duration: 0.001 }],
                [elem, {
                    left: info.point.x - dragConstraints.current.offsetLeft - 20,
                    top: info.point.y - dragConstraints.current.offsetTop - 20
                }, { duration: 0.5 }]
            ]
            if (firstTime) {
                animate(sequence)
                setFirstTime(false)
            }
        }
    }

    const setModeIcon = () => {
        setMode(ICON)
    }
    const setModeMin = () => {
        setMode(MIN)
    }
    const setModeFull = () => {
        setMode(FULL)
    }

    const handleDragStart = (event, info) => {
        if(draggable){
            const cardRect = cardRef.current.getBoundingClientRect()
            setModeIcon();
            setFirstPosition(event, info);
            setOldPos({ top: cardRect.top, left: cardRect.left })
            emit(DRAG_START, { id: cardRef });
        }
    }

    const handleDragEnd = () => {

        let droppable = false;
        const cardRect = cardRef.current.getBoundingClientRect()
        droppableList.current.forEach((e) => {
            if (e.id.current != null && e.id.current != undefined) {
                const elemRect = e.id.current.getBoundingClientRect()
                if (cardRect.left > elemRect.left &&
                    cardRect.top > elemRect.top &&
                    cardRect.left + 48 < elemRect.right &&
                    cardRect.top + 48 < elemRect.bottom
                ) {
                    droppable = true
                    emit(DRAG_END, { id: id, droppable: e.id, rect: { top: cardRect.top, left: cardRect.left } })
                }
            }
        })
        if (!droppable) {
            emit(DRAG_END_OUT, { id: id, droppable: parent, rect: { top: oldPos.top, left: oldPos.left } })
        }
    }

    useEffect(() => {
        subscribe(AVAILABLE_DROP, (event) => {
            let isPresent = false;
            droppableList.current.forEach((e) => {
                if (e.id == event.detail.id)
                    isPresent = true
            })
            if (!isPresent)
                droppableList.current = [...droppableList.current, event.detail]
        });
        return () => {
            droppableList.current = [];
            unsubscribe(AVAILABLE_DROP, () => { })
        }
    }, [])

    let icon = null
    switch(typeAppl){
        case "sun":
            icon = (
                <div className="bg-amber-300 rounded-full p-2 ">
                    <FaRegSun size={36}/>
                </div>
            )
            break
        case "media_player":
            icon = (
                <div className="bg-violet-300 rounded-full p-2 ">
                    <FaMusic size={36}/>
                </div>
            )
            break
        case "button":
            icon = (
                <div className="bg-orange-400 rounded-full p-2 ">
                    <FaToggleOn size={36}/>
                </div>
            )
            break
        case "weather":
            icon = (
                <div className="bg-cyan-300 rounded-full p-2 ">
                    <FaCloudSun size={36}/>
                </div>
            )
            break
        case "sensor":
            icon = (
                <div className="bg-emerald-300 rounded-full p-2 ">
                    <FaTowerBroadcast size={36}/>
                </div>
            )
            break
        case "device_tracker":
            icon = (
                <div className="bg-red-400 rounded-full p-2 ">
                    <FaMobileButton size={36}/>
                </div>
            )
            break
        case "light":
            icon = (
                <div className="bg-yellow-200 rounded-full p-2 ">
                    <FaLightbulb size={36}/>
                </div>
            )
            break
        case "fan": 
            icon = (
                <div className="bg-slate-400 rounded-full p-2 ">
                    <FaFan size={36}/>
                </div>
            )
            break
        default :
            icon = (
                <div className="bg-gray-300 rounded-full p-2 ">
                    <FaQuestion size={36}/>
                </div>
            )
    }

    return (

        <motion.div
            ref={cardRef}
            className="py-1 flex justify-start items-center shadow bg-white z-10"
            variants={variantCard}
            animate={typeMode[mode]}
            drag={draggable}
            dragMomentum={false}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={() => {
                if (mode == ICON)
                    setModeMin()
                else if (mode == MIN)
                    setModeIcon()
            }}
            style={style}
        >
            {icon}
            {mode == ICON ? <></>
                :
                <div className="flex flex-col w-full px-2">
                    <div className="flex w-full justify-start">
                        <span>{name}</span>
                    </div>
                </div>
            }
        </motion.div>
    )
} 