import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

type Stats = {
    total_students: number;
    entered: number;
    absent: number;
};

type Settings = {
    welcome_enabled: boolean;
    welcome_message: string;
    clock_enabled: boolean;
    stats_enabled: boolean;
    media_path: string | null;
    media_type: string | null;
    media_enabled: boolean;
    refresh_interval: number;
};

type Props = {
    settings: Settings;
};

export default function MonitorDisplay({ settings }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [muted, setMuted] = useState(true);
    const [stats, setStats] = useState<Stats>({ total_students: 0, entered: 0, absent: 0 });
    const [currentTime, setCurrentTime] = useState(new Date());

    const fetchData = async () => {
        try {
            const statsRes = await fetch('/api/monitor/stats');
            const statsData = await statsRes.json();
            setStats(statsData);
        } catch {
            // silently fail
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, (settings.refresh_interval || 5) * 1000);
        return () => clearInterval(interval);
    }, [settings.refresh_interval]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const mediaUrl = settings.media_path ? `/storage/${settings.media_path}` : null;

    return (
        <>
            <Head title="School Monitor" />
            <div className="min-h-screen bg-[#FDFDFC] dark:bg-[#0a0a0a]">
                <header className="border-b border-[#19140035] bg-white px-6 py-4 dark:border-[#3E3E3A] dark:bg-[#0a0a0a]">
                    <div className="mx-auto flex max-w-7xl items-center justify-between">
                        <div className="flex items-center gap-4">
                            <img src="/images/school_logo.png" alt="CFNHS Logo" className="h-12 w-auto" />
                            <div>
                                <h1 className="text-xl font-bold text-[#1b1b18] dark:text-[#EDEDEC]">CFNHS Student Attendance System</h1>
                                {settings.welcome_enabled && (
                                    <p className="text-sm text-[#1b1b18]/60 dark:text-[#EDEDEC]/60">{settings.welcome_message}</p>
                                )}
                            </div>
                        </div>
                        {settings.clock_enabled && (
                            <div className="text-right">
                                <p className="text-2xl font-bold text-[#1b1b18] dark:text-[#EDEDEC]">
                                    {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </p>
                                <p className="text-sm text-[#1b1b18]/60 dark:text-[#EDEDEC]/60">
                                    {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        )}
                    </div>
                </header>

                <main className="mx-auto max-w-7xl p-6">
                    {settings.stats_enabled && (
                        <div className="mb-6 grid grid-cols-3 gap-4">
                            <div className="rounded-xl border border-[#19140035] bg-white p-3 text-center dark:border-[#3E3E3A] dark:bg-[#0a0a0a]">
                                <p className="text-2xl font-bold text-[#1b1b18] dark:text-[#EDEDEC]">{stats.total_students}</p>
                                <p className="text-xs text-[#1b1b18]/60 dark:text-[#EDEDEC]/60">Total Students</p>
                            </div>
                            <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-center dark:border-green-800 dark:bg-green-900/20">
                                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.entered}</p>
                                <p className="text-xs text-green-600 dark:text-green-500">Inside School</p>
                            </div>
                            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center dark:border-red-800 dark:bg-red-900/20">
                                <p className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.absent}</p>
                                <p className="text-xs text-red-600 dark:text-red-500">Not Yet Arrived</p>
                            </div>
                        </div>
                    )}

                    {settings.media_enabled && mediaUrl && (
                        <div className="relative mb-6 flex justify-center">
                            {settings.media_type === 'video' ? (
                                <>
                                    <video
                                        ref={videoRef}
                                        src={mediaUrl}
                                        className="max-h-[70vh] rounded-xl object-contain"
                                        autoPlay
                                        muted={muted}
                                        loop
                                        playsInline
                                    />
                                    <button
                                        onClick={() => setMuted(!muted)}
                                        className="absolute right-3 bottom-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
                                        title={muted ? 'Unmute' : 'Mute'}
                                    >
                                        {muted ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                                <line x1="23" y1="9" x2="17" y2="15" />
                                                <line x1="17" y1="9" x2="23" y2="15" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                                                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                                            </svg>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <img
                                    src={mediaUrl}
                                    alt="Display media"
                                    className="max-h-[70vh] rounded-xl object-contain"
                                />
                            )}
                        </div>
                    )}


                </main>
            </div>
        </>
    );
}
