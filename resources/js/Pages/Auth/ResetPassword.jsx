import { Label, TextInput } from "flowbite-react";
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import InputError from "@/Components/Commons/InputError";
import { StyledButton } from "@/Components/Commons/StyledBasedComponents";

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'));
    };

    return (
        <>
            <Head title="Reset Password" />

            <form onSubmit={submit}>
                <div className="p-2">
                    <div className="mb-2 block">
                        <Label className="text-lg" htmlFor="email" value="Your email" />
                    </div>
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <div className="mb-2 block" >
                        <Label className="text-lg" htmlFor="password" value="Your password" />
                    </div>
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        isFocused={true}
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <div className="mb-2 block" >
                        <Label className="text-lg" htmlFor="password_confirmation" value="Confirm Password" />
                    </div>

                    <TextInput
                        type="password"
                        id="password_confirmation"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                    />

                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div className="flex items-center justify-end mt-4">
                    <StyledButton className="ms-4 bg-lime-200 text-black" disabled={processing} type="submit">
                        Reset Password
                    </StyledButton>
                </div>
            </form>
        </>
    );
}
