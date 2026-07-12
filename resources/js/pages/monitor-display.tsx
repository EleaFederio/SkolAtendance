import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

type Stats = {
    total_students: number;
    entered: number;
    absent: number;
};

type Entry = {
    id: number;
    type: 'in' | 'out';
    scanned_at: string;
    student: {
        id: number;
        first_name: string;
        last_name: string;
        middle_initial: string | null;
        grade_level: string;
        section: string;
        picture: string | null;
    };
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
    auto_switch_attendance: boolean;
};

type Props = {
    settings: Settings;
};

export default function MonitorDisplay({ settings }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [muted, setMuted] = useState(true);
    const [stats, setStats] = useState<Stats>({ total_students: 0, entered: 0, absent: 0 });
    const [currentTime, setCurrentTime] = useState(new Date());
    const [toasts, setToasts] = useState<Entry[]>([]);
    const [scanToast, setScanToast] = useState<Entry | null>(null);
    const seenIdsRef = useRef<Set<number>>(new Set());
    const initializedRef = useRef(false);
    const bufferRef = useRef('');

    const fetchData = async () => {
        try {
            const [statsRes, entriesRes] = await Promise.all([
                fetch('/api/monitor/stats'),
                fetch('/api/monitor/recent'),
            ]);
            const statsData = await statsRes.json();
            const entriesData = await entriesRes.json();
            setStats(statsData);

            if (!initializedRef.current) {
                entriesData.forEach((e: Entry) => seenIdsRef.current.add(e.id));
                initializedRef.current = true;
                return;
            }

            if (!settings.auto_switch_attendance) {
                const newEntries: Entry[] = entriesData.filter((e: Entry) => !seenIdsRef.current.has(e.id));
                if (newEntries.length > 0) {
                    newEntries.forEach((e) => seenIdsRef.current.add(e.id));
                    setToasts((prev) => [...newEntries.reverse(), ...prev].slice(0, 5));
                }
            }
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

    useEffect(() => {
        if (!settings.auto_switch_attendance) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                const code = bufferRef.current.trim();
                bufferRef.current = '';
                if (code) handleUsbScan(code);
            } else if (e.key.length === 1) {
                bufferRef.current += e.key;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [settings.auto_switch_attendance]);

    const handleUsbScan = async (qrCode: string) => {
        try {
            const res = await fetch('/api/monitor/check-in', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ qr_code: qrCode }),
            });
            const data = await res.json();
            if (!res.ok) return;

            setScanToast({
                id: data.attendance.id,
                type: data.attendance.type,
                scanned_at: data.attendance.scanned_at,
                student: data.student,
            });
            setTimeout(() => setScanToast(null), 5000);
        } catch {
            // silently fail
        }
    };

    useEffect(() => {
        if (toasts.length === 0) return;
        const timer = setTimeout(() => {
            setToasts((prev) => prev.slice(0, -1));
        }, 5000);
        return () => clearTimeout(timer);
    }, [toasts]);

    const removeToast = (id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const mediaUrl = settings.media_path ? `/storage/${settings.media_path}` : null;
    const getInitials = (first: string, last: string) => `${first[0]}${last[0]}`;

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

                    {settings.media_enabled && mediaUrl && !scanToast && (
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

                {scanToast && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                        <div className={`flex h-[80vh] w-[80vw] flex-col items-center justify-center gap-8 rounded-3xl shadow-2xl ${
                            scanToast.type === 'in' ? 'bg-green-600' : 'bg-orange-600'
                        }`}>
                            {scanToast.student.picture ? (
                                <img
                                    src={`/storage/${scanToast.student.picture}`}
                                    alt={scanToast.student.last_name}
                                    className="h-40 w-40 rounded-full border-4 border-white/30 object-cover"
                                />
                            ) : (
                                <div className="flex h-40 w-40 items-center justify-center rounded-full border-4 border-white/30 bg-white/20 text-5xl font-bold text-white">
                                    {getInitials(scanToast.student.first_name, scanToast.student.last_name)}
                                </div>
                            )}
                            <div className="text-center text-white">
                                <p className="text-5xl font-bold">
                                    {scanToast.student.last_name}, {scanToast.student.first_name}
                                </p>
                                <p className="mt-2 text-2xl opacity-80">
                                    {scanToast.student.grade_level} - {scanToast.student.section}
                                </p>
                            </div>
                            <span className="rounded-full bg-white/20 px-8 py-3 text-4xl font-bold uppercase text-white">
                                {scanToast.type === 'in' ? '✓ ATTEND' : '✗ LEAVE'}
                            </span>
                            <div className="text-center text-lg text-white opacity-70">
                                <p>{new Date(scanToast.scanned_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <p>{new Date(scanToast.scanned_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="fixed right-6 bottom-6 z-50 flex w-[35vw] flex-col gap-3">
                    {toasts.map((toast) => {
                        const scannedDate = new Date(toast.scanned_at);
                        return (
                            <div
                                key={toast.id}
                                onClick={() => removeToast(toast.id)}
                                className={`flex h-[40vh] flex-col items-center justify-center gap-5 rounded-2xl px-8 py-6 shadow-2xl transition-all duration-300 ${
                                    toast.type === 'in'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-orange-600 text-white'
                                }`}
                            >
                                {toast.student.picture ? (
                                    <img
                                        src={`/storage/${toast.student.picture}`}
                                        alt={toast.student.last_name}
                                        className="h-28 w-28 rounded-full border-2 border-white/30 object-cover"
                                    />
                                ) : (
                                    <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-white/30 bg-white/20 text-4xl font-bold">
                                        {getInitials(toast.student.first_name, toast.student.last_name)}
                                    </div>
                                )}
                                <div className="text-center">
                                    <p className="text-3xl font-bold">
                                        {toast.student.last_name}, {toast.student.first_name}
                                    </p>
                                    <p className="mt-1 text-lg opacity-80">
                                        {toast.student.grade_level} - {toast.student.section}
                                    </p>
                                </div>
                                <span className="rounded-full bg-white/20 px-6 py-2 text-3xl font-bold uppercase">
                                    {toast.type === 'in' ? '✓ IN' : '✗ OUT'}
                                </span>
                                <div className="text-center text-sm opacity-70">
                                    <p>{scannedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    <p>{scannedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
