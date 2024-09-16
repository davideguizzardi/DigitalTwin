import  Sidebar  from "@/Components/Sidebar/Sidebar"
import { motion } from "framer-motion";

export default function UserLayout({ children }) {

    return (
        <main className="bg-gray-100">
            <div className="h-full relative min-h-screen lg:h-screen flex flex-grow-1">
                <Sidebar />
                <motion.div className="size-full flex min-h-fit p-1 pt-5 pb-5 justify-center  bg-gray-100 overflow-x-scroll">
                    {children}
                </motion.div>
            </div>
        </main>
    )
}