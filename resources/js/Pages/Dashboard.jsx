import { Head , Link} from '@inertiajs/react';
import UserLayout from '@/Layouts/UserLayout';
import { ThemeButton } from '@/Components/ThemeButton';

export default function Dashboard({ auth }) {
    return (
        <UserLayout>
            <div className="flex items-center">
            <ThemeButton>
                Logout
            </ThemeButton>
            </div>
        </UserLayout>

    );
}
