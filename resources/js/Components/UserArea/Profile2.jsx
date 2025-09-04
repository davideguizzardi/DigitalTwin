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
import { StyledButton } from "../Commons/StyledBasedComponents";
import PermissionPrivacy from "./PermissionPrivacy";

export default function Profile2({ }) {
    const user = useContext(UserContext)

    const darkMode = localStorage.getItem("darkMode") == "true"
    const [visiblePassword, isVisiblePassword] = useState(false)
    const [visiblePhoto, isVisiblePhoto] = useState(false)
    const { t } = useLaravelReactI18n()

    const closePasswordCallback = () => {
        isVisiblePassword(false)
    }

    const closePhotoCallback = () => {
        isVisiblePhoto(false)
    }

    return (
        <div className="flex flex-col size-full gap-5">

            <WhiteCard className="flex flex-row w-full px-2 md:px-5 py-2 gap-4  md:gap-9 items-center">
                {visiblePassword && <ModalChangePassword closeCallback={closePasswordCallback} />}
                {visiblePhoto && <ModalUploadPhoto closeCallback={closePhotoCallback} />}
                <div className="relative">
                    {user.url_photo != null && user.url_photo != undefined && user.url_photo != "" ?
                        <img className="rounded-2xl w-28 md:w-32 aspect-square" src={user.url_photo} />
                        :
                        <IconContext.Provider value={{ color: (darkMode ? "white" : "black"), size: 150 }}>
                            <FaUser className="rounded-2xl p-5" />
                        </IconContext.Provider>
                    }
                    <StyledButton className="absolute bottom-0 right-0 rounded-2xl flex size-10 items-center" onClick={() => { isVisiblePhoto(true) }}>
                        <FaPencil size={18} />
                    </StyledButton>
                </div>

                <div className="flex flex-col gap-3">
                    <div>
                        <p className="text-lg md:text-3xl"><span className="capitalize font-semibold">{user.username}</span>   ({user.email})</p>
                    </div>
                    <StyledButton className="w-fit" onClick={() => { isVisiblePassword(true) }}>
                        <div className="flex flex-row items-center gap-2 text-sm md:text-base">

                            <FaLock />
                            {t("Change Password")}
                        </div>
                    </StyledButton>
                </div>

            </WhiteCard>
            <div className="flex flex-col md:grid md:grid-cols-2 gap-5">

                <WhiteCard className="h-fit">
                    <Preferences />
                </WhiteCard>
                <WhiteCard className="h-fit">
                    <PermissionPrivacy />
                </WhiteCard>
            </div>
        </div>
    )
}