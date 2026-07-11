import { Head } from '@inertiajs/react';
import { Html5Qrcode } from 'html5-qrcode';
import { useEffect, useRef, useState } from 'react';

type ScanResult = {
    student: {
        id: number;
        first_name: string;
        last_name: string;
        middle_initial: string | null;
        grade_level: string;
        section: string;
        picture: string | null;
    };
    attendance: {
        id: number;
        type: 'in' | 'out';
        scanned_at: string;
    };
};

type Feedback = {
    result: ScanResult;
    timestamp: number;
};

export default function ScanAttendance() {
    const [scanning, setScanning] = useState(false);
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [cameraReady, setCameraReady] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return () => {
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(() => {});
            }
        };
    }, []);

    const startScanner = async () => {
        if (!containerRef.current) return;

        setScanning(true);
        setError(null);

        try {
            const scanner = new Html5Qrcode('qr-reader');
            scannerRef.current = scanner;

            await scanner.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                },
                async (decodedText) => {
                    if (scannerRef.current?.isScanning) {
                        await scannerRef.current.pause();
                    }
                    await handleScan(decodedText);
                    if (scannerRef.current && !scannerRef.current.isScanning) {
                        try {
                            await scannerRef.current.resume();
                        } catch {}
                    }
                },
                () => {}
            );

            setCameraReady(true);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            if (message.includes('NotAllowedError') || message.includes('Permission')) {
                setError('Camera permission denied. Please allow camera access and try again.');
            } else {
                setError('Unable to start camera. Make sure you are using HTTPS or localhost.');
            }
            setScanning(false);
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            try {
                await scannerRef.current.stop();
            } catch {}
        }
        setCameraReady(false);
        setScanning(false);
    };

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

            setFeedback({ result: data, timestamp: Date.now() });
            setError(null);
            setTimeout(() => setFeedback(null), 4000);
        } catch {
            setError('Failed to connect to server');
            setFeedback(null);
            setTimeout(() => setError(null), 3000);
        }
    };

    const getInitials = (first: string, last: string) => `${first[0]}${last[0]}`;
    const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return (
        <>
            <Head title="Scan Attendance" />
            <div className="flex min-h-screen flex-col items-center bg-gray-950 text-white">
                <header className="flex w-full items-center justify-between bg-gray-900 px-4 py-3">
                    <div className="flex items-center gap-3">
                        <img src="/images/school_logo.png" alt="CFNHS" className="h-8 w-auto" />
                        <h1 className="text-sm font-bold">Scan Attendance</h1>
                    </div>
                    {scanning && (
                        <button
                            onClick={stopScanner}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold transition hover:bg-red-700"
                        >
                            Stop
                        </button>
                    )}
                </header>

                <main className="flex flex-1 flex-col items-center justify-center p-4">
                    {!scanning ? (
                        <div className="flex flex-col items-center gap-6">
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-800">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                                    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                                    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                                    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                                    <line x1="7" y1="12" x2="17" y2="12" />
                                    <line x1="7" y1="8" x2="17" y2="8" />
                                    <line x1="7" y1="16" x2="17" y2="16" />
                                </svg>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-semibold">Ready to Scan</p>
                                <p className="mt-1 text-sm text-gray-400">Tap the button below to start scanning QR codes</p>
                            </div>
                            <button
                                onClick={startScanner}
                                className="rounded-xl bg-blue-600 px-8 py-4 text-lg font-bold transition hover:bg-blue-700 active:scale-95"
                            >
                                Start Scanner
                            </button>
                        </div>
                    ) : (
                        <div className="flex w-full max-w-md flex-col items-center gap-4">
                            <div id="qr-reader" ref={containerRef} className="w-full overflow-hidden rounded-xl" />
                            {!cameraReady && (
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Starting camera...
                                </div>
                            )}
                        </div>
                    )}

                    {feedback && (
                        <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md p-4">
                            <div className={`flex items-center gap-4 rounded-2xl p-4 shadow-2xl ${
                                feedback.result.attendance.type === 'in'
                                    ? 'bg-green-600'
                                    : 'bg-orange-600'
                            }`}>
                                {feedback.result.student.picture ? (
                                    <img
                                        src={`/storage/${feedback.result.student.picture}`}
                                        alt={feedback.result.student.last_name}
                                        className="h-14 w-14 rounded-full border-2 border-white/30 object-cover"
                                    />
                                ) : (
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/30 bg-white/20 text-lg font-bold">
                                        {getInitials(feedback.result.student.first_name, feedback.result.student.last_name)}
                                    </div>
                                )}
                                <div className="flex-1">
                                    <p className="text-lg font-bold">
                                        {feedback.result.student.last_name}, {feedback.result.student.first_name}
                                    </p>
                                    <p className="text-xs opacity-80">
                                        {feedback.result.student.grade_level} - {feedback.result.student.section}
                                    </p>
                                    <p className="text-xs opacity-70">
                                        {formatTime(feedback.result.attendance.scanned_at)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-bold uppercase">
                                        {feedback.result.attendance.type === 'in' ? '✓ IN' : '✗ OUT'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md p-4">
                            <div className="rounded-2xl bg-red-600 p-4 text-center shadow-2xl">
                                <p className="font-semibold">{error}</p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
