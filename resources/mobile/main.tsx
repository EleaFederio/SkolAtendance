import '../css/app.css';
import { CapacitorBarcodeScanner, CapacitorBarcodeScannerTypeHint, CapacitorBarcodeScannerCameraDirection } from '@capacitor/barcode-scanner';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';

const API_URL_KEY = 'cfnhs_server_url';

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

function getApiBase(): string {
    const saved = localStorage.getItem(API_URL_KEY);
    if (saved) return saved.replace(/\/+$/, '');
    return '';
}

function getPictureUrl(path: string | null): string {
    if (!path) return '';
    const base = getApiBase();
    if (path.startsWith('http')) return path;
    return `${base}/storage/${path}`;
}

function App() {
    const [serverUrl, setServerUrl] = useState(() => localStorage.getItem(API_URL_KEY) || '');
    const [showSettings, setShowSettings] = useState(() => !localStorage.getItem(API_URL_KEY));
    const [tempUrl, setTempUrl] = useState(serverUrl);
    const [feedback, setFeedback] = useState<{ result: ScanResult; timestamp: number } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [scanCount, setScanCount] = useState(0);

    const saveServerUrl = () => {
        let url = tempUrl.trim().replace(/\/+$/, '');
        if (!url) return;
        if (!url.startsWith('http')) url = 'http://' + url;
        localStorage.setItem(API_URL_KEY, url);
        setServerUrl(url);
        setShowSettings(false);
    };

    const startScanner = async () => {
        setError(null);
        try {
            const result = await CapacitorBarcodeScanner.scanBarcode({
                hint: CapacitorBarcodeScannerTypeHint.ALL,
                scanInstructions: 'Point your camera at a student QR code',
                scanButton: false,
                cameraDirection: CapacitorBarcodeScannerCameraDirection.BACK,
            });

            if (result.ScanResult) {
                await handleScan(result.ScanResult);
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            if (!message.includes('cancelled') && !message.includes('User')) {
                setError('Scanner closed');
            }
        }
    };

    const handleScan = async (qrCode: string) => {
        const apiBase = getApiBase();
        if (!apiBase) {
            setError('Server URL not configured');
            setTimeout(() => setError(null), 3000);
            return;
        }

        try {
            const res = await fetch(`${apiBase}/api/monitor/check-in`, {
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
            setScanCount((c) => c + 1);
            setError(null);
            setTimeout(() => setFeedback(null), 4000);
        } catch {
            setError('Failed to connect to server');
            setTimeout(() => setError(null), 3000);
        }
    };

    const getInitials = (first: string, last: string) => `${first[0]}${last[0]}`;
    const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (showSettings) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 p-6 text-white">
                <div className="flex w-full max-w-sm flex-col items-center gap-6">
                    <img src="/images/school_logo.png" alt="CFNHS" className="h-20 w-auto" />
                    <h1 className="text-xl font-bold">CFNHS Scanner</h1>
                    <p className="text-center text-sm text-gray-400">Enter your server address to connect</p>
                    <input
                        type="text"
                        value={tempUrl}
                        onChange={(e) => setTempUrl(e.target.value)}
                        placeholder="http://192.168.0.102:8000"
                        className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-center text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        onKeyDown={(e) => e.key === 'Enter' && saveServerUrl()}
                    />
                    <button onClick={saveServerUrl} className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold transition hover:bg-blue-700 active:scale-95">
                        Connect
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-950 text-white">
            <header className="flex w-full items-center justify-between bg-gray-900 px-4 py-3">
                <div className="flex items-center gap-3">
                    <img src="/images/school_logo.png" alt="CFNHS" className="h-8 w-auto" />
                    <div>
                        <h1 className="text-sm font-bold">CFNHS Scanner</h1>
                        <p className="text-[10px] text-gray-500">{serverUrl}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {scanCount > 0 && (
                        <span className="rounded-full bg-green-600/20 px-2 py-0.5 text-[10px] font-semibold text-green-400">
                            {scanCount} scanned
                        </span>
                    )}
                    <button onClick={() => setShowSettings(true)} className="rounded-lg bg-gray-700 px-2.5 py-1.5 text-[10px] font-semibold transition hover:bg-gray-600">
                        Settings
                    </button>
                </div>
            </header>

            <main className="flex flex-1 flex-col items-center justify-center p-4">
                <div className="flex flex-col items-center gap-6">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" />
                            <path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                            <line x1="7" y1="12" x2="17" y2="12" /><line x1="7" y1="8" x2="17" y2="8" /><line x1="7" y1="16" x2="17" y2="16" />
                        </svg>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-semibold">Ready to Scan</p>
                        <p className="mt-1 text-sm text-gray-400">Tap the button to scan a student QR code</p>
                    </div>
                    <button onClick={startScanner} className="rounded-xl bg-blue-600 px-8 py-4 text-lg font-bold transition hover:bg-blue-700 active:scale-95">
                        Scan QR Code
                    </button>
                </div>

                {feedback && (
                    <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md p-4">
                        <div className={`flex items-center gap-4 rounded-2xl p-4 shadow-2xl ${feedback.result.attendance.type === 'in' ? 'bg-green-600' : 'bg-orange-600'}`}>
                            {feedback.result.student.picture ? (
                                <img src={getPictureUrl(feedback.result.student.picture)} alt={feedback.result.student.last_name} className="h-14 w-14 rounded-full border-2 border-white/30 object-cover" />
                            ) : (
                                <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/30 bg-white/20 text-lg font-bold">
                                    {getInitials(feedback.result.student.first_name, feedback.result.student.last_name)}
                                </div>
                            )}
                            <div className="flex-1">
                                <p className="text-lg font-bold">{feedback.result.student.last_name}, {feedback.result.student.first_name}</p>
                                <p className="text-xs opacity-80">{feedback.result.student.grade_level} - {feedback.result.student.section}</p>
                                <p className="text-xs opacity-70">{formatTime(feedback.result.attendance.scanned_at)}</p>
                            </div>
                            <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-bold uppercase">
                                {feedback.result.attendance.type === 'in' ? '✓ IN' : '✗ OUT'}
                            </span>
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
    );
}

createRoot(document.getElementById('root')!).render(<App />);
