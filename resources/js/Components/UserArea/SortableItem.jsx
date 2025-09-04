import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaRegHeart, FaShieldHalved, FaMusic, FaBookOpen } from 'react-icons/fa6'
import { useLaravelReactI18n } from 'laravel-react-i18n';

export default function SortableItem(props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.id });
    const {t} = useLaravelReactI18n()

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const icons = {
    "Health": (<FaRegHeart size={30} />),
    "Security": (<FaShieldHalved size={30} />),
    "Entertainment": (<FaMusic size={30} />),
    "Study": (<FaBookOpen size={30} />)
  }

  return (
    <div className='flex rounded h-full shadow hover:z-11 px-10 md:px-20 py-4 text-xl justify-start items-center gap-2'
      ref={setNodeRef} style={{...style, backgroundColor: props.color}} {...attributes} {...listeners} >
      {icons[props.id]}
      <h1>{t(props.id)}</h1>
    </div>
  );
}