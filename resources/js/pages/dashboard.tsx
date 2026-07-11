import { Head } from '@inertiajs/react';
import { Users, UserCheck, UserX } from 'lucide-react';
import { useEffect, useState } from 'react';
import PendingInvitationsModal from '@/components/pending-invitations-modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';
import type { DashboardInvitation } from '@/types';

type OnsiteStudent = {
    id: number;
    first_name: string;
    last_name: string;
    middle_initial: string | null;
    grade_level: string;
    section: string;
    picture: string | null;
    arrived_at: string | null;
};

type Stats = {
    total_students: number;
    entered: number;
    absent: number;
};

type Props = {
    pendingInvitations?: DashboardInvitation[];
    totalStudents?: number;
};

export default function Dashboard({ pendingInvitations = [], totalStudents = 0 }: Props) {
    const [showInvitations, setShowInvitations] = useState(
        pendingInvitations.length > 0,
    );
    const [stats, setStats] = useState<Stats>({ total_students: totalStudents, entered: 0, absent: 0 });
    const [onsiteStudents, setOnsiteStudents] = useState<OnsiteStudent[]>([]);

    const fetchData = async () => {
        try {
            const [statsRes, onsiteRes] = await Promise.all([
                fetch('/api/monitor/stats'),
                fetch('/api/monitor/onsite'),
            ]);
            const statsData = await statsRes.json();
            const onsiteData = await onsiteRes.json();
            setStats(statsData);
            setOnsiteStudents(onsiteData);
        } catch {
            // silently fail
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const getInitials = (first: string, last: string) => `${first[0]}${last[0]}`;

    return (
        <>
            <Head title="Dashboard" />
            <PendingInvitationsModal
                invitations={pendingInvitations}
                open={pendingInvitations.length > 0 && showInvitations}
                onOpenChange={setShowInvitations}
            />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                On-Site Students
                            </CardTitle>
                            <UserCheck className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.entered}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Absent Students
                            </CardTitle>
                            <UserX className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.absent}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total No. of Students
                            </CardTitle>
                            <Users className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.total_students}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">On-Site Students ({onsiteStudents.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {onsiteStudents.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">No students on-site yet today.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-muted-foreground">
                                            <th className="pb-2 pr-4 font-medium">Student</th>
                                            <th className="pb-2 pr-4 font-medium">Grade & Section</th>
                                            <th className="pb-2 font-medium">Time Arrived</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {onsiteStudents.map((student) => (
                                            <tr key={student.id} className="border-b last:border-0">
                                                <td className="flex items-center gap-3 py-3 pr-4">
                                                    {student.picture ? (
                                                        <img
                                                            src={`/storage/${student.picture}`}
                                                            alt={`${student.first_name} ${student.last_name}`}
                                                            className="h-9 w-9 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-bold">
                                                            {getInitials(student.first_name, student.last_name)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-medium">
                                                            {student.last_name}, {student.first_name}
                                                            {student.middle_initial ? ` ${student.middle_initial}.` : ''}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="py-3 pr-4 text-muted-foreground">
                                                    {student.grade_level} - {student.section}
                                                </td>
                                                <td className="py-3 tabular-nums">
                                                    {student.arrived_at ? formatTime(student.arrived_at) : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Dashboard.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/',
        },
    ],
});
