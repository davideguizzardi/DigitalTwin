import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { restrictToHorizontalAxis, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
    arrayMove,
    horizontalListSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useEffect, useState } from 'react';
import SortableItem from './SortableItem';
import { useContext } from 'react';
import { UserContext } from '@/Layouts/UserLayout';

export default function Preferences({ }) {
    const user = useContext(UserContext)
    const [items, setItems] = useState([])
    
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
            setItems(updateState)
        }
    }

    const fetchItems = async () => {
        if(!user.username) return null 
        const response = await fetch("http://localhost:8000/user/preferences")
        if (response.ok) {
            const result = await response.json()
            console.log(result)
            const updatePreferences = result.filter(e => e.user_id == user.username)[0].preferences
            console.log(updatePreferences)
            setItems(updatePreferences)
        } else {
            console.log(response.statusText)
        }
    }
    
    useEffect(()=>{
        fetchItems()
        return () =>{}
    }, [user])

    return (
        <div className="flex flex-col size-full px-2 py-4 gap-3">
            <h1 className="text-2xl py-2 dark:text-white">Preferences</h1>
            <p className='dark:text-white'>Arrange the cards in order of importance, from the most important to the least important.  
                <span className='font-bold'> Drag</span> each card by clicking and holding it, then <span className='font-bold'>drop</span> it into the position
                you believe is correct. Continue adjusting the cards until all are in the proper order.</p>
            <div className="flex flex-col h-full justify-center gap-2 size-full">
                <h1 className='dark:text-white text-xl'>Most important</h1>
                <div className="flex size-full gap-3 p-1">
                    <div className="flex flex-col px-2 bg-gradient-to-b from-lime-200 to-lime-800 rounded"></div>
                    <div className="flex flex-col gap-2 size-full">

                        <DndContext onDragEnd={handleDragEnd} sensors={sensors}
                            collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]}
                        >
                            <SortableContext items={items}
                                strategy={verticalListSortingStrategy}
                            >
                                {items.map(id => <SortableItem key={id} id={id} />)}

                            </SortableContext>
                        </DndContext>
                    </div>
                </div>
                <h1 className='dark:text-white text-xl'>Less important</h1>
            </div>
        </div>
    )
}