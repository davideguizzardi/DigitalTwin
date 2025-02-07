import { animate, AnimatePresence, motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { AVAILABLE_DROP, DRAG_END, DRAG_END_OUT, DRAG_START, emit, subscribe, unsubscribe } from "@/Utils/events"
import IconAppliance from "../Commons/IconAppliance"
import { getIcon,getDeviceIcon} from "../Commons/Constants"

export const FULL = 0
export const MIN = 1
export const ICON = 2

const typeMode = ["full", "min", "icon"]


export default function CardDraggable({id, name, category, draggable, parentRef, dragConstraints, type, style = {} }) {
    //const [typeAppl, name] = id.split(".", 2)
    const cardRef = useRef()
    const parent = parentRef
    let droppableList = useRef([])
    const [oldPos, setOldPos] = useState({ top: 0, left: 0 })
    let [mode, setMode] = useState(type)
    let [firstTime, setFirstTime] = useState(true)
    const isDark = localStorage.getItem("darkMode") == "true"

    const variantCard = {
        full: {
            zIndex: 0,
            border: "solid",
            borderColor: isDark ? "#262626" : "#f3f4f6",
            width: '100%',
            backgroundColor: isDark ? "#404040" : "white",
            padding: '8px',
            borderRadius: '6px'
        },
        min: {
            width: '250px',
            backgroundColor: isDark ? "#404040" : "white",
            padding: '8px',
            borderRadius: '50px'
        },
        icon: {
            zIndex: 50,
            width: "36px",
            backgroundColor: "transparent",
            padding: '0px',
            borderRadius: '99999px'
        }
    }

    const setFirstPosition = (event, info) => {
        if (mode == FULL) {
            const elem = cardRef.current
            const scrollOffset = { top: dragConstraints.current.getBoundingClientRect().top }
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
        if (draggable) {
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


    return (

        <motion.div
            ref={cardRef}
            className="py-1 flex justify-start items-center z-10"
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
            {getDeviceIcon(category)}
            <AnimatePresence>
                {mode != ICON &&
                    <motion.p className="flex flex-col px-2 text-ellipsis overflow-hidden dark:text-white"
                        initial={{ display: "none", x: -50, opacity: 0 }}
                        animate={{ display: "block", x: 0, opacity: 1 }}
                        exit={{ display: "none", x: -150, opacity: 0 }}
                        transition={{
                            duration: 0.2,
                            opacity: { duration: 0.05 }
                        }}
                    >
                        {name}
                    </motion.p>
                }
            </AnimatePresence>
        </motion.div>
    )
} 