import CardAppliance from "./CardAppliance";
import { useRef, useState } from "react"

export default function ListAppliances({ appliance, dragConstraints, isEditMode = false }) {
    const listRef = useRef()
    return (
        <ul className="w-full flex flex-col justify-center items-start"
            ref={listRef}
            onDragEnter={(event) => {
                event.stopPropagation();
                event.preventDefault();
                //console.log(event)
            }}
            onDragLeave={(event) => {
                //console.log(event)
                event.preventDefault();
            }}
            onDragOver={(event) => {
                event.stopPropagation();
                event.preventDefault();
                //console.log(event)
            }}
            onDrop={(event) => {
                event.stopPropagation();
                event.preventDefault();
                //console.log(event)
            }}
        >
            {
                appliance.map((e, i) => (
                    <CardAppliance key={"card_" + i} text={"appliance_" + i} 
                    draggable={isEditMode} dragConstraints={dragConstraints} />
                ))
            }
        </ul>
    )

}