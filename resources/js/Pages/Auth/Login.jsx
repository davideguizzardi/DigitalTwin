import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Label } from "flowbite-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLaravelReactI18n } from "laravel-react-i18n";
import { StyledButton as Button } from "@/Components/Commons/StyledBasedComponents";
import { PasswordInput } from "@/Components/Commons/PasswordInput";
import { TouchKeyboard2 } from "@/Components/Commons/TouchKeyboard2";
import { backend, domain, getIcon, login_rulebot } from "@/Components/Commons/Constants";
import Cookies from "js-cookie";

import { authService, userService } from "@/Api";

const rulebotEmail = import.meta.env.VITE_RULEBOT_USER_EMAIL;
const rulebotPassword = import.meta.env.VITE_RULEBOT_USER_PASSWORD;
const { protocol, hostname } = window.location;
const rulebotUrl = `${protocol}//${hostname}:8888`;

const STEP = {
  HOUSE: "house",   // inserimento credenziali casa
  USERS: "users",   // griglia utenti stile Netflix
};

export default function Login() {
  const { t } = useLaravelReactI18n();
  const navigate = useNavigate();

  const [step, setStep] = useState(STEP.HOUSE);
  const [users, setUsers] = useState([]);
  const [houseEmail, setHouseEmail] = useState("");
  const [housePassword, setHousePassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- Step 1: login casa ---
  const submitHouse = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Rulebot login (invariato)
      if (login_rulebot) {
        try {
          const result = await fetch(`${rulebotUrl}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: rulebotEmail, password: rulebotPassword }),
          }).then((res) => res.json());

          if (result.status === "ok") {
            Cookies.set(result.cookie.name, result.cookie.token, { secure: false });
            Cookies.set("rulebot_user_id", result.user_id, { secure: false });
          }
        } catch (err) {
          console.error("Rulebot login failed", err);
        }
      }

      // Login casa → salva token JWT
      await authService.login(houseEmail, housePassword);

      // Carica lista utenti con il token appena ottenuto
      const userList = await userService.getUsers();
      setUsers(userList);
      setStep(STEP.USERS);
    } catch (err) {
      setError(
        err.status === 401 ? t("Invalid credentials") :
          err.status === 404 ? t("House credentials not configured") :
            t("Connection error")
      );
    } finally {
      setLoading(false);
    }
  };

  // --- Step 2: selezione utente → home ---
  const handleUserClick = (user) => {
    localStorage.setItem('dt_selected_user', JSON.stringify(user));
    navigate("/home");
  };

  return (
    <div className="size-full px-3 flex flex-col justify-center items-center">
      <AnimatePresence mode="wait">

        {/* Step 1 — credenziali casa */}
        {step === STEP.HOUSE && (
          <motion.div
            key="house-login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-4 w-full pb-8"
          >
            <form className="flex flex-col gap-4" onSubmit={submitHouse}>
              <div>
                <Label className="text-base" htmlFor={"house-email"} value={t("Email")} />
                <TouchKeyboard2
                  id="house-email"
                  label={t("House email")}
                  value={houseEmail}
                  onChange={(e) => setHouseEmail(e.target.value)}
                />
              </div>
              <div>
                <PasswordInput
                  id="house-password"
                  label={t("Password")}
                  value={housePassword}
                  onChange={(e) => setHousePassword(e.target.value)}
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? t("Loading...") : t("Enter")}
              </Button>
            </form>
          </motion.div>
        )}

        {/* Step 2 — griglia utenti */}
        {step === STEP.USERS && (
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
                <div
                  key={user.email}
                  onClick={() => handleUserClick(user)}
                  className="cursor-pointer"
                >
                  <Avatar
                    size="lg"
                    placeholderInitials={user.username.substring(0, 2)}
                    img={user.url_photo && `${backend}/${user.url_photo}`}
                    rounded
                  />
                  <p className="capitalize text-center">{user.username}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}