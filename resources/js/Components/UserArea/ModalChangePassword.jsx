import { Label, Modal, TextInput } from "flowbite-react";
import { useState } from "react";
import { HiEye, HiEyeOff } from "react-icons/hi";
import InputError from "@/Components/Commons/InputError";
import { TouchKeyboard2 } from "../Commons/TouchKeyboard2";
import { StyledButton } from "../Commons/StyledBasedComponents";
import Cookies from "js-cookie";
import { domain } from "../Commons/Constants";
import { useLaravelReactI18n } from "laravel-react-i18n";
import { PasswordInput } from "../Commons/PasswordInput";

export default function ModalChangePassword({ open = true, closeCallback }) {
    const { t } = useLaravelReactI18n();
    const [passwords, setPasswords] = useState({ old: "", new: "", confirm: "" });
    const [errors, setErrors] = useState({ old: "", new: "", confirm: "" });

    const handleChange = (field, value) => {
        setPasswords((prev) => ({ ...prev, [field]: value }));
    };

    const cancelCall = () => {
        closeCallback();
    };

    const saveCall = async () => {
        if (passwords.confirm !== passwords.new) {
            setErrors({
                old: "",
                new: "",
                confirm: t("password_mismatch"), // Only show error here
            });
        } else {
            const token = Cookies.get("auth-token");
            const formData = new FormData();
            formData.append("old_password", passwords.old);
            formData.append("new_password", passwords.new);

            const response = await fetch(domain + "/api/user", {
                method: "POST",
                headers: { Authorization: "Bearer " + token },
                body: formData,
            });

            const result = await response.json();
            if (result.status === "error") {
                setErrors({
                    old: result.detail === "old_password" ? result.message : "",
                    new: result.detail === "new_password" ? result.message : "",
                    confirm: "",
                });
                return;
            }
            closeCallback();
        }
    };

    return (
        <Modal size="3xl" show={open} onClose={cancelCall}>
            <Modal.Header>{t("change_password_title")}</Modal.Header>
            <Modal.Body>
                <div className="flex flex-col gap-12 px-10">
                    <PasswordInput
                        id="oldPassword"
                        label={t("current_password")}
                        value={passwords.old}
                        onChange={(e) => handleChange("old", e.target.value)}
                        error={errors.old}
                    />
                    <div className="flex flex-col gap-4">

                    <PasswordInput
                        id="newPassword"
                        label={t("new_password")}
                        value={passwords.new}
                        onChange={(e) => handleChange("new", e.target.value)}
                        error={errors.new}
                        />
                    <PasswordInput
                        id="confirmPassword"
                        label={t("confirm_new_password")}
                        value={passwords.confirm}
                        onChange={(e) => handleChange("confirm", e.target.value)}
                        error={errors.confirm} // Show mismatch error here only
                        />
                        </div>
                    <div className="flex items-center justify-around p-2 mt-2">
                        <StyledButton onClick={cancelCall}>{t("cancel")}</StyledButton>
                        <StyledButton variant="secondary" onClick={saveCall}>{t("confirm")}</StyledButton>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
}
