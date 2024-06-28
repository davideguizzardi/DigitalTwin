import { FaLightbulb } from "react-icons/fa6"
import { animate, motion, motionValue } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { AVAILABLE_DROP, DRAG_END, DRAG_END_OUT,DRAG_START, emit, subscribe, unsubscribe } from "@/Utils/events"

export const FULL = 0
export const MIN = 1
export const ICON = 2

const typeMode = ["full", "min", "icon"]


export default function CardAppliance({ id, draggable, parentRef, dragConstraints, type, style = {} }) {
    const cardRef = useRef()
    const parent = parentRef
    let droppableList = useRef([])
    let [mode, setMode] = useState(type)
    let [firstTime, setFirstTime] = useState(true)

    const variantCard = {
        full: {
            width: '100%',
            padding: '8px',
            borderRadius: '6px'
        },
        min: {
            width: 'min-content',
            padding: '8px',
            borderRadius: '6px'
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
                    right: info.point.y - dragConstraints.current.offsetTop - 20
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
        setModeIcon();
        setFirstPosition(event, info);
        emit(DRAG_START, { id: cardRef });
    }

    const handleDragEnd = () => {

        let droppable = false;
        const cardRect = cardRef.current.getBoundingClientRect()
        droppableList.current.forEach((e) => {
            const elemRect = e.id.current.getBoundingClientRect()
            if (cardRect.left > elemRect.left &&
                cardRect.top > elemRect.top &&
                cardRect.left + 48 < elemRect.right &&
                cardRect.top + 48 < elemRect.bottom
            ) {
                droppable = true
                emit(DRAG_END, { id: id, droppable: e.id, rect:{top: cardRect.top, left: cardRect.left} })
            }
        })
        if (!droppable) {
            emit(DRAG_END_OUT, { id: id, droppable: parent})
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

    return (

        <motion.div
            ref={cardRef}
            className="py-1 flex justify-start shadow relative bg-white z-10"
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
            <div className='bg-opacity-0 bg-red-100 absolute top-0 left-0 size-full z-20'></div>
            <div className="rounded-full bg-gray-200 p-1 size-min">
                <FaLightbulb size={32} />
            </div>
            {mode == ICON ? <></>
                :
                <div className="flex flex-col w-full px-2">
                    <div className="flex w-full justify-start">
                        <span>Appliance</span>
                    </div>
                    <div className="flex w-full justify-start">
                        <span>Id: {id}</span>
                    </div>
                </div>
            }
        </motion.div>
    )
} 