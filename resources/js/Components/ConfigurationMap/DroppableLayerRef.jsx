import { AVAILABLE_DROP, DRAG_END, DRAG_END_OUT, DRAG_START, subscribe, unsubscribe } from "@/Utils/events"
import { useCallback, useEffect, useRef, useState } from "react"
import { emit } from "@/Utils/events"
import CardDraggable, { ICON } from "@/Components/ConfigurationMap/CardDraggable"
import CardDraggableRef from "./CardDraggableRef"
import { useContext } from "react"

import { DeviceContext } from "../ContextProviders/DeviceProvider"


export default function DroppableLayerRef({ isEditMode, listAppliancesPos, dragConstraints, index, addAppl, removeAppl }) {
    const layerRef = useRef()
    const refIndex = useRef()
    refIndex.current = index
    const { deviceList } = useContext(DeviceContext);

    const handleDragEnd = useCallback((event) => {
        removeAppl(event.detail.id)
        setTimeout(() => {
            if (event.detail.droppable == layerRef) {
                const cardRect = event.detail.rect
                const layerRect = layerRef.current.getBoundingClientRect()
                const absTop = cardRect.top - layerRect.top
                const absLeft = cardRect.left - layerRect.left
                const relTop = absTop * 100 / layerRect.height
                const relLeft = absLeft * 100 / layerRect.width
                const applOnFloor = { id: event.detail.id, top: Math.round(relTop), left: Math.round(relLeft), floor: refIndex.current }
                addAppl(applOnFloor)
            }
        }, 1)
    }, [])

    const handleDragEndOut = useCallback((event) => {
        if (event.detail.droppable == layerRef) {
            removeAppl(event.detail.id)
            const cardRect = event.detail.rect
            const layerRect = layerRef.current.getBoundingClientRect()
            const absTop = cardRect.top - layerRect.top
            const absLeft = cardRect.left - layerRect.left
            const relTop = absTop * 100 / layerRect.height
            const relLeft = absLeft * 100 / layerRect.width
            const applOnFloor = { id: event.detail.id, top: Math.round(relTop), left: Math.round(relLeft), floor: refIndex.current }
            setTimeout(() => {
                addAppl(applOnFloor)
            }, 1)
        }
    }, [])

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
    }, [])



    return (
        <div className={' bg-blue-100 absolute top-0 left-0 size-full z-10 ' + (isEditMode ? ' bg-opacity-50 ' : ' bg-opacity-0 ')}
            ref={layerRef} id="droppable_layer"
        >
            <div className="size-full absolute relative">
                {
                    listAppliancesPos.filter(element => element.floor == index).map((e) => (
                        <CardDraggableRef key={e.device_id} id={e.device_id} name={e.name} category={e.category} type={ICON} style={{ position: "absolute", left: e.left + "%", top: e.top + "%" }}
                            draggable={isEditMode} dragConstraints={dragConstraints} parentRef={layerRef} />
                    ))
                }
            </div>

        </div>
    )
}