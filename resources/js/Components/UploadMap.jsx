import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { ThemeButton } from './ThemeButton';
import { FaPlus, FaTrashCan } from "react-icons/fa6";
import { Button } from 'flowbite-react';
import { router } from '@inertiajs/react';
import DragDropFile from './DragDropFile';

let counter = -1;

export default function UploadMap({ props }) {
    let [listMap, setListMap] = useState([]);
    let [indexThumbs, setIndexThumbs] = useState(-1);

    const onDrop = useCallback(acceptedFiles => {
        const firstFile = acceptedFiles.at(0);
        setListMap(listMap => [...listMap, Object.assign(firstFile,{
            preview: URL.createObjectURL(firstFile)
        })]);
        counter++;
        setIndexThumbs(counter);
    }, []);

    const { getRootProps,
        getInputProps,
        isDragActive,
        isDragAccept,
        isDragReject
    } = useDropzone({
        onDrop,
        accept: 'image/*'
    })

    const buttons = listMap.map((map, index) => (
        <ThemeButton className='size-min mx-px my-2' onClick={() => { setIndexThumbs(index); console.log(listMap); }}
            pill key={map.name}>{index}</ThemeButton>
    ));

    const thumbs = listMap.map(file => (
        <div className='relative size-full flex items-center justify-center' key={file.name}>
            <Button className='absolute right-0 top-0 bg-red-500 enabled:hover:bg-red-700' pill
                onClick={() => {
                    setListMap(listMap.filter(f => f.name !== file.name));
                    counter = counter - 1;
                    console.log("counter " + counter)
                    setIndexThumbs(counter - 1);
                }}>
                <FaTrashCan className='size-4' color='white' />
            </Button>
            <img className='max-w-full max-h-96'
                src={file.preview}
                alt={file.name}
            />
        </div>
    ));

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

    // clean up
    useEffect(() => {
        listMap.forEach(file => URL.revokeObjectURL(file.preview));
    }, [listMap]);


    return (
        <div className="w-full lg:w-3/5 h-full items-center flex flex-col ">
            <p className='h-min w-full p-4 text-center text-2xl'>Upload map house</p>
            <form name="maps" className='h-full w-full flex flex-col justify-center py-2' onSubmit={submit}>
                <div className="flex items-center w-full px-3 py-5" >
                    <div className="w-full h-96">
                        {indexThumbs >= 0 ? thumbs.at(indexThumbs) : 
                        <DragDropFile getRootProps={getRootProps} getInputProps={getInputProps}
                        isDragAccept={isDragAccept} isDragActive={isDragActive} isDragReject={isDragReject}/> }

                    </div>
                    <div className="flex flex-col justify-center w-min m-2 p-1 rounded-full bg-gray-100 shadow">
                        {buttons}
                        <ThemeButton className='size-min mx-px my-2' pill onClick={() => { setIndexThumbs(-1) }} >
                            <FaPlus />
                        </ThemeButton>
                    </div>
                </div>
                {listMap.length > 0 ? submitButton : (<div></div>)}
            </form>
        </div>
    );
}