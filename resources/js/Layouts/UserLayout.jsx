import  Sidebar  from "@/Components/Sidebar/Sidebar"
import { motion } from "framer-motion";

export default function UserLayout({ children }) {

    return (
        <main className="bg-gray-100 overflow-x-hidden">
            <div className="h-full relative min-h-screen lg:h-screen flex flex-grow-1">
                <Sidebar />
                <motion.div className="size-full min-h-fit p-1 justify-center overflow-y-scroll bg-gray-100 ">
                    {children}
                </motion.div>
            </div>
        </main>
    )
}