import { UserContext } from "@/Layouts/UserLayout";
import { useContext } from "react";
import { FaLock, FaCamera, FaUser } from "react-icons/fa6"
import { IconContext } from "react-icons";
import Preferences from "./Preferences";
import { useState } from "react";
import ModalChangePassword from "./ModalChangePassword";
import ModalUploadPhoto from "./ModalUploadPhoto";

export default function Profile({ }) {
    const user = useContext(UserContext)

    const darkMode = localStorage.getItem("darkMode") == "true"
    const [visiblePassword, isVisiblePassword] = useState(false)
    const [visiblePhoto, isVisiblePhoto] = useState(false)

    const closePasswordCallback = () =>{
        isVisiblePassword(false)
    }

    const closePhotoCallback = () =>{
        isVisiblePhoto(false)
    }

    return (
        <div className="flex size-full">
            {visiblePassword && <ModalChangePassword closeCallback={closePasswordCallback}/>}
            {visiblePhoto && <ModalUploadPhoto closeCallback={closePhotoCallback}/>}
            <div className="flex flex-col w-3/5 gap-5 p-3 items-center">
                <div className="text-2xl px-2 pt-5 dark:text-white size-full">
                    {user.username}
                </div>
                <div className="text-2xl px-2 dark:text-white size-full">
                    {user.email}
                </div>
                <div className="size-full">
                    <div className="text-2xl flex items-center w-fit rounded px-2 bg-lime-400 py-2 gap-2"
                        style={{cursor: "pointer"}}
                        onClick={() => {isVisiblePassword(true)}}
                    >
                        <FaLock />
                        <span>Change Password</span>
                    </div>
                </div>
                <div className="relative flex h-full w-fit items-center justify-center bg-gray-300 dark:bg-neutral-700 rounded-full">
                    {user.url_photo!=null && user.url_photo!= undefined && user.url_photo!="" ?
                    <img className="rounded-full p-5" src={user.url_photo} style={{ width: "65vh" }} />
                    :
                        <IconContext.Provider value={{ color: (darkMode ? "white" : "black") }}>
                            <FaUser className="rounded-full p-5" style={{ width: "60vh", height: "60vh" }} size={128} />
                        </IconContext.Provider>
                    }
                    <div className="absolute top-6 2xl:top-14 right-12 2xl:right-20 p-5 rounded-full border border-neutral-600 z-100 bg-lime-400"
                        style={{cursor: "pointer"}}
                        onClick={() => {isVisiblePhoto(true)}}
                    >
                        <FaCamera size={36} />
                    </div>
                </div>
            </div>
            <div className="flex h-full w-2/5">
                <Preferences />
            </div>
        </div>
    )
}