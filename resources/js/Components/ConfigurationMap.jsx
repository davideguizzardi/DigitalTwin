import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { ThemeButton } from './ThemeButton';
import { FaPlus, FaTrashCan} from "react-icons/fa6";
import { Button } from 'flowbite-react';

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
        setListMap(listMap => [...listMap, firstFile]);
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
        <ThemeButton className='size-min mx-px my-2' onClick={() => { setIndexThumbs(index);console.log(listMap);}}
            pill key={map.name}>{index}</ThemeButton>
    ));
    const dragAndDrop = (
        <div className='h-full' {...getRootProps({ style })}>
            <input {...getInputProps()} />
            <div>Drag and drop your images here.</div>
        </div>
    );
    const thumbs = listMap.map(file => (
        <div className='relative size-full flex items-center justify-center' key={file.name}>
            <Button className='absolute right-0 top-0 bg-red-500 enabled:hover:bg-red-700' pill
                onClick={() => {
                    setListMap(listMap.filter(f => f.name !== file.name));
                    setIndexThumbs(counter--);
                }}>
                <FaTrashCan className='size-4' color='white'/>
            </Button>
            <img className='max-w-full max-h-96'
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
        <div className="w-3/6 bg-white shadow items-center flex flex-col justify-around">
            <p className='text-2xl'>Configure map house</p>
            <div className="flex items-center w-full p-3" >
                <div className="w-full h-96">
                    {indexThumbs < 0 ? dragAndDrop : thumbs.at(indexThumbs)}
                </div>
                <div className="flex flex-col justify-center w-min m-2 p-1 rounded-full bg-gray-100 shadow">
                    {buttons}
                    <ThemeButton className='size-min mx-px my-2' pill onClick={() => { setIndexThumbs(-1), console.log(indexThumbs) }} >
                        <FaPlus />
                    </ThemeButton>
                </div>
            </div>
            <ThemeButton>
                Upload
            </ThemeButton>
        </div>
    );
}