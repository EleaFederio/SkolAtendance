import { Head } from '@inertiajs/react';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFDFC] p-6 dark:bg-[#0a0a0a]">
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
