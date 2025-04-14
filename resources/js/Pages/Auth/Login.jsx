import { Checkbox, Label, TextInput } from "flowbite-react";
import {ThemeButton as Button} from "@/Components/Commons/ThemeButton";
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState ,useContext} from 'react';
import InputError from "@/Components/Commons/InputError";
import { TouchKeyboard2 } from "@/Components/Commons/TouchKeyboard2";

export default function Login({ status, canResetPassword }) {

  const { data, setData, post, processing, errors, reset } = useForm({
    email: '',
    password: '',
    remember: false,
  });

  useEffect(() => {
    return () => {
      reset('password');
    };
  }, []);

  const submit = (e) => {
    e.preventDefault();
    post(route('login'));
  };
  return (
    <>
      <div className="p-5 size-full">
        <Head title="Custom Log in" />

        {status && <div className="mb-4 font-medium text-sm text-green-600">{status}</div>}

        <form className="flex max-w-md flex-col gap-4" onSubmit={submit}>
          <div>
            <div className="mb-2 block">
              <Label className="text-lg" htmlFor="email" value="Your email" />
            </div>
            <TouchKeyboard2
            inputValue={data.email}
              id="email"
              type="email"
              placeholder="your@email.com"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              required />
            <InputError message={errors.email} className="mt-2" />
          </div>


          <div>
            <div className="mb-2 block" >
              <Label className="text-lg" htmlFor="password" value="Your password" />
            </div>
            <TouchKeyboard2
              inputValue={data.password}
              id="password"
              type="password"
              name="password"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              required />
            <InputError message={errors.password} className="mt-2" />
          </div>


          <div className="flex justify-between gap-2">
            <div className="flex jutify-start gap-2">
              <Checkbox
                id="remember"
                checked={data.remember}
                onChange={(e) => setData('remember', e.target.checked)}
              />
              <Label htmlFor="remember" >Remember me</Label>
            </div>
            {canResetPassword && (
              <Link
                href={route('password.request')}
                className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
              object-right"
              >
                Forgot your password?
              </Link>
            )}

          </div>


          <Button type="submit">
            Submit
          </Button>
        </form>
      </div>
    </>
  );
}
