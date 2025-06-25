import { useCallback } from "react";
import { Modal } from "flowbite-react";
import { useState } from "react";
import { useDropzone } from 'react-dropzone';
import DragDropFile from '@/Components/ConfigurationMap/DragDropFile';
import { MdOutlineFileUpload } from "react-icons/md";
import { StyledButton } from "../Commons/StyledBasedComponents";
import { domain } from "../Commons/Constants";
import { useLaravelReactI18n } from "laravel-react-i18n";
import Cookies from "js-cookie";

export default function ModalUploadPhoto({ open = true, closeCallback }) {
    const [file, setFile] = useState(null)
    const { t } = useLaravelReactI18n()

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

    const cancelCall = () => {
        setFile(null)
        closeCallback(false)
    }

    const saveCall = async () => {
        if (file === null) {
            alert("Insert photo")
        } else {
            let formData = new FormData();
            formData.append("profile", file)
            await fetch(domain + "/sanctum/csrf-cookie", {
                method: "GET",
                credentials: "include"
            });

            const csrfToken = decodeURIComponent(Cookies.get("XSRF-TOKEN"));
            const response = await fetch(`${domain}/api/user`, {
                method: 'POST',
                body: formData,
                credentials: "include",
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    "X-XSRF-TOKEN": csrfToken,
                }

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
            <Modal.Header>{t("Upload Profile Photo")}</Modal.Header>
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
                    {file &&
                        <div className="flex items-center justify-around p-2 mt-2">
                            <StyledButton onClick={cancelCall}>Cancel</StyledButton>
                            <StyledButton className="flex flex-row items-center" variant="secondary" onClick={saveCall}>
                                <MdOutlineFileUpload className="size-5" />
                                {t("Upload photo")}
                            </StyledButton>
                        </div>
                    }
                </div>

            </Modal.Body>
        </Modal>
    )
}