import { Button } from 'flowbite-react';
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { ThemeButton } from './ThemeButton';
import { FaPlus } from "react-icons/fa6";

const baseStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    color: '#bdbdbd',
    transition: 'border .3s ease-in-out'
};

const activeStyle = {
    borderColor: '#2196f3'
};

const acceptStyle = {
    borderColor: '#00e676'
};

const rejectStyle = {
    borderColor: '#ff1744'
};

let counter = 0;

export default function ConfigurationMap({ props }) {
    let [files, setFiles] = useState([]);
    let [listMap, setListMap] = useState([]);
    let [indexThumbs, setIndexThumbs] = useState(-1);
    const onDrop = useCallback(acceptedFiles => {
        const firstFile = acceptedFiles.at(0);
        setFiles([...files, Object.assign(firstFile, {
            preview: URL.createObjectURL(firstFile)
        })]);
        setListMap(listMap => [...listMap, acceptedFiles.at(0)]);
        counter++;
        setIndexThumbs(counter - 1);
    }, []);

    const { getRootProps,
        getInputProps,
        isDragActive,
        isDragAccept,
        isDragReject
    } = useDropzone({
        onDrop,
        accept: 'image/png, image/jpeg'
    })

    const style = useMemo(() => ({
        ...baseStyle,
        ...(isDragActive ? activeStyle : {}),
        ...(isDragAccept ? acceptStyle : {}),
        ...(isDragReject ? rejectStyle : {})
    }), [
        isDragActive,
        isDragReject,
        isDragAccept
    ]);


    const buttons = listMap.map((map, index) => (
        <ThemeButton className='size-min m-2' onClick={() => { setIndexThumbs(index);console.log(listMap);}}
            pill key={map.name}>{index}</ThemeButton>
    ));
    const dragAndDrop = (
        <div className='h-full' {...getRootProps({ style })}>
            <input {...getInputProps()} />
            <div>Drag and drop your images here.</div>
        </div>
    );
    const thumbs = listMap.map(file => (
        <div className='w-full justify-center' key={file.name}>
            <img className='max-w-full max-h-96 aspect-square'
                src={file.preview}
                alt={file.name}
            />
        </div>
    ));

    // clean up
    useEffect(() => {
        files.forEach(file => URL.revokeObjectURL(file.preview));
    }, [files, listMap, indexThumbs]);


    return (
        <div className="w-3/6 bg-white shadow items-center flex flex-col">
            <h1>Configure map house</h1>
            <div className="flex items-center w-full h-full p-3" >
                <div className="w-full h-full">
                    {indexThumbs < 0 ? dragAndDrop : thumbs.at(indexThumbs)}
                </div>
                <div className="flex flex-col justify-center w-min m-2 p-2 rounded-full bg-gray-100">
                    {buttons}
                    <ThemeButton className='size-min m-2' pill onClick={() => { setIndexThumbs(-1), console.log(indexThumbs) }} >
                        <FaPlus />
                    </ThemeButton>
                </div>
            </div>
        </div>
    );
}