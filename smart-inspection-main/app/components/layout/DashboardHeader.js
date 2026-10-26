"use client";

import {
    Bell,
    Menu,
    LogOut,
    ChevronDown,
    CalendarDays,
} from "lucide-react";

export default function DashboardHeader({
    user,
    title = "Dashboard",
    subtitle = "Inspector workspace",
    onMenuClick,
    onLogout,
}) {
    const userName = user?.name || "Inspector";

    const userRole =
        user?.role === "admin"
            ? "Administrator"
            : "Inspector";

    const initials = userName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word.charAt(0).toUpperCase())
        .join("");

    const today = new Intl.DateTimeFormat("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date());

    return (
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
            {/* =====================================================
                LEFT
            ====================================================== */}

            <div className="flex min-w-0 items-center gap-3">
                {/* Mobile Menu */}
                <button
                    type="button"
                    onClick={onMenuClick}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-95 lg:hidden"
                    aria-label="Open navigation"
                >
                    <Menu
                        size={19}
                        strokeWidth={2}
                    />
                </button>

                {/* Page Information */}
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h1 className="truncate font-[Sora] text-[15px] font-semibold tracking-[-0.02em] text-slate-900 sm:text-[16px]">
                            {title}
                        </h1>

                        <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />

                        <span className="hidden text-[11px] font-medium text-slate-400 sm:block">
                            {subtitle}
                        </span>
                    </div>

                    {/* Date */}
                    <div className="mt-1 hidden items-center gap-1.5 text-[10px] font-medium text-slate-400 sm:flex">
                        <CalendarDays
                            size={12}
                            strokeWidth={1.8}
                        />

                        <span>{today}</span>
                    </div>
                </div>
            </div>

            {/* =====================================================
                RIGHT
            ====================================================== */}

            <div className="flex items-center gap-1.5 sm:gap-3">
                {/* System Status */}
                <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 md:flex">
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />

                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>

                    <span className="text-[10px] font-semibold text-emerald-700">
                        System operational
                    </span>
                </div>

                {/* Divider */}
                <div className="hidden h-8 w-px bg-slate-200 sm:block" />

                {/* Notifications */}
                <button
                    type="button"
                    className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-slate-500 transition-all duration-200 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900 active:scale-95"
                    aria-label="Notifications"
                >
                    <Bell
                        size={18}
                        strokeWidth={1.9}
                        className="transition-transform duration-200 group-hover:scale-105"
                    />

                    {/* Notification indicator */}
                    <span className="absolute right-[9px] top-[8px] h-1.5 w-1.5 rounded-full border border-white bg-blue-600" />
                </button>

                {/* Divider */}
                <div className="hidden h-8 w-px bg-slate-200 sm:block" />

                {/* =================================================
                    USER
                ================================================== */}

                <div className="flex items-center">
                    {/* User Profile */}
                    <div className="group flex items-center gap-2 rounded-xl px-1.5 py-1.5">
                        {/* Avatar */}
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[11px] font-bold text-blue-700 ring-1 ring-blue-100">
                            {initials || "I"}
                        </div>

                        {/* User Details */}
                        <div className="hidden min-w-0 text-left sm:block">
                            <p className="max-w-[140px] truncate text-[12px] font-semibold text-slate-800">
                                {userName}
                            </p>

                            <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                                {userRole}
                            </p>
                        </div>

                        <ChevronDown
                            size={14}
                            strokeWidth={1.8}
                            className="hidden text-slate-400 transition-colors duration-200 group-hover:text-slate-600 sm:block"
                        />
                    </div>

                    {/* Logout */}
                    <button
                        type="button"
                        onClick={onLogout}
                        className="ml-1 flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all duration-200 hover:bg-red-50 hover:text-red-600 active:scale-95"
                        title="Logout"
                        aria-label="Logout"
                    >
                        <LogOut
                            size={16}
                            strokeWidth={1.9}
                        />
                    </button>
                </div>
            </div>
        </header>
    );
}