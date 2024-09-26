import { useEffect, useState } from "react"
import { Avatar, Checkbox } from "flowbite-react"
import { ThemeButton } from "@/Components/Commons/ThemeButton"
import { FaGear } from "react-icons/fa6"
import ModalUploadPhoto from "@/Components/UserArea/ModalUploadPhoto.jsx"
import ModalChangePassword from "@/Components/UserArea/ModalChangePassword"
import Cookies from "js-cookie"
import Preferences from "@/Components/UserArea/Preferences"
import { motion } from "framer-motion"
import { ConsumptionComparisonGraph } from "@/Components/Consumption/ConsumptionComparisonGraph"
import { LocalizationProvider } from "@mui/x-date-pickers"
import {AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"

const token = Cookies.get("auth-token")

export default function UserArea({ user }) {
    const [userState, setUserState] = useState({
        name: "",
        email: "",
        url_photo: "",
        privacy_1: "",
        privacy_2: "",
        preference: []
    })
    const [modalPhotoState, setModalPhotoState] = useState(false)
    const [modalChangePassword, setModalChangePassword] = useState(false)
    const [isVisibleSetting, setVisibleSetting] = useState(false)

    const fetchUser = async () => {
        const token = Cookies.get("auth-token")
        const response = await fetch("http://localhost/api/user", {
            headers: { 'Authorization': 'Bearer ' + token }
        })
        const result = await response.json()
        const user = result.user
        const preference = user.preference.split(";")
        console.log(user)
        setUserState({ ...user, preference: preference, url_photo: user.url_photo + "?t=" + Date.now() })
    }

    const closeModalPhoto = (save) => {
        setModalPhotoState(false)
        if (save) {
            fetchUser()
        }
    }

    const variantSettings = {
        hidden: {
            width: "0%",
            height: "0%",
            transition: {
                delay: 0.2,
                staggerChildren: 0.01,
                staggerDirection: -1
            }
        },
        visible: {
            width: "100%",
            height: "100%",
            transition: {
                delayChildren: 0.1,
                staggerChildren: 0.01
            }
        }
    }

    const variantSettingsMenu = {
        hidden: {
            opacity: 0,
            x: 200
        },
        visible: {
            opacity: 1,
            x: -10
        }
    }

    const variantIcon = {
        hidden: {
            rotate: "360deg"
        },
        visible: {
            rotate: "-360deg"
        }
    }

    const updatePrivacy = async (value, nPrivacy) => {
        const formData = new FormData()
        const privacy = nPrivacy == 0 ? "privacy_1" : "privacy_2"
        formData.append(privacy, value)
        const response = await fetch("http://localhost/api/user", {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            body: formData
        })
        const result = await response.json()
        console.log(result)
        if (nPrivacy == 0)
            setUserState({ ...userState, privacy_1: value })
        else
            setUserState({ ...userState, privacy_2: value })
    }

    const preferenceCallback = async (pref) => {
        setUserState({ ...user, preference: pref })
        let preferencesReturn = pref.join(";")
        console.log(preferencesReturn)
        const formData = new FormData()
        formData.append("preference", preferencesReturn)
        const response = await fetch("http://localhost/api/user", {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            body: formData
        })
        const result = await response.json()
        console.log(result)
    }

    useEffect(() => {
        fetchUser()
    }, [])

    return (
        <div className="flex flex-col min-h-fit p-2 gap-4">
            {modalPhotoState &&
                <ModalUploadPhoto open={true} closeCallback={closeModalPhoto} />
            }
            {modalChangePassword &&
                <ModalChangePassword open={true} closeCallback={() => { setModalChangePassword(false) }} />
            }

            <motion.div className="absolute top-2 right-2 z-20 rounded-full bg-lime-400 p-2 shadow-xl "
                ring-1 style={{ cursor: "pointer" }}
                onClick={() => setVisibleSetting(!isVisibleSetting)} variants={variantIcon}
                animate={isVisibleSetting ? "visible" : "hidden"}
            >
                <FaGear size={32} />
            </motion.div>
            <motion.div className="absolute top-0 right-0 z-10 pt-16 text-xl flex flex-col min-h-fit items-end"
                initial="hidden"
                variants={variantSettings} animate={isVisibleSetting ? "visible" : "hidden"}
                onClick={() => setVisibleSetting(false)}
            >
                <motion.div className="flex flex-col gap-3">
                    <motion.div className="py-2 px-3 z-20 bg-lime-400 shadow-xl rounded-full justify-center"
                        style={{ cursor: "pointer" }} variants={variantSettingsMenu}
                        onClick={() => {
                            setModalPhotoState(true)
                            setVisibleSetting(false)
                        }}
                        >
                        Change image profile
                    </motion.div>
                    <motion.div className="flex py-2 px-3 z-20 bg-lime-400 shadow-xl rounded-full justify-center"
                        style={{ cursor: "pointer" }} variants={variantSettingsMenu}
                        onClick={() => {
                            setModalChangePassword(true)
                            setVisibleSetting(false)
                        }}
                        >
                        Change password
                    </motion.div>
                </motion.div>
            </motion.div>

            <div className="flex w-full bg-white">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <ConsumptionComparisonGraph   device_id={""} device_name={""}/>
                </LocalizationProvider>
            </div>

            <div className="flex flex-col h-full xl:flex-row justify-center gap-2 pt-16 p-2">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col bg-white rounded shadow px-2 py-4 gap-3">
                        <h1 className="text-2xl p-2">Preferences</h1>
                        <div className="flex flex-col h-full justify-center gap-2">
                            <div className="flex justify-between">
                                <h1>Most important</h1>
                                <h1>Less important</h1>
                            </div>
                            <div className="flex py-3 bg-gradient-to-r from-lime-200 to-lime-800 mb-2"></div>
                            <Preferences items={userState.preference} saveCallback={preferenceCallback} />
                        </div>
                    </div>
                    <div className="flex flex-col h-full bg-white rounded shadow p-1">
                        <h1 className="text-2xl p-2">Privacy consent</h1>
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
                                        <Checkbox checked={userState.privacy_1} onChange={(e) => { updatePrivacy(true, 0) }} />
                                        <p className="font-bold p-1 ml-1">No</p>
                                        <Checkbox checked={!userState.privacy_1} onChange={(e) => { updatePrivacy(false, 0) }} />
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
                                        <Checkbox checked={userState.privacy_2} onChange={(e) => { updatePrivacy(true, 1) }} />
                                        <p className="font-bold p-1 ml-1">No</p>
                                        <Checkbox checked={!userState.privacy_2} onChange={(e) => { updatePrivacy(false, 1) }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col w-full h-full bg-white rounded shadow">

                </div>
            </div>

        </div>
    )
}