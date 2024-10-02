import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaRegHeart, FaShieldHalved, FaMusic, FaBookOpen } from 'react-icons/fa6'

export default function SortableItem(props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const icons = {
    "Health": (<FaRegHeart size={36} />),
    "Security": (<FaShieldHalved size={36} />),
    "Entertainment": (<FaMusic size={36} />),
    "Study": (<FaBookOpen size={36} />)
  }

  return (
    <div className='flex rounded h-full shadow hover:z-11 px-5 py-2 text-xl justify-center items-center gap-2'
      ref={setNodeRef} style={{...style, backgroundColor: props.color}} {...attributes} {...listeners} >
      {icons[props.id]}
      <h1>{props.id}</h1>
    </div>
  );
}