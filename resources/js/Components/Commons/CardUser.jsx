import { Avatar } from "flowbite-react";
import { useState } from "react";
import { useEffect } from "react";

export default function CardUser({ user }) {
    const [userState, setUserState] = useState({})
    useEffect(() => {
        setUserState(user)
    }, [user])

    return (
        <div className="flex item-center gap-2">
            <div className="rounded-full bg-blue-200">
            <Avatar status="busy" statusPosition="top-right" size={"lg"}
                img={userState.url_photo != "" && userState.url_photo}
            />
            </div>
            <div className="flex flex-col gap-2 justify-center">
                <p  className="text-lg text-gray-800">{userState.username}</p>
                <p className="text-lg text-gray-500">{userState.email}</p>
            </div>
        </div>
    )
}