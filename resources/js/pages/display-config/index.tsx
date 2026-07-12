import { Head, useForm, usePage } from '@inertiajs/react';
import { Monitor } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { dashboard } from '@/routes';

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

export default function DisplayConfig({ settings }: Props) {
    const page = usePage();
    const teamSlug = page.props.currentTeam?.slug ?? '';

    const { data, setData, post, processing, errors } = useForm({
        welcome_enabled: settings.welcome_enabled,
        welcome_message: settings.welcome_message,
        clock_enabled: settings.clock_enabled,
        stats_enabled: settings.stats_enabled,
        media_enabled: settings.media_enabled,
        auto_switch_attendance: settings.auto_switch_attendance,
        refresh_interval: settings.refresh_interval,
        media: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/${teamSlug}/display-config`, {
            forceFormData: true,
        });
    };

    const mediaUrl = settings.media_path ? `/storage/${settings.media_path}` : null;

    return (
        <>
            <Head title="Display Config" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-2">
                    <Monitor className="h-6 w-6" />
                    <h1 className="text-2xl font-semibold">Display Configuration</h1>
                </div>
                <p className="text-sm text-muted-foreground">
                    Configure what appears on the monitor display page.
                </p>

                <div className="max-w-xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4 rounded-lg border p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Welcome Message</p>
                                    <p className="text-xs text-muted-foreground">Show a welcome banner on the display</p>
                                </div>
                                <label className="relative inline-flex cursor-pointer items-center">
                                    <input
                                        type="checkbox"
                                        checked={data.welcome_enabled}
                                        onChange={(e) => setData('welcome_enabled', e.target.checked)}
                                        className="peer sr-only"
                                    />
                                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-gray-700" />
                                </label>
                            </div>
                            {data.welcome_enabled && (
                                <div className="grid gap-2">
                                    <Label htmlFor="welcome_message">Welcome Message</Label>
                                    <Input
                                        id="welcome_message"
                                        value={data.welcome_message}
                                        onChange={(e) => setData('welcome_message', e.target.value)}
                                        placeholder="Welcome message text"
                                    />
                                    <InputError message={errors.welcome_message} />
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 rounded-lg border p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Clock</p>
                                    <p className="text-xs text-muted-foreground">Show live clock on the display</p>
                                </div>
                                <label className="relative inline-flex cursor-pointer items-center">
                                    <input
                                        type="checkbox"
                                        checked={data.clock_enabled}
                                        onChange={(e) => setData('clock_enabled', e.target.checked)}
                                        className="peer sr-only"
                                    />
                                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-gray-700" />
                                </label>
                            </div>
                        </div>

                        <div className="space-y-4 rounded-lg border p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">On-site Students</p>
                                    <p className="text-xs text-muted-foreground">Show stats cards (total, inside, absent)</p>
                                </div>
                                <label className="relative inline-flex cursor-pointer items-center">
                                    <input
                                        type="checkbox"
                                        checked={data.stats_enabled}
                                        onChange={(e) => setData('stats_enabled', e.target.checked)}
                                        className="peer sr-only"
                                    />
                                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-gray-700" />
                                </label>
                            </div>
                        </div>

                        <div className="space-y-4 rounded-lg border p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Media Display</p>
                                    <p className="text-xs text-muted-foreground">Show a photo or video clip on the display</p>
                                </div>
                                <label className="relative inline-flex cursor-pointer items-center">
                                    <input
                                        type="checkbox"
                                        checked={data.media_enabled}
                                        onChange={(e) => setData('media_enabled', e.target.checked)}
                                        className="peer sr-only"
                                    />
                                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-gray-700" />
                                </label>
                            </div>
                            {data.media_enabled && (
                                <div className="grid gap-2">
                                    {mediaUrl && (
                                        <div className="mb-2">
                                            {settings.media_type === 'video' ? (
                                                <video src={mediaUrl} className="max-h-48 rounded-lg" controls muted />
                                            ) : (
                                                <img src={mediaUrl} alt="Current media" className="max-h-48 rounded-lg object-cover" />
                                            )}
                                        </div>
                                    )}
                                    <Label htmlFor="media">Upload Photo/Video</Label>
                                    <Input
                                        id="media"
                                        type="file"
                                        accept="image/*,video/*"
                                        onChange={(e) => setData('media', e.target.files?.[0] ?? null)}
                                    />
                                    <p className="text-xs text-muted-foreground">Accepted: jpg, png, gif, mp4, mov, avi, webm. Max 50MB.</p>
                                    <InputError message={errors.media} />
                                </div>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label>Refresh Interval (seconds)</Label>
                            <Select
                                value={String(data.refresh_interval)}
                                onValueChange={(value) => setData('refresh_interval', Number(value))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select interval" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="3">3 seconds</SelectItem>
                                    <SelectItem value="5">5 seconds</SelectItem>
                                    <SelectItem value="10">10 seconds</SelectItem>
                                    <SelectItem value="15">15 seconds</SelectItem>
                                    <SelectItem value="30">30 seconds</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.refresh_interval} />
                        </div>

                        <div className="space-y-4 rounded-lg border p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Auto Switch Attendance Mode</p>
                                    <p className="text-xs text-muted-foreground">
                                        When enabled, the display shows media. When a QR code is scanned, media hides and a large toast shows the student details.
                                    </p>
                                </div>
                                <label className="relative inline-flex cursor-pointer items-center">
                                    <input
                                        type="checkbox"
                                        checked={data.auto_switch_attendance}
                                        onChange={(e) => setData('auto_switch_attendance', e.target.checked)}
                                        className="peer sr-only"
                                    />
                                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-gray-700" />
                                </label>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : 'Save Configuration'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.open('/monitor-display', '_blank')}
                            >
                                Open Display
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

DisplayConfig.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/' },
        { title: 'Display Config', href: props.currentTeam ? `/${props.currentTeam.slug}/display-config` : '#' },
    ],
});
