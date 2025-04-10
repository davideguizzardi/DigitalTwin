import { UserContext } from "@/Layouts/UserLayout";
import { useContext } from "react";
import { FaLock, FaCamera, FaUser, FaPencil } from "react-icons/fa6"
import { IconContext } from "react-icons";
import Preferences from "./Preferences";
import { useState } from "react";
import ModalChangePassword from "./ModalChangePassword";
import ModalUploadPhoto from "./ModalUploadPhoto";
import WhiteCard from "../Commons/WhiteCard";
import { EcologicalFootprint } from "../Commons/EcologicalFootprint";
import { useLaravelReactI18n } from 'laravel-react-i18n';

export default function Profile({ }) {
    const user = useContext(UserContext)

    const darkMode = localStorage.getItem("darkMode") == "true"
    const [visiblePassword, isVisiblePassword] = useState(false)
    const [visiblePhoto, isVisiblePhoto] = useState(false)
    const {t} = useLaravelReactI18n()

    const closePasswordCallback = () => {
        isVisiblePassword(false)
    }

    const closePhotoCallback = () => {
        isVisiblePhoto(false)
    }

    return (
        <div className="flex size-full">
            {visiblePassword && <ModalChangePassword closeCallback={closePasswordCallback} />}
            {visiblePhoto && <ModalUploadPhoto closeCallback={closePhotoCallback} />}
            <div className="flex flex-col w-1/2 gap-4">
                <div className="flex p-2 gap-4 border-0 ">
                    <div className="relative flex h-min items-center justify-center bg-gray-300 dark:bg-neutral-700 rounded-full" style={{ width: "20%" }}
                        onClick={() => { isVisiblePhoto(true) }}
                    >
                        {user.url_photo != null && user.url_photo != undefined && user.url_photo != "" ?
                            <img className="rounded-full p-3 2xl:p-5 aspect-square" src={user.url_photo}/>
                            :
                            <IconContext.Provider value={{ color: (darkMode ? "white" : "black"), size: 150 }}>
                                <FaUser className="rounded-full p-5" />
                            </IconContext.Provider>
                        }
                        <div className="absolute top-0 2xl:top-3 right-0 2xl:right-3 p-2 2xl:p-3 rounded-full border border-neutral-600 z-100 bg-lime-400"
                            style={{ cursor: "pointer" }}
                        >
                            <FaPencil size={24} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="text-2xl px-2 pt-5 dark:text-white w-full">
                            {user.username}
                        </div>
                        <div className="text-2xl px-2 dark:text-white w-full">
                            {user.email}
                        </div>
                        <div className="w-full">
                            <div className="text-2xl flex items-center w-fit rounded px-2 bg-lime-400 py-2 gap-2"
                                style={{ cursor: "pointer" }}
                                onClick={() => { isVisiblePassword(true) }}
                            >
                                <FaLock />
                                <span>{t("Change Password")}</span>
                            </div>
                        </div>
                    </div>
                </div>
                    <div className="flex flex-col h-full justify-center items-center border-0">
                        <div>
                            <EcologicalFootprint energyConsumptionIn={86} home={false} />
                        </div>
                    </div>
            </div>
            <div className="flex h-full w-1/2">
                <div className="h-full border-0">
                    <Preferences />
                </div>
            </div>
        </div>
    )
}