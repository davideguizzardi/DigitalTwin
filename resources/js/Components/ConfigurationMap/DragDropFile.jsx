import { useMemo } from "react";
import { CiImageOn } from "react-icons/ci";
import { StyledButton } from "../Commons/StyledBasedComponents";
import { useLaravelReactI18n } from "laravel-react-i18n";


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

export default function DragDropFile({getRootProps,
        getInputProps,
        isDragActive,
        isDragAccept,
        isDragReject}){

    const{t}=useLaravelReactI18n()

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

    return (
        <div className='h-96 w-full items-center flex flex-col gap-2' {...getRootProps({ style })}>

            <input {...getInputProps()} />
            <CiImageOn className="size-40 text-gray-600"/>
            <div className="text-2xl font-semibold text-gray-600">{t("Drag and drop your images here.")}</div>
            <div className="text-2xl text-gray-600">{t("or")}</div>
            <div className="text-xl bg-lime-400 rounded-lg p-2 text-gray-600 shadow-md">{t("Browse files")}</div>
        </div>
    );

}