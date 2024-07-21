import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { ThemeButton } from '@/Components/Commons/ThemeButton';
import { FaPlus, FaTrashCan } from "react-icons/fa6";
import { Button, Label, TextInput } from 'flowbite-react';
import { router } from '@inertiajs/react';
import ModalUploadMap from './ModalUploadMap';

let counter = -1;

export default function UploadMap({ props }) {
    const [listMap, setListMap] = useState([]);
    const [indexThumbs, setIndexThumbs] = useState(-1);
    const [openModal, setOpenModal] = useState(false)

    const saveCallback = useCallback((newFile) => {
        let tempList = [...listMap, newFile]
        tempList.sort((a,b) => b.floor - a.floor)
        const newIndex = tempList.indexOf(newFile)
        console.log(tempList)
        setListMap([...tempList])
        setOpenModal(false)
        console.log(newIndex)
        setIndexThumbs(newIndex )
    }, [listMap])    

    const cancelCallback = () => {setOpenModal(false)}

    const submit = () => {
        const formData = new FormData();
        formData.append('maps', listMap);
        router.post(route('map.store'), listMap);
    }
    const submitButton = (
        <div className='w-full flex py-5 justify-center'>
            <ThemeButton className="size-min" onClick={submit} >Upload</ThemeButton>
        </div>
    );
    const buttons = listMap.map((map, index) => (
        <ThemeButton className='size-min  my-2' onClick={() => { setIndexThumbs(index) }}
            pill key={map.file.name}>{map.floor}</ThemeButton>
    ));

    // clean up
    useEffect(() => {
        listMap.forEach(file => URL.revokeObjectURL(file.preview));
    }, [listMap]);
    
    const thumbs = listMap.map((map, index) => (
        <div className='size-full columns-1 items-center justify-center' key={map.file.name}>
            <div className="w-full h-fit py-1 flex items-center self-start">
                <Button className='bg-red-500 enabled:hover:bg-red-700 mx-2' pill
                    onClick={() => {
                        setListMap(listMap.filter(m => m.file.name !== map.file.name));
                        setIndexThumbs(indexThumbs > 0 ? indexThumbs-1 : 0);
                    }}>
                    <FaTrashCan className='size-4' color='white' />
                </Button>
                <p className="text-xl">Floor number {map.floor}</p>
            </div>
            <div className="size-full flex justify-center items-center">
                <img className='max-w-full max-h-96'
                    src={map.file.preview}
                    alt={map.file.name}
                />
            </div>
        </div>
    ));

    return (
        <div className="w-full lg:w-3/5 h-full items-center flex flex-col ">
            <ModalUploadMap open={openModal} saveCallback={saveCallback}
            cancelCallback={cancelCallback} indexUsed={listMap.map(m => m.floor)}/>
            <p className='h-min w-full p-4 text-center text-2xl'>Upload map house</p>
            <form name="maps" className='h-full w-full flex flex-col justify-center py-2' onSubmit={submit}>
                <div className="flex items-center w-full h-full px-3 py-5" >
                    <div className="w-full h-full">
                        {indexThumbs >= 0  ?
                            thumbs[indexThumbs] :
                            <div className="size-full flex items-center justify-center">
                                <p>No maps uploaded</p>
                            </div>
                        }
                    </div>
                    <div className="flex flex-col justify-center items-center w-min m-2 p-1 rounded-full bg-gray-100 shadow">
                        { indexThumbs >= 0 &&
                            buttons
                        }
                        <ThemeButton className='size-min mx-px my-2' pill onClick={() => { setOpenModal(true) }} >
                        <span className='text-lg'>+</span>
                        </ThemeButton>
                    </div>
                </div>
                {listMap.length > 0 ? submitButton : (<div></div>)}
            </form>
        </div>
    );
}