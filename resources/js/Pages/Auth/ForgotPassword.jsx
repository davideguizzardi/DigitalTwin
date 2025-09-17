import { TextInput } from "flowbite-react";

import { Head, useForm } from "@inertiajs/react";
import InputError from "@/Components/Commons/InputError";
import { StyledButton } from "@/Components/Commons/StyledBasedComponents";


export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <>
            <Head title="Forgot Password" />
            <div className="p-2">
                <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                    Forgot your password? No problem. Just let us know your email address and we will email you a password
                    reset link that will allow you to choose a new one.
                </div>
                {status && <div className="mb-4 font-medium text-sm text-green-600">{status}</div>}

                <form className="flex max-w-md flex-col gap-4" onSubmit={submit}>
                    <TextInput
                        id="email"
                        type="email"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-2" />
                    <StyledButton
                        className="bg-lime-400 text-black"
                        type="submit">
                        Email Password Reset Link
                    </StyledButton>
                </form>
            </div>
        </>
    )
}