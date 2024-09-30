import { Avatar } from "flowbite-react";
import { useState } from "react";
import { useEffect } from "react";
import ModalUploadPhoto from "../UserArea/ModalUploadPhoto";
import ModalChangePassword from "@/Components/UserArea/ModalChangePassword"
import { FaPencil, FaLock } from "react-icons/fa6"
import { useContext } from "react";
import { UserContext } from "@/Layouts/UserLayout";

export default function CardUser({}) {
    const user= useContext(UserContext)
    return (
        <div className="flex item-center gap-2">

            <div className="h-full rounded-full flex items-center relative p-1 bg-gray-300 dark:bg-neutral-700 "> 
                <Avatar size={"lg"} rounded
                    img={user.url_photo != "" && user.url_photo}
                >
                </Avatar>
            </div>
            <div className="flex flex-col gap-2 justify-center">
                <p className="text-lg dark:text-white">{user.username}</p>
                <p className="text-lg text-gray-500 dark:text-gray-300" >{user.email}</p>
            </div>
        </div>
    )
}