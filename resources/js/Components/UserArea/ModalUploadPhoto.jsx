import { useCallback } from "react";
import { Modal } from "flowbite-react";
import { useState } from "react";
import { useDropzone } from 'react-dropzone';
import DragDropFile from '@/Components/ConfigurationMap/DragDropFile';
import { ThemeButton } from "@/Components/Commons/ThemeButton";
import Cookies from "js-cookie";

export default function ModalUploadPhoto({ open=true, closeCallback}) {
    const [file, setFile] = useState(null)

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
        setFile(null)
        closeCallback(false)
    }

    const saveCall = async () => {
        if(file===null ){
            alert("Insert photo")
        }else{
            let formData = new FormData();
            formData.append("profile", file)
            const token = Cookies.get("auth-token")
            const response = await fetch("http://localhost/api/user", {
                method: 'POST',
                body: formData,
                headers: {'Authorization': "Bearer " + token }

            })
            const result = await response.json()
            console.log(result)
            setFile(null)
            closeCallback(true)
            window.location.reload(true)
        }
    }

    return (
        <Modal size="3xl" show={open} onClose={cancelCall}>
            <Modal.Header>Upload Profile Photo</Modal.Header>
            <Modal.Body>
                <div className="flex flex-col h-3/6">
                    <div className="flex justify-center">
                        {file ?
                            <img className='max-w-full max-h-96' src={file.preview} alt={file.name} />
                            :
                            <DragDropFile getRootProps={getRootProps} getInputProps={getInputProps}
                                isDragAccept={isDragAccept} isDragActive={isDragActive} isDragReject={isDragReject} />
                        }
                    </div>
                    <div className="flex items-center justify-around p-2 mt-2">
                        <ThemeButton onClick={cancelCall}>Cancel</ThemeButton>
                        <ThemeButton onClick={saveCall}>Add</ThemeButton>
                    </div>
                </div>

            </Modal.Body>
        </Modal>
    )
}