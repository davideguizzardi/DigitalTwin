import CardAppliance, { FULL } from "@/Components/ConfigurationMap/CardAppliance";
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
        setTimeout(() => {
            if (event.detail.droppable == listRef) {
                const newId = event.detail.id
                addAppl(event.detail.id)
            }
        }, 1)
    }

    const handleDragEndOut = (event) => {
        removeAppl(event.detail.id)
        setTimeout(() => {
            if (event.detail.droppable == listRef) {
                const newId = event.detail.id
                addAppl(event.detail.id)
            }
        }, 1)
    }

    useEffect(() => {
        subscribe(DRAG_START, handleDragStart)
        subscribe(DRAG_END, handleDragEnd)
        subscribe(DRAG_END_OUT, handleDragEndOut)
        return () => {
            unsubscribe(DRAG_START, () => { })
            unsubscribe(DRAG_END, () => { })
        }
    }, [appliances])
    return (
        <ul className="w-full h-full flex flex-col justify-start items-start overflow-y-scroll z-0"
            ref={listRef} id="list_appliance"
        >
            {
                appliances.map((e) => (
                    <CardAppliance key={e} id={e} type={FULL}
                        draggable={isEditMode} dragConstraints={dragConstraints} parentRef={listRef} />
                ))
            }
        </ul>
    )

}