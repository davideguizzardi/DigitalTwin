import React, { useCallback, useState, useEffect } from 'react';
import { StyledButton } from '../Commons/StyledBasedComponents';
import { FaTrashCan } from "react-icons/fa6";
import { Button } from 'flowbite-react';
import ModalUploadMap from './ModalUploadMap';
import AnimateMap from '../Commons/AnimateMap';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { getIcon } from '../Commons/Constants';
import { domain } from '../Commons/Constants';
import Cookies from 'js-cookie';


export default function UploadMap({ maps, endSection }) {
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
        await fetch(domain + "/sanctum/csrf-cookie", {
            method: "GET",
            credentials: "include"
        });
        const csrfToken = decodeURIComponent(Cookies.get("XSRF-TOKEN"));
        let formData = new FormData();
        listMap.forEach((el, i) => {
            formData.append(el.floor, el.file)
        })
        const apiRoute = route('map.store')
        const response = await fetch(apiRoute, {
            method: 'POST',
            credentials: "include",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
                "X-XSRF-TOKEN": csrfToken,
            },
            body: formData
        })
        endSection()
    }
    const submitButton = (
        <div className='absolute bottom-0 right-0 w-fit flex py-5 justify-end px-2'>
            <StyledButton className="size-min" onClick={submit} >{t("Next")}{getIcon("arrow_right")}</StyledButton>
        </div>
    );

    const buttons = listMap.map((map, index) => (
        <StyledButton className={`size-min  my-2 ${index == indexThumbs && "bg-lime-500"}`} onClick={() => { setIndexThumbs(index) }}
            pill key={map.file.name}><div className='text-lg'>{map.floor}</div></StyledButton>
    ));

    useEffect(() => {
        const uploadedMaps = maps.sort((m1, m2) => m1.floor > m2.floor)
            .map((m, index) => ({

                floor: m.floor,
                file: {
                    preview: domain + "/" + m.url,
                    name: m.url.split("/")[2]
                }
            }
            ))
        setListMap(uploadedMaps)
        setIndexThumbs(uploadedMaps.length - 1)
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
        <div className="w-full h-full items-center flex-col flex dark:text-white overflow-auto">
            <ModalUploadMap open={openModal} saveCallback={saveCallback}
                cancelCallback={cancelCallback} indexUsed={listMap.map(m => m.floor)} />
            <form name="maps" className='relative h-full w-full flex flex-row justify-center items-center' onSubmit={submit}>

                <div className="flex h-full items-center justify-center w-2/3" >
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
                        <StyledButton className='absolute text-2xl' size="xl" onClick={() => { setOpenModal(true) }}>
                            <div className='flex flex-row items-center'>
                                {getIcon("upload", "size-7")}
                                {t("Load house map")}
                            </div>
                        </StyledButton>
                    }
                    {indexThumbs >= 0 &&
                        <div className="flex flex-col justify-center items-center w-min m-2 p-1 rounded-full bg-gray-100 dark:bg-neutral-700 shadow">
                            {buttons}
                            <StyledButton className='size-12 rounded-full items-center' pill onClick={() => { setOpenModal(true) }} >
                                {getIcon("plus")}
                            </StyledButton>
                        </div>
                    }
                </div>
                {listMap.length > 0 ? submitButton : (<div></div>)}
            </form>
        </div>
    );
}