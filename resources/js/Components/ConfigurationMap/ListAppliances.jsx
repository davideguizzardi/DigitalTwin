import CardDraggable,{ FULL } from "./CardDraggable";
import { useEffect, useRef, useState } from "react"
import { DRAG_START, DRAG_END, DRAG_END_OUT, AVAILABLE_DROP, emit, subscribe, unsubscribe } from "@/Utils/events";
import { useLaravelReactI18n } from "laravel-react-i18n";


export default function ListAppliances({ appliances, dragConstraints, isEditMode = false, addAppl, removeAppl }) {
    const listRef = useRef()
    const {t}=useLaravelReactI18n()

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
                    <CardDraggable id={e.device_id} key={e.device_id} name={e.name} category={e.category} type={FULL}
                        draggable={isEditMode} dragConstraints={dragConstraints} parentRef={listRef} />
                ))
                :
                <div className="h-full w-full flex items-center justify-center">
                    <h1 className="text-xl text-gray-600 dark:text-white">{t("No appliance")}</h1>
                </div>
            }
        </ul>
    )

}