import ConfigurationMap from '@/Components/ConfigurationMap';
import UserLayout from '@/Layouts/UserLayout';

export default function Configuration({ auth }) {
    return (
        <UserLayout>
            <ConfigurationMap/>
        </UserLayout>

    );
}