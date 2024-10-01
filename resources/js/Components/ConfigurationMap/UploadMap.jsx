import React, { useCallback, useState, useEffect } from 'react';
import { ThemeButton } from '@/Components/Commons/ThemeButton';
import { FaTrashCan } from "react-icons/fa6";
import { Button } from 'flowbite-react';
import ModalUploadMap from './ModalUploadMap';
import Cookies from 'js-cookie';
import AnimateMap from '../Commons/AnimateMap';
import WhiteCard from '../Commons/WhiteCard';

let counter = -1;
const token = Cookies.get("auth-token")

export default function UploadMap({ endSection }) {
    const [listMap, setListMap] = useState([]);
    const [indexThumbs, setIndexThumbs] = useState(-1);
    const [openModal, setOpenModal] = useState(false)

    const saveCallback = useCallback((newFile) => {
        let tempList = [...listMap, newFile]
        tempList.sort((a, b) => b.floor - a.floor)
        const newIndex = tempList.indexOf(newFile)
        console.log(tempList)
        setListMap([...tempList])
        setOpenModal(false)
        console.log(newIndex)
        setIndexThumbs(newIndex)
    }, [listMap])

    const cancelCallback = () => { setOpenModal(false) }

    const submit = async () => {
        const apiRoute = route('map.store')
        let formData = new FormData();
        listMap.forEach((el, i) => {
            formData.append(el.floor, el.file)
        })
        const response = await fetch(apiRoute, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            body: formData
        })
        endSection()
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

    const handleDeleteButton = () =>{
        const updateState =listMap.filter(m=>m.file.name !== listMap[indexThumbs].file.name)
        setListMap(updateState)
        console.log(updateState)
        setIndexThumbs(indexThumbs -1)
        console.log(indexThumbs)
    }

    const thumbs = listMap.map((map, index) => (
        <div className='size-full items-around justify-center' key={map.file.name}>
            <div className="w-full h-fit py-1 flex items-center self-start">
                <Button className='bg-red-500 enabled:hover:bg-red-700 mx-2' pill
                    onClick={() => {
                        setListMap(listMap.filter(m => m.file.name !== map.file.name));
                        setIndexThumbs(indexThumbs > 0 ? indexThumbs - 1 : 0);
                    }}>
                    <FaTrashCan className='size-4' color='white' />
                </Button>
                <p className="text-xl">Floor number {map.floor}</p>
            </div>
            <div className="size-full flex justify-center items-center">
                <img className='w-full'
                    src={map.file.preview}
                    alt={map.file.name}
                />
            </div>
        </div>
    ));

    return (
        <WhiteCard className="w-full lg:w-3/5 h-full items-center justify-around flex-col dark:text-white">

            <ModalUploadMap open={openModal} saveCallback={saveCallback}
                cancelCallback={cancelCallback} indexUsed={listMap.map(m => m.floor)} />
            <p className='h-min w-full p-2 text-center text-2xl'>Upload map house</p>
            <form name="maps" className='h-full w-full flex flex-col justify-around items-center' onSubmit={submit}>
                <div className="flex items-center size-full items-center justify-center" >
                    {indexThumbs >= 0 ?
                        <div>
                            <div className="w-full h-fit py-1 flex items-center self-start">
                                <Button className='bg-red-500 enabled:hover:bg-red-700 dark:bg-red-500  enabled:hover:bg-red-700 mx-2' pill
                                    onClick={handleDeleteButton}>
                                    <FaTrashCan className='size-4' color='white' />
                                </Button>
                                <p className="text-xl">Floor number {listMap[indexThumbs].floor}</p>
                            </div>
                            <AnimateMap map={listMap[indexThumbs].file.preview} />
                        </div>
                        :
                        <div className="size-full flex items-center justify-center">
                            <p className='pl-16'>No maps uploaded</p>
                        </div>
                    }
                    <div className="flex flex-col justify-center items-center w-min m-2 p-1 rounded-full bg-gray-100 dark:bg-neutral-700 shadow">
                        {indexThumbs >= 0 &&
                            buttons
                        }
                        <ThemeButton className='size-min mx-px my-2' pill onClick={() => { setOpenModal(true) }} >
                            <span className='text-lg'>+</span>
                        </ThemeButton>
                    </div>
                </div>
                {listMap.length > 0 ? submitButton : (<div></div>)}
            </form>
        </WhiteCard>
    );
}