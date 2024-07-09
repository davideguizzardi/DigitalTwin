import { Sidebar } from "flowbite-react";

export function ThemeSidebarItem({name, icon, href="#", collapsed=false, selected=false}){

    return (
        <Sidebar.Item className={"h-min " + (collapsed ? " w-min " : " w-full ")} href={href} icon={icon}>
        
        {!collapsed && name}
        </Sidebar.Item>
    );
}