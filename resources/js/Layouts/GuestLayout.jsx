import { Link } from '@inertiajs/react'
import { Card, DarkThemeToggle} from 'flowbite-react'

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen relative flex flex-col bg-gray-100 sm:justify-center items-center pt-6 px-2 sm:pt-0 ">
            <DarkThemeToggle className="absolute top-0 right-0"/>
                <Link className='flex justify-evenly p-2' href="/">
                        <img  src="/storage/image/logo.png" alt="Logo" width="64" height="64"/>
                        <h1 className='text-2xl px-5'>Digital <br /> Twin</h1>
                </Link>

            <Card className='bg-white w-96'>
                {children}
            </Card>
        </div>
    );
}
