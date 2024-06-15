import { Head , Link} from '@inertiajs/react';
import { Button } from 'flowbite-react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Dashboard({ auth }) {
    return (
        <GuestLayout>
            <Link href={route('logout')} method="post" as="button">
                Logout
            </Link>
        </GuestLayout>
    );
}
