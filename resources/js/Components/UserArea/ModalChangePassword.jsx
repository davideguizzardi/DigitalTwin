import { Label, Modal, TextInput } from "flowbite-react";
import { useState } from "react";
import InputError from "@/Components/Commons/InputError";
import { ThemeButton } from "../Commons/ThemeButton";
import Cookies from "js-cookie";


export default function modalChangePassword({ open, closeCallback }) {
    const [passwords, setPasswords] = useState({
        old: "",
        new: "",
        confirm: ""
    })
    const [errors, setErrors] = useState({
        old: "",
        new: "",
        confirm: ""
    })

    const cancelCall = () => {
        closeCallback()
    }

    const saveCall = async () => {
        if (passwords.confirm != passwords.new) {
            setErrors({
                old: "",
                new: "Passwords are differents",
                confirm: "Passwords are differents "
            })
        } else {
            const token = Cookies.get("auth-token")
            const formData = new FormData()
            formData.append("old_password", passwords.old)
            formData.append("new_password", passwords.new)
            const response = await fetch("http://localhost/api/user", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + token
                },
                body: formData
            })
            const result = await response.json()
            if (result.status == "error") {
                if (result.detail == "old_password")
                    setErrors({
                        old: result.message,
                        new: "",
                        confirm: ""
                    })
                else if (result.detail == "new_password")
                    setErrors({
                        old: "",
                        new: result.message,
                        confirm: ""
                    })

            }
            closeCallback()
        }
    }

    return (
        <Modal size="3xl" show={open} onClose={cancelCall}>
            <Modal.Header>Change Password</Modal.Header>
            <Modal.Body>
                <div className="flex flex-col h-3/6">
                    <div className="flex flex-col gap-2">
                        <div className="block">
                            <Label className="text-lg" htmlFor="oldPassword" value="Current password" />
                        </div>
                        <TextInput id="oldPassword" type="password"
                            onChange={(e) => setPasswords({ ...passwords, old: e.target.value })} />
                        <InputError message={errors.old} className="mt-2" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="block">
                            <Label className="text-lg" htmlFor="newPassword" value="New password" />
                        </div>
                        <TextInput id="newPassword" type="password"
                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} />
                        <InputError message={errors.new} className="mt-2" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="block">
                            <Label className="text-lg" htmlFor="confirmPassword" value="Confirm new password" />
                        </div>
                        <TextInput id="confirmPassword" type="password"
                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} />
                        <InputError message={errors.confirm} className="mt-2" />
                    </div>
                    <div className="flex items-center justify-around p-2 mt-2">
                        <ThemeButton onClick={cancelCall}>Cancel</ThemeButton>
                        <ThemeButton onClick={saveCall}>Add</ThemeButton>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    )
}