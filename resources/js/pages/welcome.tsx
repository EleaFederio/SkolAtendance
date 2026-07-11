import { Head, Link, usePage } from '@inertiajs/react';
import { LayoutGrid } from 'lucide-react';
import { dashboard, login, register } from '@/routes';

export default function Welcome() {
    const { auth, currentTeam } = usePage().props;
    const dashboardUrl = currentTeam ? dashboard(currentTeam.slug) : '/';

    return (
        <>
            <Head title="Welcome" />
            <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#FDFDFC] p-6 dark:bg-[#0a0a0a]">
                <div className="absolute right-6 top-6 flex items-center gap-2">
                    {auth.user ? (
                        <Link
                            href={dashboardUrl}
                            className="inline-flex items-center gap-2 rounded-md border border-[#19140035] px-3 py-2 text-sm text-[#1b1b18] hover:bg-[#19140010] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:bg-[#ffffff10]"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={login()}
                                className="rounded-md border border-[#19140035] px-4 py-2 text-sm text-[#1b1b18] hover:bg-[#19140010] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:bg-[#ffffff10]"
                            >
                                Log in
                            </Link>
                            <Link
                                href={register()}
                                className="rounded-md border border-[#19140035] px-4 py-2 text-sm text-[#1b1b18] hover:bg-[#19140010] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:bg-[#ffffff10]"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>
                <h1 className="mb-8 text-center text-4xl font-bold tracking-tight text-[#1b1b18] dark:text-[#EDEDEC] sm:text-5xl lg:text-6xl">
                    CFNHS Student Attendance System
                </h1>
                <img
                    src="/images/school_logo.png"
                    alt="CFNHS Logo"
                    className="h-48 w-auto sm:h-56 lg:h-64"
                />
            </div>
        </>
    );
}
