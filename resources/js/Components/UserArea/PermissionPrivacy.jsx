import { UserContext } from "@/Layouts/UserLayout"
import { Checkbox } from "flowbite-react"
import { useState } from "react"
import { useEffect } from "react"
import { useContext } from "react"

export default function PermissionPrivacy() {
    const user = useContext(UserContext)
    const [privacy, setPrivacy] = useState({privacy_collection: false, privacy_disclosure: false})

    const fetchPrivacy = async () => {
        if(!user.username) return null
        const response = await fetch("http://localhost:8000/user/preferences")
        if(response.ok){
            const result = await response.json()
            const userData = result.filter(e => e.user_id == user.username)[0]
            const updatePrivacy = {
                privacy_disclosure: userData.data_disclosure,
                privacy_collection: userData.data_collection 
            }
            setPrivacy(updatePrivacy)
        }
    }

    useEffect(()=>{
        fetchPrivacy()
    },[user])

    const handlePrivacyCollection = (cond) =>{
        setPrivacy({...privacy, privacy_collection: cond})
    }

    const handlePrivacyDisclosure = (cond) =>{
        setPrivacy({...privacy, privacy_collection: cond})
    }

    return (
        <div className="flex flex-col h-full dark:text-white">
            <h1 className="text-2xl p-2 dark:text-white">Privacy consent</h1>
            <div className="flex flex-col h-full justify-around">
                <div className="flex flex-col">
                    <p className="p-1">
                        In order to give the users prediction on their future energy consumption and suggestion on how to improve their lifestyle,
                        this application needs to collect data on the interaction between the inhabitants and the Digital Twin.
                    </p>
                    <div className="flex">
                        <p className="font-bold p-1">Do you do consent to the collection of your interaction data?</p>
                        <div className="flex items-center gap-1">
                            <p className="font-bold p-1">Yes</p>
                            <Checkbox checked={privacy.privacy_collection} onChange={(e) => { handlePrivacyCollection(true) }} />
                            <p className="font-bold p-1 ml-1">No</p>
                            <Checkbox checked={!privacy.privacy_collection} onChange={(e) => { handlePrivacyCollection(false) }} />
                        </div>
                    </div>
                </div>
                <div className="flex flex-col">
                    <p className="p-1">
                        This application let their users see content created by other inhabitants, such as automations and manual actions on devices.
                        The purpose of this feature is to give users knowledge on the availability of devices hence avoiding conflicts with other users.
                    </p>
                    <div className="flex">
                        <p className="font-bold p-1">Do you do consent to the collection of your interaction data?</p>
                        <div className="flex items-center gap-1">
                            <p className="font-bold p-1">Yes</p>
                            <Checkbox checked={privacy.privacy_disclosure} onChange={(e) => { handlePrivacyDisclosure(true) }} />
                            <p className="font-bold p-1 ml-1">No</p>
                            <Checkbox checked={!privacy.privacy_disclosure} onChange={(e) => { handlePrivacyDisclosure(false) }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
