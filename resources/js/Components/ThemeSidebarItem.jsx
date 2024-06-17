import { Sidebar } from "flowbite-react";

export function ThemeSidebarItem({name, icon, href="#", collapsed=false}){

    return (
        <Sidebar.Item className="size-min" href={href} icon={icon}>
        {!collapsed && name}
        </Sidebar.Item>
    );
}