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
import { useLaravelReactI18n } from 'laravel-react-i18n';

export default function Preferences({ }) {
    const user = useContext(UserContext)
    const [items, setItems] = useState([])
    const colors = ["#d9f99d", "#bef264", "#84cc16", "#4d7c0f"]
    
    const {t} = useLaravelReactI18n()

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
        if (!user.username) return null
        const response = await fetch("http://localhost:8000/user/preferences")
        if (response.ok) {
            const result = await response.json()
            console.log(result)
            const filterResult = result.filter(e => e.user_id == user.username)
            if (filterResult.lenght > 0) {
                const updatePreferences = filterResult[0].preferences
                setItems(updatePreferences)
            }
            else
                setItems(["Health", "Security", "Entertainment", "Study"])
        } else {
            setItems(["Health", "Security", "Entertainment", "Study"])
        }
    }

    useEffect(() => {
        fetchItems()
        return () => { }
    }, [user])

    return (
        <div className="flex flex-col h-full p-2 gap-1">
            <h1 className="text-2xl dark:text-white">{t("Preferences")}</h1>
            <p className='dark:text-white'>{t("Arrange the cards in order of importance, from the most important to the least important. Drag each card by clicking and holding it, then drop it into the position you believe is correct. Continue adjusting the cards until all are in the proper order.")}</p>
            <div className="flex flex-col h-full justify-center items-center gap-1">
                <h1 className='dark:text-white text-xl'>{t("Most important")}</h1>
                <div className="flex w-full h-3/4 justify-center gap-2 p-1">
                    <div className="flex flex-col px-2 bg-gradient-to-b from-lime-100 to-lime-900 rounded"></div>
                    <div className="flex flex-col gap-2 h-full">

                        <DndContext onDragEnd={handleDragEnd} sensors={sensors}
                            collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]}
                        >
                            <SortableContext items={items}
                                strategy={verticalListSortingStrategy}
                            >
                                {items.map((id, index) => <SortableItem key={id} id={id} color={colors[index]} />)}

                            </SortableContext>
                        </DndContext>
                    </div>
                </div>
                <h1 className='dark:text-white text-xl'>{t("Less important")}</h1>
            </div>
        </div>
    )
}