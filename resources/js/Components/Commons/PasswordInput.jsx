import { Label} from "flowbite-react";
import { useState } from "react";
import { HiEye, HiEyeOff } from "react-icons/hi";
import InputError from "@/Components/Commons/InputError";
import { TouchKeyboard2 } from "../Commons/TouchKeyboard2";
import { StyledButton } from "../Commons/StyledBasedComponents";


export const PasswordInput = ({ id, label, value, onChange, error }) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="flex flex-col gap-1">
            <Label className="text-base" htmlFor={id} value={label} />
            <div className="relative w-full">
                <TouchKeyboard2
                    inputValue={value}
                    id={id}
                    type={showPassword ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    className="pr-10"
                />
                <StyledButton
                variant="secondary"
                    type="button"
                    className="absolute inset-y-0 right-2 flex items-center text-gray-500 border"
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                </StyledButton>
            </div>
            {error && <InputError message={error} className="mt-2" />}
        </div>
    );
};