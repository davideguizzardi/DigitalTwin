import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {restrictToHorizontalAxis} from '@dnd-kit/modifiers'
import {
    arrayMove,
    horizontalListSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useEffect, useState } from 'react';
import SortableItem from './SortableItem';

export default function Preferences({items, saveCallback}) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = items.indexOf(active.id)
            const newIndex = items.indexOf(over.id)
            const updateState = arrayMove(items, oldIndex, newIndex)
            saveCallback(updateState)
        }
    }
    return (
        <div className="flex gap-2">

            <DndContext onDragEnd={handleDragEnd} sensors={sensors}
                collisionDetection={closestCenter} modifiers={[restrictToHorizontalAxis]}
            >
                <SortableContext items={items}
                    strategy={horizontalListSortingStrategy}
                >
                    {items.map(id => <SortableItem key={id} id={id} />)}

                </SortableContext>
            </DndContext>
        </div>
    )
}