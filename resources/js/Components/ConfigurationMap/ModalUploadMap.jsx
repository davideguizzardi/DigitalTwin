import { useCallback } from "react";
import { Modal } from "flowbite-react";
import { useState } from "react";
import { useDropzone } from 'react-dropzone';
import DragDropFile from '@/Components/ConfigurationMap/DragDropFile';
import { ThemeButton } from "../Commons/ThemeButton";
import { useLaravelReactI18n } from 'laravel-react-i18n';

export default function ModalUploadMap({ open, saveCallback, cancelCallback, indexUsed }) {
    const [floor, setFloor] = useState(0)
    const [file, setFile] = useState(null)
    const {t} = useLaravelReactI18n()

    const onDrop = useCallback(acceptedFiles => {
        const firstFile = acceptedFiles.at(0);
        setFile(Object.assign(firstFile, {
            preview: URL.createObjectURL(firstFile)
        }))
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

    const cancelCall = () =>{
        cancelCallback()
        setFile(null)
    }

    const saveCall = () => {
        console.log(indexUsed)
        if(file===null && floor===null){
            alert("Insert floor number and upload map")
        } else if(file===null){
            alert("Upload a map")
        }else if(indexUsed.includes(floor)){
            alert("Floor number already used")
        } else{
            saveCallback({file: file, floor: floor})
            setFile(null)
            setFloor(0)
        }
    }

    return (
        <Modal size="3xl" show={open} onClose={cancelCallback}>
            <Modal.Header>{t("Upload floor map")}</Modal.Header>
            <Modal.Body>
                <div className="flex flex-col h-3/6">
                    <div className="flex w-full h-fit pb-4 gap-2 justify-center items-center ">
                        <p className="dark:text-white">{t("Floor number")}</p>
                        <input type="number" defaultValue="0" min="-5" max="5" onChange={e => setFloor(e.target.value)}/>
                    </div>
                    <div className="flex justify-center">
                        {file ?
                            <img className='max-w-full max-h-96' src={file.preview} alt={file.name} />
                            :
                            <DragDropFile getRootProps={getRootProps} getInputProps={getInputProps}
                                isDragAccept={isDragAccept} isDragActive={isDragActive} isDragReject={isDragReject} />
                        }
                    </div>
                    <div className="flex items-center justify-around p-2 mt-2">
                        <ThemeButton onClick={cancelCall}>{t("Cancel")}</ThemeButton>
                        <ThemeButton onClick={saveCall}>{t("Add")}</ThemeButton>
                    </div>
                </div>

            </Modal.Body>
        </Modal>
    );
}