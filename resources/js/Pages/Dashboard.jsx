import { Head, Link } from '@inertiajs/react';
import UserLayout from '@/Layouts/UserLayout';
import { ThemeButton } from '@/Components/ThemeButton';

const Dashboard = () => {
    return (
        <div className="flex items-center">
            <ThemeButton>
                Logout
            </ThemeButton>
        </div>
    );
}

export default Dashboard