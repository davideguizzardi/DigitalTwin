import React, { useCallback, useState, useEffect } from 'react';
import { ThemeButton } from '@/Components/Commons/ThemeButton';
import { FaTrashCan } from "react-icons/fa6";
import { Button } from 'flowbite-react';
import ModalUploadMap from './ModalUploadMap';
import Cookies from 'js-cookie';
import AnimateMap from '../Commons/AnimateMap';
import WhiteCard from '../Commons/WhiteCard';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { getIcon } from '../Commons/Constants';
import { domain } from '../Commons/Constants';

let counter = -1;
const token = Cookies.get("auth-token")

export default function UploadMap({maps, endSection }) {
    const [listMap, setListMap] = useState([]);
    const [indexThumbs, setIndexThumbs] = useState(-1);
    const [openModal, setOpenModal] = useState(false)
    const { t } = useLaravelReactI18n()

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
        <div className='absolute right-0 bottom-0 w-fit flex py-5 justify-end px-2'>
            <ThemeButton className="size-min" onClick={submit} >{t("Next")}{getIcon("arrow_right")}</ThemeButton>
        </div>
    );

    const buttons = listMap.map((map, index) => (
        <ThemeButton className={`size-min  my-2 ${index==indexThumbs && "bg-lime-500"}`} onClick={() => { setIndexThumbs(index) }}
            pill key={map.file.name}><div className='text-lg'>{map.floor}</div></ThemeButton>
    ));

    useEffect(() => {
        const uploadedMaps=maps.sort((m1,m2)=>m1.floor>m2.floor)
        .map((m, index) => ({
            
            floor: m.floor,
            file: {
              preview: domain+"/"+m.url,
              name: m.url.split("/")[2]  // Extract the name from the URL
            }
          }
    ))
        setListMap(uploadedMaps)
        setIndexThumbs(uploadedMaps.length-1)
    }, [maps]);

    // clean up
    useEffect(() => {
        listMap.forEach(file => URL.revokeObjectURL(file.preview));
    }, [listMap]);

    const handleDeleteButton = () => {
        const updateState = listMap.filter(m => m.file.name !== listMap[indexThumbs].file.name)
        setListMap(updateState)
        console.log(updateState)
        setIndexThumbs(indexThumbs - 1)
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
        <div className="w-full h-full items-center flex-col flex dark:text-white">

            <ModalUploadMap open={openModal} saveCallback={saveCallback}
                cancelCallback={cancelCallback} indexUsed={listMap.map(m => m.floor)} />
            <p className='h-min w-full p-2 text-start text-2xl'>{t("Upload map house")}</p>
            <form name="maps" className='relative h-full w-full flex flex-row justify-center items-center ' onSubmit={submit}>

                <div className="flex size-full items-center justify-center w-2/3" >
                    {indexThumbs >= 0 ?
                        <div className='w-full'>
                            <div className="w-full h-fit py-1 flex items-center self-start">
                                <Button className='bg-red-500 dark:bg-red-500  enabled:hover:bg-red-700 mx-2' pill
                                    onClick={handleDeleteButton}>
                                    <FaTrashCan className='size-4' color='white' />
                                </Button>
                                <p className="text-xl">{t("Floor number")} {listMap[indexThumbs].floor}</p>
                            </div>
                            <AnimateMap map={listMap[indexThumbs].file.preview} />
                        </div>
                        :
                        <div className="size-full flex items-center justify-center">
                            <p className='pl-16'>{t("No map uploaded")}</p>
                        </div>
                    }
                    <div className="flex flex-col justify-center items-center w-min m-2 p-1 rounded-full bg-gray-100 dark:bg-neutral-700 shadow">
                        {indexThumbs >= 0 &&
                            buttons
                        }
                        <ThemeButton className='my-2 size-fit' pill onClick={() => { setOpenModal(true) }} >
                            {getIcon("plus")}
                        </ThemeButton>
                    </div>
                </div>
                {listMap.length > 0 ? submitButton : (<div></div>)}
            </form>
        </div>
    );
}