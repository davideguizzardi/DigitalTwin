import { Link } from '@inertiajs/react'

export default function BaseLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-green-100 sm:justify-center items-center pt-6 px-2 sm:pt-0 ">
                <Link className='flex justify-evenly' href="/">
                        <img  src="/storage/image/logo.png" alt="Logo" width="64" height="64"/>
                        <h1 className='text-2xl px-5'>Digital <br /> Twin</h1>
                </Link>

            <div className="w-full sm:max-w-md mt-6 px-5 py-5 bg-white shadow-md overflow-hidden sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}
