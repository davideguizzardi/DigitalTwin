import { getIcon } from "@/Components/Commons/Constants";
import { UserContext } from "@/Layouts/UserLayout";
import { Avatar, Dropdown, DropdownDivider, Modal, Tooltip } from "flowbite-react";
import { useContext, useState } from "react";
import { useLaravelReactI18n } from "laravel-react-i18n";
import { FaUser } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { domain } from "@/Components/Commons/Constants";
import { router } from "@inertiajs/react";
import { DeviceContextRefresh } from "../ContextProviders/DeviceProviderRefresh";
import { apiLog, logsEvents } from "@/Components/Commons/Constants";
import { Link } from "@inertiajs/react";
import Cookies from "js-cookie";
import { StyledButton } from "./StyledBasedComponents";
import { BsFullscreen, BsFullscreenExit } from "react-icons/bs";
import { ImQuill } from "react-icons/im";
import { diary_link } from "@/Components/Commons/Constants";
import DiaryCheck from "./DiaryCheck";
function NavLink({ connectedUser, routeName, isActive, children, className = '' }) {
    const user = useContext(UserContext);

    const handleLog = async () => {
        try {
            if (connectedUser) {
                await apiLog(
                    connectedUser.username,
                    logsEvents.PAGE,
                    routeName,
                    ""
                )
            }
        } catch (e) {
            console.error("Failed to log page view", e);
        }
    };

    return (
        <Link
            href={route(routeName)}
            onClick={handleLog}
            preserveScroll
            preserveState
            className={`${className} ${isActive ? 'bg-lime-400' : ''}`}
        >
            {children}
        </Link>
    );
}

export default function Navbar() {
    const user = useContext(UserContext);
    const { connectionOk, isDemo } = useContext(DeviceContextRefresh);
    const { t, setLocale, currentLocale } = useLaravelReactI18n();

    const [isFullscreen, setIsFullscreen] = useState(document.fullscreenElement);

    const currentPage = (() => {
        const [, path] = window.location.pathname.split("/", 2);
        if (window.location.pathname === "/userarea") return "userarea";
        return path || "home";
    })();

    const linkStyle = "flex flex-row items-center gap-2 p-2 rounded-lg justify-center text-lg";

    const submit = (e) => {
        e.preventDefault();
        if (user && Object.keys(user).length > 0) {
            apiLog(user.username, logsEvents.LOGOUT);
        }
        Cookies.remove("auth-token");
        router.post("/logout");
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            // Enter fullscreen
            document.documentElement.requestFullscreen()
                .then(() => setIsFullscreen(true))
                .catch((err) => console.error("Failed to enter fullscreen:", err));
        } else {
            // Exit fullscreen
            document.exitFullscreen()
                .then(() => setIsFullscreen(false))
                .catch((err) => console.error("Failed to exit fullscreen:", err));
        }
    };


    return (
        <div className="w-full h-13 grid grid-cols-5 justify-center text-3xl bg-zinc-50 p-1 border-b border-gray-300 sticky top-0 z-50">
            <DiaryCheck user={user}/>
            <Modal show={!connectionOk}>
                <Modal.Header>
                    <div className="flex flex-row gap-3 items-center">

                        {getIcon("warning", "size-14 text-red-500")}
                        {t("connection_error_title")}
                    </div>

                </Modal.Header>
                <Modal.Body>
                    <div className="flex flex-col gap-3">
                        <div>
                            {t("connection_error_desc_1")}
                        </div>
                        {t("connection_error_desc_2")}
                        <div className="flex flex-col items-center gap-2">
                            <StyledButton variant="delete" className="justify-center" onClick={() => Window.close()}>
                                {t("Restart")}
                            </StyledButton>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
            <div></div>
            <div className="col-span-3 grid grid-cols-4 gap-1 items-center">
                <NavLink connectedUser={user} routeName="home" isActive={currentPage === "home"} className={linkStyle}>
                    {getIcon("home","size-8 md:size-5")} <span className="hidden md:flex">Home</span>
                </NavLink>
                <NavLink connectedUser={user} routeName="consumption" isActive={currentPage === "consumption"} className={linkStyle}>
                    {getIcon("power","size-8 md:size-5")} <span className="hidden md:flex">{t("Consumption")}</span>
                </NavLink>
                <NavLink connectedUser={user} routeName="automation" isActive={currentPage === "automation"} className={linkStyle}>
                    {getIcon("puzzle","size-8 md:size-5")} <span className="hidden md:flex">{t("Automations")}</span>
                </NavLink>
                <NavLink connectedUser={user} routeName="configuration" isActive={currentPage === "configuration"} className={`${linkStyle} hidden md:flex`}>
                    {getIcon("gear","size-5")} <span className="hidden md:flex">{t("Configuration")}</span>
                </NavLink>
            </div>

            <div className="flex justify-end items-center gap-2">
                <div className="w-[0.1px] h-3/4 bg-gray-800 text-gray-800" />
                {isDemo && <Tooltip content={t("Demo mode")}>
                    <div className="relative size-fit text-sm justify-center flex flex-col items-center">
                        {getIcon("media_player")}
                        Demo
                    </div>
                </Tooltip>

                }
                {/*                 {!isDemo ? (
                    <Tooltip content={connectionOk ? t("Connection ok") : t("Connection fail")}>
                        <div className="relative size-fit">
                            {getIcon("homeassistant", "size-7 text-sky-500")}
                            <div
                                className={`${connectionOk ? "bg-lime-400" : "bg-red-400"
                                    } rounded-full absolute -bottom-2 -right-2 p-0.5 items-center`}
                            >
                                {getIcon(connectionOk ? "check" : "close", connectionOk ? "size-2" : "size-3")}
                            </div>
                        </div>
                    </Tooltip>
                ) : (
                    <Tooltip content={t("Demo mode")}>
                        <div className="relative size-fit text-sm justify-center flex flex-col items-center">
                            {getIcon("media_player")}
                            Demo
                        </div>
                    </Tooltip>
                )} */}

                <Dropdown
                    label={
                        <Avatar
                            size="md"
                            placeholderInitials={user.email ? user.email.charAt(0).toUpperCase() + user.email.charAt(1) : ""}
                            alt="User settings"
                            img={user.url_photo && domain + "/" + user.url_photo}
                            rounded
                        />
                    }
                    arrowIcon
                    inline
                >
                    <Dropdown.Header>
                        <span className="block text-lg">{user.username}</span>
                        <span className="block truncate text-lg font-medium">{user.email}</span>
                    </Dropdown.Header>

                    <Dropdown.Item as={Link} href={route("userarea.get")} icon={FaUser}>
                        <span className="text-lg">{t("Account")}</span>
                    </Dropdown.Item>

                    <Dropdown.Item icon={FiLogOut} onClick={submit}>
                        <a onClick={submit} className="flex flex-col justify-center items-center text-lg">
                            <p>{t("Log out")}</p>
                        </a>
                    </Dropdown.Item>

                    <Dropdown.Divider />

                    <Dropdown.Item
                        as="a"
                        href={diary_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        icon={ImQuill}
                    >
                        <span className="text-lg">{t("Diary")}</span>
                    </Dropdown.Item>

                    <Dropdown.Divider />

                    <Dropdown.Item icon={isFullscreen ? BsFullscreenExit : BsFullscreen} onClick={toggleFullscreen}>
                        <span className="text-lg">
                            {isFullscreen ? t("Exit fullscreen") : t("Fullscreen")}
                        </span>
                    </Dropdown.Item>

                    <Dropdown.Divider />

                    <Dropdown.Item>
                        <div className="flex flex-row gap-2">
                            <div onClick={() => setLocale("it")}>
                                <p className={currentLocale() === "it" ? "underline" : ""}>Italiano</p>
                            </div>
                            <div onClick={() => setLocale("en")}>
                                <p className={currentLocale() === "en" ? "underline" : ""}>English</p>
                            </div>
                        </div>
                    </Dropdown.Item>
                </Dropdown>

            </div>
        </div>
    );
}
