import { ThemeSidebar as Sidebar } from "@/Components/ThemeSidebar"

export default function UserLayout({ children }) {
    return (
        <main>
            <div className="h-screen flex bg-gray-100">
                <Sidebar />
                <div className="size-full flex p-4 justify-center">
                    {children}
                </div>
            </div>
        </main>
    )
}