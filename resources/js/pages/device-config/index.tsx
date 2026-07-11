import { Head } from '@inertiajs/react';

export default function DeviceConfig() {
    return (
        <>
            <Head title="Device Config" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <h1 className="text-2xl font-semibold">Device Configuration</h1>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className="flex h-full items-center justify-center p-8 text-muted-foreground">
                        Device configuration settings will appear here.
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
