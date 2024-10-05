import { UserContext } from "@/Layouts/UserLayout";
import { useContext } from "react";
import { FaLock, FaCamera, FaUser } from "react-icons/fa6"
import { IconContext } from "react-icons";
import Preferences from "./Preferences";
import { useState } from "react";
import ModalChangePassword from "./ModalChangePassword";
import ModalUploadPhoto from "./ModalUploadPhoto";
import WhiteCard from "../Commons/WhiteCard";
import { EcologicalFootprint } from "../Commons/EcologicalFootprint";

export default function Profile({ }) {
    const user = useContext(UserContext)

    const darkMode = localStorage.getItem("darkMode") == "true"
    const [visiblePassword, isVisiblePassword] = useState(false)
    const [visiblePhoto, isVisiblePhoto] = useState(false)

    const closePasswordCallback = () => {
        isVisiblePassword(false)
    }

    const closePhotoCallback = () => {
        isVisiblePhoto(false)
    }

    return (
        <div className="flex flex-col size-full">
            {visiblePassword && <ModalChangePassword closeCallback={closePasswordCallback} />}
            {visiblePhoto && <ModalUploadPhoto closeCallback={closePhotoCallback} />}
            <div className="flex p-2 gap-1 border-0 ">
                <div className="relative flex h-fit w-1/6 items-center justify-center bg-gray-300 dark:bg-neutral-700 rounded-full">
                    {user.url_photo != null && user.url_photo != undefined && user.url_photo != "" ?
                        <img className="rounded-full p-3 2xl:p-5 aspect-square" src={user.url_photo} />
                        :
                        <IconContext.Provider value={{ color: (darkMode ? "white" : "black") }}>
                            <FaUser className="rounded-full p-5" size={42} />
                        </IconContext.Provider>
                    }
                    <div className="absolute top-0 2xl:top-3 right-0 2xl:right-3 p-2 2xl:p-3 rounded-full border border-neutral-600 z-100 bg-lime-400"
                        style={{ cursor: "pointer" }}
                        onClick={() => { isVisiblePhoto(true) }}
                    >
                        <FaCamera size={36} />
                    </div>
                </div>
                <div className="flex flex-col gap-5">
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
                            <span>Change Password</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex h-full">
                <div className="h-full w-1/2 border-0">
                    <Preferences />
                </div>
                <div className="h-full w-1/2 justify-center border-0">
                    <EcologicalFootprint energyConsumptionIn={986}/>
                </div>
            </div>
        </div>
    )
}