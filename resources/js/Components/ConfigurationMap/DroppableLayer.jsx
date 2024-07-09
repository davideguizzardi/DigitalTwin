import { AVAILABLE_DROP, DRAG_END, DRAG_END_OUT, DRAG_START, subscribe, unsubscribe } from "@/Utils/events"
import { useEffect, useRef, useState } from "react"
import { emit } from "@/Utils/events"
import CardAppliance, { ICON } from "@/Components/ConfigurationMap/CardAppliance"

export default function DroppableLayer({ isEditMode, listAppliancesPos, dragConstraints }) {
    const [applPos, setApplPos] = useState([...listAppliancesPos])
    const layerRef = useRef()

    const handleDragEnd = (event) => {
        let tempApplPos = applPos.filter(e => e.id != event.detail.id)
        const element =  applPos.filter(e => e.id == event.detail.id)
        console.log(element)
        setApplPos([...tempApplPos])
        setTimeout(() => {
            if (event.detail.droppable == layerRef) {
                const cardRect = event.detail.rect
                const layerRect = layerRef.current.getBoundingClientRect()
                const absTop = cardRect.top - layerRect.top  
                const absLeft = cardRect.left - layerRect.left
                const relTop = absTop * 100 / layerRect.height
                const relLeft = absLeft * 100 / layerRect.width
                console.log(absTop)
                console.log(absLeft)
                tempApplPos = [...tempApplPos, { id: event.detail.id, top: relTop, left: relLeft }]
                setApplPos([...tempApplPos])
            }
        }, 1)
    }

    const handleDragEndOut = (event) => {
        const elem = applPos.filter(e => e.id == event.detail.id)[0]
        if (event.detail.droppable == layerRef && elem) {
            let tempApplPos = applPos.filter(e => e.id != event.detail.id)
            setApplPos([...tempApplPos])
            setTimeout(() =>{
                tempApplPos = [...tempApplPos, elem]
                setApplPos([...tempApplPos])
            }, 1)
        }
    }

    useEffect(() => {
        subscribe(DRAG_START, (event) => {
            emit(AVAILABLE_DROP, {
                id: layerRef,
            })
        });
        subscribe(DRAG_END, handleDragEnd)
        subscribe(DRAG_END_OUT, handleDragEndOut)
        return () => {
            unsubscribe(DRAG_START, () => { })
            unsubscribe(DRAG_END, () => { })
            unsubscribe(DRAG_END_OUT, () => { })
        }
    }, [applPos])



    return (
        <div className={' bg-blue-100 absolute top-0 left-0 size-full z-10 ' + (isEditMode ? ' bg-opacity-50 ' : ' bg-opacity-0 ')}
            ref={layerRef} id="droppable_layer"
        >
            <div className="size-full absolute relative">
                {
                    applPos.map((e) => (
                        <CardAppliance key={e.id} id={e.id} type={ICON} style={{position: "absolute", left: e.left +"%", top: e.top +"%"}}
                            draggable={isEditMode} dragConstraints={dragConstraints} parentRef={layerRef} />
                    ))
                }
            </div>

        </div>
    )
}