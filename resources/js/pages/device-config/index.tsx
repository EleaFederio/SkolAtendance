import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

type ScanFeedback = {
    student: {
        first_name: string;
        last_name: string;
        middle_initial: string | null;
        grade_level: string;
        section: string;
        picture: string | null;
    };
    attendance: {
        type: 'in' | 'out';
        scanned_at: string;
    };
};

export default function DeviceConfig() {
    const scanUrl = `${window.location.origin}/scan-attendance`;
    const [scannerEnabled, setScannerEnabled] = useState(false);
    const [feedback, setFeedback] = useState<ScanFeedback | null>(null);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const bufferRef = useRef('');

    useEffect(() => {
        if (!scannerEnabled) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                const code = bufferRef.current.trim();
                bufferRef.current = '';
                if (code) handleScan(code);
            } else if (e.key.length === 1) {
                bufferRef.current += e.key;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        inputRef.current?.focus();

        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [scannerEnabled]);

    useEffect(() => {
        if (scannerEnabled) inputRef.current?.focus();
    }, [scannerEnabled]);

    const handleScan = async (qrCode: string) => {
        try {
            const res = await fetch('/api/monitor/check-in', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ qr_code: qrCode }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Unknown error');
                setFeedback(null);
                setTimeout(() => setError(null), 3000);
                return;
            }

            setFeedback(data);
            setError(null);
            setTimeout(() => setFeedback(null), 4000);
        } catch {
            setError('Failed to connect to server');
            setFeedback(null);
            setTimeout(() => setError(null), 3000);
        }
    };

    const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const getInitials = (first: string, last: string) => `${first[0]}${last[0]}`;

    return (
        <>
            <Head title="Device Config" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <h1 className="text-2xl font-semibold">Device Configuration</h1>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className="flex h-full flex-col items-center justify-center gap-8 p-8">
                        <div className="flex flex-col items-center gap-3">
                            <a
                                href={scanUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-95"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                                    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                                    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                                    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                                    <line x1="7" y1="12" x2="17" y2="12" />
                                    <line x1="7" y1="8" x2="17" y2="8" />
                                    <line x1="7" y1="16" x2="17" y2="16" />
                                </svg>
                                Scan via Phone
                            </a>
                            <p className="max-w-xs text-center text-xs text-muted-foreground">
                                Open this page on your phone to start scanning student QR codes.
                            </p>
                        </div>

                        <div className="h-px w-full max-w-sm bg-border" />

                        <div className="flex flex-col items-center gap-4">
                            <div className="flex items-center gap-3">
                                <label className="text-sm font-medium">USB QR Scanner</label>
                                <button
                                    onClick={() => setScannerEnabled(!scannerEnabled)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                                        scannerEnabled ? 'bg-blue-600' : 'bg-muted'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                            scannerEnabled ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>
                            <p className="max-w-xs text-center text-xs text-muted-foreground">
                                Connect a USB QR scanner and enable this to scan student QR codes directly from this page.
                            </p>

                            {scannerEnabled && (
                                <div className="mt-2 flex flex-col items-center gap-3">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        className="w-64 rounded-lg border border-border bg-muted px-4 py-3 text-center text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                        placeholder="Waiting for scanner input..."
                                        readOnly
                                        tabIndex={-1}
                                    />
                                    <p className="text-xs text-green-600 dark:text-green-400">
                                        Scanner active — scan a QR code now
                                    </p>
                                </div>
                            )}
                        </div>

                        {feedback && (
                            <div className={`fixed inset-x-0 bottom-0 mx-auto max-w-md p-4 ${
                                feedback.attendance.type === 'in' ? 'text-green-700 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                            }`}>
                                <div className={`flex items-center gap-4 rounded-2xl p-4 shadow-2xl ${
                                    feedback.attendance.type === 'in'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-orange-600 text-white'
                                }`}>
                                    {feedback.student.picture ? (
                                        <img
                                            src={`/storage/${feedback.student.picture}`}
                                            alt={feedback.student.last_name}
                                            className="h-14 w-14 rounded-full border-2 border-white/30 object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/30 bg-white/20 text-lg font-bold">
                                            {getInitials(feedback.student.first_name, feedback.student.last_name)}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="text-lg font-bold">
                                            {feedback.student.last_name}, {feedback.student.first_name}
                                        </p>
                                        <p className="text-xs opacity-80">
                                            {feedback.student.grade_level} - {feedback.student.section}
                                        </p>
                                        <p className="text-xs opacity-70">
                                            {formatTime(feedback.attendance.scanned_at)}
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-bold uppercase">
                                        {feedback.attendance.type === 'in' ? '✓ IN' : '✗ OUT'}
                                    </span>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md p-4">
                                <div className="rounded-2xl bg-red-600 p-4 text-center text-white shadow-2xl">
                                    <p className="font-semibold">{error}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

DeviceConfig.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: props.currentTeam ? `/dashboard` : '/' },
        { title: 'Device Config', href: '#' },
    ],
});
