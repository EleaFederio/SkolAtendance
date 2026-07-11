import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Monitor, Settings, Users } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { records } from '@/routes/students';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const page = usePage();
    const user = page.props.auth?.user;
    const isSuperUser = user?.role === 'super-user';
    const dashboardUrl = page.props.currentTeam
        ? dashboard(page.props.currentTeam.slug)
        : '/';

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboardUrl,
            icon: LayoutGrid,
        },
        {
            title: 'Students',
            href: page.props.currentTeam ? records(page.props.currentTeam.slug) : '/',
            icon: Users,
        },
    ];

    if (isSuperUser) {
        mainNavItems.push({
            title: 'Device Config',
            href: page.props.currentTeam ? `/${page.props.currentTeam.slug}/device-config` : '/',
            icon: Settings,
        });
        mainNavItems.push({
            title: 'Display Config',
            href: page.props.currentTeam ? `/${page.props.currentTeam.slug}/display-config` : '/',
            icon: Monitor,
        });
    }

    const footerNavItems: NavItem[] = [];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
