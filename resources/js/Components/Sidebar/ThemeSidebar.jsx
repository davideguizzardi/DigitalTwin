import { Sidebar, Avatar, Button } from "flowbite-react";
import { useState} from "react";
import { motion } from "framer-motion";
import { FaHouse, FaBolt, FaPuzzlePiece, FaGear, FaAnglesLeft, FaAnglesRight } from "react-icons/fa6";
import { ThemeSidebarItem as SidebarItem } from "@/Components/Sidebar/ThemeSidebarItem";

export function ThemeSidebar() {
    const [collapsed, setCollapsed] = useState(false);

    const handleToggleSidebar = () => {
        setCollapsed(!collapsed);
    };

    return (
        <motion.div
        layout
        >
            <Sidebar className="flex size-full">
                <Sidebar.Items className="flex flex-col h-full">
                    <div className="flex flex-row justify-between">
                        <Sidebar.Logo className="self-center flex-none" href="#" img="/storage/image/logo.png">
                            {!collapsed ? "Digital Twin" : ""}
                        </Sidebar.Logo>
                        <Button className="size-fit" color="transparent" onClick={handleToggleSidebar}>
                            {collapsed ?
                                <FaAnglesRight className="self-center" /> :
                                <FaAnglesLeft className="self-center" />
                            }
                        </Button>
                    </div>
                    <Sidebar.ItemGroup className="h-full flex flex-col">
                        <SidebarItem name="Home" href={route('dashboard')} icon={FaHouse} collapsed={collapsed}>
                        </SidebarItem>
                        <SidebarItem name="Consumption" icon={FaBolt} collapsed={collapsed}>
                        </SidebarItem>
                        <SidebarItem name="Automations" icon={FaPuzzlePiece} collapsed={collapsed}>
                        </SidebarItem>
                        <SidebarItem name="Configuration" href={route('configuration')} icon={FaGear} collapsed={collapsed}>
                        </SidebarItem>
                    </Sidebar.ItemGroup>
                    <Sidebar.ItemGroup className="flex flex-col">
                        <Sidebar.Item>
                            <Avatar rounded>
                                {!collapsed &&
                                    <div className="space-y-1 font-medium dark:text-white">
                                        <div>Mauro Muratore</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">mauro@mauro.mauro</div>
                                    </div>
                                }
                            </Avatar>
                        </Sidebar.Item>
                    </Sidebar.ItemGroup>
                </Sidebar.Items>
            </Sidebar>
        </motion.div>
    );
}