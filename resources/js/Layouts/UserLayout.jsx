import { ThemeSidebar as Sidebar } from "@/Components/Sidebar/ThemeSidebar"

export default function UserLayout({ children }) {
    return (
        <main className="bg-gray-100">
            <div className="h-full min-h-screen lg:h-screen flex flex-grow-1 bg-gray-100 overflow-x-scroll">
                <Sidebar />
                <div className="size-full flex p-4 justify-center">
                    {children}
                </div>
            </div>
        </main>
    )
}