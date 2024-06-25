import { FaLightbulb } from "react-icons/fa6"
import { animate, motion, motionValue } from "framer-motion"
import { useRef, useState } from "react"

const FULL = 0
const MIN = 1
const ICON = 2

const typeMode = ["full", "min", "icon"]


export default function CardAppliance({ text, draggable, dragConstraints}) {
    const cardRef = useRef()
    let [mode, setMode] = useState(FULL)
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
            width: 'min-content',
            padding: '1px',
            borderRadius: '99999px'
        }
    }


    const setFirstPosition = (event, info) => {
        const elem = cardRef.current
        const oldX = info.point.x - event.layerX
        const oldY = info.point.y - event.layerY
        const sequence = [
            [elem, {
                position: 'absolute',
                left: oldX,
                top: oldY,
            }, {duration: 0.01}],
            [elem, {
                left: info.point.x - info.offset.x -20,
                top: info.point.y - info.offset.y - 20,
            }]
        ]
        if (firstTime) {
            animate(sequence)
            setFirstTime(false)
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
    return (

        <motion.div
            ref={cardRef}
            className="py-1 flex justify-start shadow relative z-10"
            variants={variantCard}
            animate={typeMode[mode]}
            drag={draggable}
            dragMomentum={false}
            onDragStart={(event, info) => { setModeIcon(), setFirstPosition(event, info)}}
            onDragEnd={(event) => {console.log(event)}}
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
                        <span>{text}</span>
                    </div>
                </div>
            }
        </motion.div>
    )
} 