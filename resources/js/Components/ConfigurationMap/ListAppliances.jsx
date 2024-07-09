import CardAppliance, { FULL } from "@/Components/ConfigurationMap/CardAppliance";
import { useEffect, useRef, useState } from "react"
import { DRAG_START, DRAG_END, DRAG_END_OUT, AVAILABLE_DROP, emit, subscribe, unsubscribe } from "@/Utils/events";

export default function ListAppliances({ appliances, dragConstraints, isEditMode = false }) {
    const [appl, setAppl] = useState([...appliances])
    const listRef = useRef()

    const handleDragStart = (event) => {
        emit(AVAILABLE_DROP, {
            id: listRef,
        })
    }

    const handleDragEnd = (event) => {
        let tempAppl = appl.filter(e => e != event.detail.id)
        setAppl([...tempAppl])
        setTimeout(() => {
            if (event.detail.droppable == listRef) {
                const newId = event.detail.id
                tempAppl = [...tempAppl, newId]
                setAppl([...tempAppl])
            }
        }, 1)
    }

    useEffect(() => {
        subscribe(DRAG_START, handleDragStart)
        subscribe(DRAG_END, handleDragEnd)
        subscribe(DRAG_END_OUT, handleDragEnd)
        return () => {
            unsubscribe(DRAG_START, () => { })
            unsubscribe(DRAG_END, () => { })
        }
    }, [appl])
    return (
        <ul className="w-full h-full flex flex-col justify-center items-start overflow-y-scroll"
            ref={listRef} id="list_appliance"
        >
            {
                appl.map((e) => (
                    <CardAppliance key={e} id={e} type={FULL}
                        draggable={isEditMode} dragConstraints={dragConstraints} parentRef={listRef} />
                ))
            }
        </ul>
    )

}