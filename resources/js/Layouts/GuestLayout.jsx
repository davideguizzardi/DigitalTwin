import WhiteCard from '@/Components/Commons/WhiteCard';
import { Link } from '@inertiajs/react'


export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen relative flex flex-row bg-gray-300 dark:bg-neutral-800 sm:justify-center items-center pt-6 px-2 sm:pt-0 ">
            <WhiteCard className='flex flex-col w-1/2 items-center gap-5'>
                <Link className='flex flex-row px-3 py-1 items-center justify-start w-full' href="/">
                        <img  src="/storage/logo.png" alt="Logo" width="64" height="64"/>
                        <h1 className='text-2xl px-5 dark:text-white'>Green Smart Home</h1>
                </Link>

                {children}
            </WhiteCard>
        </div>
    );
}
