"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
    LayoutDashboard,
    ClipboardCheck,
    Activity,
    Settings,
    ShieldCheck,
    ChevronRight,
    CircleCheck,
    PanelLeftClose,
} from "lucide-react";

const navigation = [
    {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        description: "Overview",
    },
    {
        name: "Inspections",
        href: "/inspections",
        icon: ClipboardCheck,
        description: "Manage inspections",
    },
    {
        name: "Monitoring",
        href: "/monitoring",
        icon: Activity,
        description: "Live activity",
    },
    {
        name: "Settings",
        href: "/settings",
        icon: Settings,
        description: "Account settings",
    },
];

const adminNavigation = {
    name: "Admin Dashboard",
    href: "/admin/dashboard",
    icon: ShieldCheck,
    description: "System overview",
};

export default function DashboardSidebar({
    onNavigate,
    user,
    mobile = false,
}) {
    const pathname = usePathname();

    const userName = user?.name || "Inspector";

    const userRole =
        user?.role === "admin"
            ? "Administrator"
            : "Inspector";

    const initials = userName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) =>
            word.charAt(0).toUpperCase()
        )
        .join("");

    const isAdmin = user?.role === "admin";

    const visibleNavigation = isAdmin
        ? [adminNavigation]
        : navigation;

    return (
        <aside
            className={
                mobile
                    ? "flex h-full w-full flex-col bg-[#0B1220] text-white"
                    : "fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-slate-800/80 bg-[#0B1220] text-white lg:flex"
            }
        >
            {/* =====================================================
                BRAND
            ====================================================== */}

            {!mobile && (
                <>
                    <div className="px-5 pb-5 pt-6">
                        <Link
                            href="/dashboard"
                            onClick={onNavigate}
                            className="group flex items-center gap-3 rounded-2xl px-2 py-1.5"
                        >
                            {/* Logo */}
                            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
                                <ShieldCheck
                                    size={21}
                                    strokeWidth={2}
                                />

                                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0B1220] bg-emerald-400" />
                            </div>

                            {/* Brand */}
                            <div className="min-w-0">
                                <p className="font-[Sora] text-[14px] font-semibold tracking-[-0.02em] text-white">
                                    Smart Inspection
                                </p>

                                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
                                    Monitoring Platform
                                </p>
                            </div>
                        </Link>
                    </div>

                    <div className="mx-5 h-px bg-slate-800/80" />
                </>
            )}

            {/* =====================================================
                NAVIGATION
            ====================================================== */}

            <nav
                className={`flex min-h-0 flex-1 flex-col px-3 ${mobile ? "py-6" : "py-7"
                    }`}
            >
                <div className="mb-3 px-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                        Workspace
                    </p>
                </div>

                <div className="space-y-1.5">
                    {visibleNavigation.map((item) => {
                        const Icon = item.icon;

                        const isActive =
                            pathname === item.href ||
                            (item.href !== "/dashboard" &&
                                pathname.startsWith(
                                    item.href
                                ));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onNavigate}
                                className={`group relative flex items-center gap-3 rounded-xl px-3 ${mobile
                                    ? "py-3.5"
                                    : "py-3"
                                    } transition-all duration-200 ${isActive
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
                                        : "text-slate-400 hover:bg-white/[0.045] hover:text-slate-100"
                                    }`}
                            >
                                {/* Active indicator */}
                                {isActive && (
                                    <span className="absolute -left-3 top-1/2 h-7 w-0.5 -translate-y-1/2 rounded-r-full bg-blue-400" />
                                )}

                                {/* Icon */}
                                <span
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${isActive
                                        ? "bg-white/10 text-white"
                                        : "bg-white/[0.035] text-slate-500 group-hover:bg-white/[0.07] group-hover:text-slate-200"
                                        }`}
                                >
                                    <Icon
                                        size={18}
                                        strokeWidth={1.9}
                                    />
                                </span>

                                {/* Text */}
                                <span className="min-w-0 flex-1">
                                    <span
                                        className={`block text-[13px] font-semibold ${isActive
                                            ? "text-white"
                                            : "text-slate-300 group-hover:text-white"
                                            }`}
                                    >
                                        {item.name}
                                    </span>

                                    <span
                                        className={`mt-0.5 block text-[10px] ${isActive
                                            ? "text-blue-100/70"
                                            : "text-slate-600 group-hover:text-slate-500"
                                            }`}
                                    >
                                        {item.description}
                                    </span>
                                </span>

                                {/* Arrow */}
                                <ChevronRight
                                    size={15}
                                    className={`shrink-0 transition-all duration-200 ${isActive
                                        ? "translate-x-0 text-blue-100/70"
                                        : "-translate-x-1 text-transparent group-hover:translate-x-0 group-hover:text-slate-600"
                                        }`}
                                />
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* =====================================================
                SYSTEM STATUS
            ====================================================== */}

            <div className="px-4 pb-4">
                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
                    <div className="flex items-center justify-between px-3.5 py-3">
                        <div className="flex items-center gap-2.5">
                            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
                                <CircleCheck
                                    size={15}
                                    className="text-emerald-400"
                                    strokeWidth={2}
                                />

                                <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                            </div>

                            <div>
                                <p className="text-[11px] font-semibold text-slate-200">
                                    System operational
                                </p>

                                <p className="mt-0.5 text-[9px] text-slate-600">
                                    All services running
                                </p>
                            </div>
                        </div>

                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    </div>

                    <div className="border-t border-slate-800 px-3.5 py-2.5">
                        <div className="flex items-center justify-between text-[9px]">
                            <span className="text-slate-600">
                                Inspection service
                            </span>

                            <span className="font-medium text-emerald-400">
                                Operational
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* =====================================================
                USER PROFILE
            ====================================================== */}

            <div className="border-t border-slate-800/80 p-4">
                <div className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-white/[0.035]">
                    {/* Avatar */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[11px] font-bold text-slate-300 ring-1 ring-slate-700">
                        {initials || "I"}
                    </div>

                    {/* User */}
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-semibold text-slate-200">
                            {userName}
                        </p>

                        <p className="mt-0.5 text-[10px] text-slate-600">
                            {userRole}
                        </p>
                    </div>

                    <PanelLeftClose
                        size={15}
                        className="text-slate-700 transition-colors group-hover:text-slate-500"
                    />
                </div>
            </div>
        </aside>
    );
}