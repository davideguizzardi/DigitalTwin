import { Head , Link} from '@inertiajs/react';
import { Button } from 'flowbite-react';
import BaseLayout from '@/CustomLayouts/BaseLayout';

export default function Dashboard({ auth }) {
    return (
        <BaseLayout>
            <Link href={route('logout')} method="post" as="button">
                Logout
            </Link>
        </BaseLayout>
    );
}
