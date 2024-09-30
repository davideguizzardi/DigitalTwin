import CardDraggable, { FULL } from "@/Components/ConfigurationMap/CardDraggable";
import { useEffect, useRef, useState } from "react"
import { DRAG_START, DRAG_END, DRAG_END_OUT, AVAILABLE_DROP, emit, subscribe, unsubscribe } from "@/Utils/events";

export default function ListAppliances({ appliances, dragConstraints, isEditMode = false, addAppl, removeAppl }) {
    const listRef = useRef()

    const handleDragStart = (event) => {
        emit(AVAILABLE_DROP, {
            id: listRef,
        })
    }

    const handleDragEnd = (event) => {
        removeAppl(event.detail.id)
        if (event.detail.droppable === listRef
        ) {
            setTimeout(() => {
                addAppl(event.detail.id)
            }, 10)
        }
    }

    const handleDragEndOut = (event) => {
        removeAppl(event.detail.id)
        if (event.detail.droppable === listRef) {
            setTimeout(() => {
                addAppl(event.detail.id)
            }, 100)
        }
    }
    useEffect(() => {
        subscribe(DRAG_START, handleDragStart)
        subscribe(DRAG_END, handleDragEnd)
        subscribe(DRAG_END_OUT, handleDragEndOut)
        return () => {
            unsubscribe(DRAG_START, () => { })
            unsubscribe(DRAG_END, () => { })
            unsubscribe(DRAG_END_OUT, () => { })
        }
    }, [])

    return (
        <ul className="w-full h-full flex flex-col justify-start items-start overflow-y-scroll shadow z-0 gap-1 p-1"
            ref={listRef} id="list_appliance"
        >
            {appliances.length > 0 ?
                appliances.map((e) => (
                    <CardDraggable key={e} id={e} type={FULL}
                        draggable={isEditMode} dragConstraints={dragConstraints} parentRef={listRef} />
                ))
                :
                <div className="h-full w-full flex items-center justify-center">
                    <h1 className="text-xl text-gray-600 dark:text-white">No appliance</h1>
                </div>
            }
        </ul>
    )

}