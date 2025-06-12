import { getIcon } from '@/Components/Commons/Constants';
import WhiteCard from '@/Components/Commons/WhiteCard';
import { Link } from '@inertiajs/react'
import { useState } from 'react';

export default function GuestLayout({ children }) {
    const [isFullscreen, setIsFullscreen] = useState(document.fullscreenElement);
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            // Enter fullscreen
            document.documentElement.requestFullscreen()
                .then(() => setIsFullscreen(true))
                .catch((err) => console.error("Failed to enter fullscreen:", err));
        } else {
            // Exit fullscreen
            document.exitFullscreen()
                .then(() => setIsFullscreen(false))
                .catch((err) => console.error("Failed to exit fullscreen:", err));
        }
    };

    return (
        <div className="min-h-screen relative flex flex-row bg-gray-300 dark:bg-neutral-800 sm:justify-center items-center pt-6 px-2 sm:pt-0 ">
            <WhiteCard className='flex flex-col w-1/2 items-center gap-5'>
                <div className='flex flex-row gap-1 items-center w-full'>

                    <Link className='flex flex-row px-3 py-1 items-center justify-start w-11/12' href="/">
                        <img src="/storage/logo.png" alt="Logo" width="64" height="64" />
                        <h1 className='text-2xl px-5 dark:text-white'>Green Smart Home</h1>
                    </Link>
                    <div className='shadow-md p-2 rounded-full hover:bg-lime-300' onClick={() => toggleFullscreen()}>
                        {getIcon(isFullscreen?"fullscreen_exit":"fullscreen", "size-6")}
                    </div>
                </div>

                {children}
            </WhiteCard>
        </div>
    );
}
