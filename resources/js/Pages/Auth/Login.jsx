import { Checkbox, Label } from "flowbite-react";
import { StyledButton as Button } from "@/Components/Commons/StyledBasedComponents";
import { Head, Link, useForm } from "@inertiajs/react";
import { useEffect, useState } from "react";
import InputError from "@/Components/Commons/InputError";
import { TouchKeyboard2 } from "@/Components/Commons/TouchKeyboard2";
import { Avatar } from "flowbite-react";
import { domain, getIcon,rulebot } from "@/Components/Commons/Constants";
import { motion, AnimatePresence } from "framer-motion";
import { useLaravelReactI18n } from "laravel-react-i18n";
import { PasswordInput } from "@/Components/Commons/PasswordInput";
import Cookies from "js-cookie";


const rulebotEmail = import.meta.env.VITE_RULEBOT_USER_EMAIL
const rulebotPassword = import.meta.env.VITE_RULEBOT_USER_PASSWORD

const { protocol, hostname } = window.location;
const rulebotUrl = `${protocol}//${hostname}:8888`;

export default function Login({ users, status, canResetPassword }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const { t } = useLaravelReactI18n()
  const { data, setData, post, processing, errors, reset } = useForm({
    email: "",
    password: "",
    remember: false,
  });

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setData("email", user.email);
  };

  useEffect(() => {
    return () => {
      reset("password");
    };
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    try{

      
      const body = JSON.stringify({
        email: rulebotEmail,//data.email,
        password: rulebotPassword//data.password
      })
      
      const result = await fetch(`${rulebotUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: body
      }).then((res) => { return res.json()})
      if (result.status === 'ok') {
        Cookies.set(result.cookie.name,result.cookie.token,{secure:false})
        Cookies.set("rulebot_user_id",result.user_id,{secure:false})
      } else {
        
      }
    }catch(error){
      console.error(error)
    }
    post(route("login"));
  };


  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/keep-alive', {
          credentials: 'include',
        });

        if (!res.ok && res.status === 419) {
          if (!window.__sessionReloaded) {
            window.__sessionReloaded = true;
            window.location.reload();
          }
        }
      } catch (e) {
        console.error("Session check failed", e);
        if (!window.__sessionReloaded) {
          window.__sessionReloaded = true;
          window.location.reload();
        }
      }
    };

    checkSession();

    const interval = setInterval(checkSession, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="size-full px-3 flex flex-col justify-center items-center">
      <AnimatePresence mode="wait">
        {!selectedUser && (
          <motion.div
            key="user-selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-2 size-full pb-8"
          >
            <div className="grid grid-cols-4 grid-flow-row gap-4 items-center">
              {users.map((user) => (
                <div key={user.email} onClick={() => handleUserClick(user)} className="cursor-pointer">
                  <Avatar
                    size={"lg"}
                    placeholderInitials={user.username.substring(0, 2)}
                    img={user.url_photo && domain + "/" + user.url_photo}
                    rounded
                  />
                  <p className="capitalize text-center">{user.username}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {selectedUser && (
          <motion.div
            key="login-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="pb-5 flex flex-col gap-2 w-full"
          >
            {status && <div className="mb-4 font-medium text-sm text-green-600">{status}</div>}

            <div className="flex flex-row gap-4 items-center mb-3">
              <Avatar
                size={"lg"}
                placeholderInitials={selectedUser.username.substring(0, 2)}
                img={selectedUser.url_photo && domain + "/" + selectedUser.url_photo}
                rounded
              />

              <div className="flex flex-col gap-0 items-start">
                <p className="capitalize text-start text-lg font-semibold">{selectedUser.username}</p>
                <p className="text-start font-light">{selectedUser.email}</p>
              </div>
            </div>

            <form className="flex flex-col gap-4" onSubmit={submit}>
              <div className="hidden">
                <div className="mb-2 block">
                  <Label className="text-lg" htmlFor="email" value="Your email" />
                </div>
                <TouchKeyboard2
                  inputValue={data.email}
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={data.email}
                  onChange={(e) => setData("email", e.target.value)}
                  required
                />
                <InputError message={errors.email} className="mt-2" />
              </div>


              <div>
                <PasswordInput
                  id="password"
                  label={t("Your password")}
                  value={data.password}
                  onChange={(e) => setData("password", e.target.value)}
                  error={errors.email || errors.password}
                />

              </div>

              <div className="flex justify-between gap-2">
                <div className="flex jutify-start gap-2">
                  <Checkbox
                    id="remember"
                    checked={data.remember}
                    onChange={(e) => setData("remember", e.target.checked)}
                  />
                  <Label htmlFor="remember">{t("Remember me")}</Label>
                </div>
                {canResetPassword && (
                  <Link
                    href={route("password.request")}
                    className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 object-right"
                  >
                    {t("Forgot your password?")}
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-2 gap-5 w-full">
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedUser(null);
                  }}
                  variant="secondary"
                  className="w-full"
                  type=""
                >
                  <div className="flex flex-row items-center gap-4">{getIcon("arrow_left")}{t("Back")}</div>
                </Button>

                <button className="w-full bg-lime-400 hover:bg-lime-500 text-gray-800 shadow-md rounded-md" type="submit">
                  {t("Enter")}
                </button>
              </div>
            </form>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
