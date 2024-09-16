import React from 'react';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {FaRegHeart, FaShieldHalved, FaMusic, FaBookOpen} from 'react-icons/fa6'

export default function SortableItem(props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: props.id});
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const icons = {"Health" : (<FaRegHeart/>),
    "Security": (<FaShieldHalved/>),
    "Entertainment": (<FaMusic/>),
    "Study": (<FaBookOpen/>)
  }
  
  return (
    <div className='w-full rounded shadow bg-lime-300 hover:bg-lime-400 hover:z-10'
     ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <div className="w-full items-center px-4 py-2 gap-2">
            {icons[props.id]}
            <h1>{props.id}</h1>
        </div>
    </div>
  );
}