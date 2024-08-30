import { ThemeSidebar as Sidebar } from "@/Components/Sidebar/ThemeSidebar"

export default function UserLayout({ children }) {
    return (
        <main className="bg-gray-100">
            <div className="h-full relative min-h-screen lg:h-screen flex flex-grow-1 bg-gray-100 overflow-x-scroll">
                <Sidebar />
                <div className="size-full flex ml-32 p-1 justify-center">
                    {children}
                </div>
            </div>
        </main>
    )
}