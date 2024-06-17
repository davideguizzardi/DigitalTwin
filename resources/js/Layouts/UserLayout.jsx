import {ThemeSidebar as Sidebar} from "@/Components/ThemeSidebar"

export default function UserLayout({ children }) {
    return (
        <div className="h-screen flex bg-gray-100">
            <Sidebar/>
            {children}
        </div>
    )


}