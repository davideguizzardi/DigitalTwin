import { Avatar } from "flowbite-react";
import { useForm } from "@inertiajs/react";
import { useState } from "react";
import { useEffect } from "react";
import ModalUploadPhoto from "../UserArea/ModalUploadPhoto";
import ModalChangePassword from "@/Components/UserArea/ModalChangePassword"
import { FaPowerOff } from "react-icons/fa6"
import { useContext } from "react";
import { UserContext } from "@/Layouts/UserLayout";
import { router, usePage } from '@inertiajs/react'
import { domain } from "./Constants";


export default function CardUser({ }) {
    const user = useContext(UserContext)
    const submit = (e) =>{
        e.preventDefault();
        router.post('/logout')
        //post(route("login"))
    }
    return (
        <div className="flex item-center gap-2">
            <a href={route("userarea.get")} className="flex items-center w-full gap-1">
                <div className="h-full w-content flex rounded-full flex items-center relative p-1 bg-gray-300 dark:bg-neutral-700 ">
                    <Avatar size={"lg"} rounded
                        img={user.url_photo && domain + "/" +user.url_photo}
                    >
                    </Avatar>
                </div>
                <div className="flex flex-col gap-2 justify-center">
                    <p className="text-lg dark:text-white">{user.username}</p>
                    <p className="text-lg text-gray-500 dark:text-gray-300" >{user.email}</p>
                </div>
            </a>
            <a onClick={(e)=>{submit(e)}} className="flex flex-col justify-center items-center">
                <div className="text-blue">
                    <FaPowerOff size={24}/>
                </div>
                <p>Logout</p>
            </a>
        </div>
    )
}