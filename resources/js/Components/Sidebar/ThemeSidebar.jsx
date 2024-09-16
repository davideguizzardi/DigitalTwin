import { Sidebar, Avatar, Button } from "flowbite-react";
import { useState, useEffect} from "react";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import { FaHouse, FaBolt, FaPuzzlePiece, FaGear, FaAnglesLeft, FaAnglesRight } from "react-icons/fa6";
import { ThemeSidebarItem as SidebarItem } from "@/Components/Sidebar/ThemeSidebarItem";


export function ThemeSidebar() {
    const [collapsed, setCollapsed] = useState(true);
    const [userState, setUserState] = useState({}) 

    useEffect(()=>{
        const fetchUser = async () =>{
            const token = Cookies.get("auth-token")
            const response = await fetch("http://localhost/api/user",{
                headers:{'Authorization': 'Bearer ' + token}
            })
            const result = await response.json()
            const user= result.user
            setUserState({...user, url_photo: user.url_photo +"?t="+Date.now()})
        }
        fetchUser()
    },[])
    const handleToggleSidebar = () => {
        setCollapsed(!collapsed);
    };

    return (
        <motion.div
        className="min-h-max shadow"
        style={{zIndex: 100}}
        layout
        >
            <Sidebar className="flex size-full">
                <Sidebar.Items className="flex flex-col h-full p-0">
                    <div className="flex justify-between">
                        <Sidebar.Logo className="self-center flex-none" href="#" img="/storage/image/logo.png">
                            {!collapsed ? "Digital Twin" : ""}
                        </Sidebar.Logo>
                        <Button className="size-fit" color="transparent" onClick={handleToggleSidebar}>
                            {collapsed ?
                                <FaAnglesRight className="self-center" size={12} /> :
                                <FaAnglesLeft className="self-center" />
                            }
                        </Button>
                    </div>
                    <Sidebar.ItemGroup className="h-full flex flex-col items-center ">
                        <SidebarItem name="Dashboard" href={route('dashboard')} icon={FaHouse} collapsed={collapsed}>
                        </SidebarItem>
                        <SidebarItem name="Consumption" icon={FaBolt} collapsed={collapsed}>
                        </SidebarItem>
                        <SidebarItem name="Automations" icon={FaPuzzlePiece} collapsed={collapsed}>
                        </SidebarItem>
                        <SidebarItem name="Configuration" href={route('configuration')} icon={FaGear} collapsed={collapsed}>
                        </SidebarItem>
                    </Sidebar.ItemGroup>
                    <Sidebar.ItemGroup className="flex flex-col">
                        <Sidebar.Item href={route('userarea.get')}>
                            <div className="flex gap-1 justify-start items-center">
                                <Avatar rounded img={userState.url_photo} size={"md"}/>
                                {!collapsed &&
                                    <div className="space-y-1 font-medium dark:text-white">
                                        <h1>{userState.username}</h1>
                                    </div>
                                }
                            </div>
                        </Sidebar.Item>
                    </Sidebar.ItemGroup>
                </Sidebar.Items>
            </Sidebar>
        </motion.div>
    );
}