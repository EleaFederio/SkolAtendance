import { Head, router, useForm, usePage } from '@inertiajs/react';
import { MessageSquare, Send } from 'lucide-react';
import { useState } from 'react';
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

type SmsSettings = {
    provider: string;
    api_key: string;
    api_secret: string;
    api_url: string;
    device_id: string;
    sender_number: string;
    enabled: boolean;
    message_attended: string;
    message_left: string;
};

type Props = {
    smsSettings: SmsSettings;
};

export default function SmsConfig({ smsSettings }: Props) {
    const page = usePage();
    const teamSlug = page.props.currentTeam?.slug ?? '';

    const { data, setData, post, processing, errors } = useForm({
        provider: smsSettings.provider || 'httpsms',
        api_key: smsSettings.api_key || '',
        api_secret: smsSettings.api_secret || '',
        api_url: smsSettings.api_url || '',
        device_id: smsSettings.device_id || '',
        sender_number: smsSettings.sender_number || '',
        enabled: smsSettings.enabled,
        message_attended: smsSettings.message_attended || 'CFNHS: {student_name} has arrived at school at {time}. Grade {grade} - {section}.',
        message_left: smsSettings.message_left || 'CFNHS: {student_name} has left school at {time}. Grade {grade} - {section}.',
    });

    const [testPhone, setTestPhone] = useState('');
    const [testSending, setTestSending] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/${teamSlug}/sms-config`);
    };

    const handleTestSms = () => {
        setTestSending(true);
        setTestResult(null);

        router.post(`/${teamSlug}/sms-config/test`, {
            provider: data.provider,
            api_key: data.api_key,
            api_secret: data.api_secret,
            api_url: data.api_url,
            device_id: data.device_id,
            sender_number: data.sender_number,
            test_phone: testPhone,
        }, {
            preserveScroll: true,
            onSuccess: (page) => {
                const flash = page.props.flash as { success?: string; error?: string } | undefined;
                if (flash?.success) {
                    setTestResult({ success: true, message: flash.success });
                } else if (flash?.error) {
                    setTestResult({ success: false, message: flash.error });
                }
                setTestSending(false);
            },
            onError: () => {
                setTestResult({ success: false, message: 'Failed to send test SMS. Check your settings.' });
                setTestSending(false);
            },
        });
    };

    return (
        <>
            <Head title="SMS Gateway Config" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-6 w-6" />
                    <h1 className="text-2xl font-semibold">SMS Gateway Configuration</h1>
                </div>
                <p className="text-sm text-muted-foreground">
                    Configure SMS gateway settings to send attendance notifications to guardians.
                </p>

                <div className="max-w-xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4 rounded-lg border p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Enable SMS Notifications</p>
                                    <p className="text-xs text-muted-foreground">Send SMS when students attend or leave</p>
                                </div>
                                <label className="relative inline-flex cursor-pointer items-center">
                                    <input
                                        type="checkbox"
                                        checked={data.enabled}
                                        onChange={(e) => setData('enabled', e.target.checked)}
                                        className="peer sr-only"
                                    />
                                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-gray-700" />
                                </label>
                            </div>
                        </div>

                        {data.enabled && (
                            <>
                                <div className="space-y-4 rounded-lg border p-4">
                                    <div className="grid gap-4">
                                        <div className="grid gap-2">
                                            <Label>SMS Provider</Label>
                                            <Select
                                                value={data.provider}
                                                onValueChange={(value) => setData('provider', value)}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select provider" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="httpsms">HTTPSMS</SelectItem>
                                                    <SelectItem value="smsgate">SMSGate</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.provider} />
                                        </div>

                                        {data.provider === 'smsgate' && (
                                            <div className="grid gap-2">
                                                <Label htmlFor="api_url">API URL</Label>
                                                <Input
                                                    id="api_url"
                                                    value={data.api_url}
                                                    onChange={(e) => setData('api_url', e.target.value)}
                                                    placeholder="https://api.sms-gate.app/3rdparty/v1"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Cloud: <code>https://api.sms-gate.app/3rdparty/v1</code> or Local: <code>http://&lt;phone-ip&gt;:3000/api</code>
                                                </p>
                                                <InputError message={errors.api_url} />
                                            </div>
                                        )}

                                        {data.provider === 'httpsms' && (
                                            <div className="grid gap-2">
                                                <Label htmlFor="api_key">API Key</Label>
                                                <Input
                                                    id="api_key"
                                                    value={data.api_key}
                                                    onChange={(e) => setData('api_key', e.target.value)}
                                                    placeholder="Enter your HTTPSMS API key"
                                                />
                                                <InputError message={errors.api_key} />
                                            </div>
                                        )}

                                        {data.provider === 'smsgate' && (
                                            <>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="api_key">Username</Label>
                                                    <Input
                                                        id="api_key"
                                                        value={data.api_key}
                                                        onChange={(e) => setData('api_key', e.target.value)}
                                                        placeholder="SMSGate username"
                                                    />
                                                    <InputError message={errors.api_key} />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="api_secret">Password</Label>
                                                    <Input
                                                        id="api_secret"
                                                        type="password"
                                                        value={data.api_secret}
                                                        onChange={(e) => setData('api_secret', e.target.value)}
                                                        placeholder="SMSGate password"
                                                    />
                                                    <InputError message={errors.api_secret} />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="device_id">Device ID</Label>
                                                    <Input
                                                        id="device_id"
                                                        value={data.device_id}
                                                        onChange={(e) => setData('device_id', e.target.value)}
                                                        placeholder="Enter device ID from the app"
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Found in SMSGate app under Settings &gt; Device ID
                                                    </p>
                                                    <InputError message={errors.device_id} />
                                                </div>
                                            </>
                                        )}

                                        <div className="grid gap-2">
                                            <Label htmlFor="sender_number">Phone Number</Label>
                                            <Input
                                                id="sender_number"
                                                value={data.sender_number}
                                                onChange={(e) => setData('sender_number', e.target.value)}
                                                placeholder="+639XXXXXXXXX"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                {data.provider === 'httpsms'
                                                    ? 'The phone number registered on HTTPSMS (with country code, e.g. +639123456789)'
                                                    : 'The SIM phone number to send from (with country code, e.g. +639123456789)'}
                                            </p>
                                            <InputError message={errors.sender_number} />
                                        </div>
                                    </div>
                                </div>

                                {data.provider === 'httpsms' && (
                                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                                        <p className="mb-2 text-sm font-medium text-blue-700 dark:text-blue-400">HTTPSMS Setup</p>
                                        <ol className="list-inside list-decimal space-y-1 text-xs text-blue-700 dark:text-blue-400">
                                            <li>Go to <a href="https://httpsms.app" target="_blank" className="underline">httpsms.app</a> and create an account</li>
                                            <li>Install the HTTPSMS app on your Android phone</li>
                                            <li>Login and copy your API key from the dashboard</li>
                                            <li>Paste your API key above and enter your phone number</li>
                                        </ol>
                                        <p className="mt-2 text-xs text-blue-700 dark:text-blue-400">
                                            SMS will be sent through your Android phone via the HTTPSMS app.
                                        </p>
                                    </div>
                                )}

                                {data.provider === 'smsgate' && (
                                    <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
                                        <p className="mb-2 text-sm font-medium text-purple-700 dark:text-purple-400">SMSGate Setup</p>
                                        <ol className="list-inside list-decimal space-y-1 text-xs text-purple-700 dark:text-purple-400">
                                            <li>Download SMSGate from <a href="https://sms-gate.app" target="_blank" className="underline">sms-gate.app</a> or <a href="https://github.com/capcom6/android-sms-gateway/releases/latest" target="_blank" className="underline">GitHub</a></li>
                                            <li>Install and open the app on your Android phone</li>
                                            <li>Choose <strong>Local</strong> mode (same Wi-Fi) or <strong>Cloud</strong> mode (anywhere)</li>
                                            <li>Set a username and password in the app settings</li>
                                            <li>Enter the API URL, username, and password above</li>
                                        </ol>
                                        <p className="mt-2 text-xs text-purple-700 dark:text-purple-400">
                                            Open-source, no registration required. Uses your phone's SIM card directly.
                                        </p>
                                    </div>
                                )}

                                <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                                    <p className="text-sm text-green-700 dark:text-green-400">
                                        SMS will be sent to the guardian phone number on file when a student attends or leaves school.
                                    </p>
                                </div>

                                <div className="space-y-4 rounded-lg border p-4">
                                    <div>
                                        <p className="font-medium">Message Templates</p>
                                        <p className="text-xs text-muted-foreground">Customize the SMS sent to guardians</p>
                                    </div>
                                    <div className="grid gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="message_attended">Student Arrived Message</Label>
                                            <textarea
                                                id="message_attended"
                                                value={data.message_attended}
                                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('message_attended', e.target.value)}
                                                rows={3}
                                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            />
                                            <InputError message={errors.message_attended} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="message_left">Student Left Message</Label>
                                            <textarea
                                                id="message_left"
                                                value={data.message_left}
                                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('message_left', e.target.value)}
                                                rows={3}
                                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            />
                                            <InputError message={errors.message_left} />
                                        </div>
                                    </div>
                                        <div className="rounded-lg bg-muted p-3">
                                        <p className="mb-1 text-xs font-medium">Available placeholders:</p>
                                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                            <code className="rounded bg-background px-1.5 py-0.5">{'{greeting}'}</code>
                                            <code className="rounded bg-background px-1.5 py-0.5">{'{student_name}'}</code>
                                            <code className="rounded bg-background px-1.5 py-0.5">{'{guardian_name}'}</code>
                                            <code className="rounded bg-background px-1.5 py-0.5">{'{time}'}</code>
                                            <code className="rounded bg-background px-1.5 py-0.5">{'{grade}'}</code>
                                            <code className="rounded bg-background px-1.5 py-0.5">{'{section}'}</code>
                                            <code className="rounded bg-background px-1.5 py-0.5">{'{school_name}'}</code>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 rounded-lg border p-4">
                                    <div>
                                        <p className="font-medium">Test SMS Gateway</p>
                                        <p className="text-xs text-muted-foreground">Send a test message to verify your settings work</p>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="test_phone">Test Phone Number</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="test_phone"
                                                value={testPhone}
                                                onChange={(e) => setTestPhone(e.target.value)}
                                                placeholder="+639XXXXXXXXX"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleTestSms}
                                                disabled={testSending || !testPhone}
                                            >
                                                <Send className="mr-2 h-4 w-4" />
                                                {testSending ? 'Sending...' : 'Send Test'}
                                            </Button>
                                        </div>
                                    </div>
                                    {testResult && (
                                        <div className={`rounded-lg border p-3 text-sm ${testResult.success
                                            ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400'
                                            : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400'
                                        }`}>
                                            {testResult.message}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        <div className="flex items-center gap-4">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : 'Save Configuration'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

SmsConfig.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/' },
        { title: 'SMS Gateway Config', href: '#' },
    ],
});
