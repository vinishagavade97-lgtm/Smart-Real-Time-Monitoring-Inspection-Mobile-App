"use client";

import Link from "next/link";

import DashboardSidebar from "./DashboardSidebar";

import {
    X,
    ShieldCheck,
} from "lucide-react";

export default function MobileSidebar({
    open,
    onClose,
    user,
}) {
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[100] lg:hidden">
            {/* =====================================================
                BACKDROP
            ====================================================== */}

            <button
                type="button"
                onClick={onClose}
                className="absolute inset-0 cursor-default bg-slate-950/60 backdrop-blur-[3px]"
                aria-label="Close navigation"
            />

            {/* =====================================================
                MOBILE DRAWER
            ====================================================== */}

            <aside
                className="absolute left-0 top-0 flex h-dvh w-[300px] max-w-[88vw] flex-col bg-[#0B1220] shadow-[20px_0_60px_rgba(15,23,42,0.25)]"
                style={{
                    animation:
                        "mobileDrawerIn 220ms cubic-bezier(0.22, 1, 0.36, 1)",
                }}
            >
                {/* =================================================
                    MOBILE HEADER
                ================================================== */}

                <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-slate-800/80 px-5">
                    {/* Brand */}
                    <Link
                        href="/dashboard"
                        onClick={onClose}
                        className="flex items-center gap-3"
                    >
                        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
                            <ShieldCheck
                                size={19}
                                strokeWidth={2}
                            />

                            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0B1220] bg-emerald-400" />
                        </div>

                        <div>
                            <p className="font-[Sora] text-[13px] font-semibold tracking-tight text-white">
                                Smart Inspection
                            </p>

                            <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.12em] text-slate-500">
                                Monitoring Platform
                            </p>
                        </div>
                    </Link>

                    {/* Close */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition-all duration-200 hover:border-slate-700 hover:bg-slate-800 hover:text-white active:scale-95"
                        aria-label="Close navigation"
                    >
                        <X
                            size={17}
                            strokeWidth={2}
                        />
                    </button>
                </div>

                {/* =================================================
                    NAVIGATION
                ================================================== */}

                <div className="min-h-0 flex-1 overflow-y-auto">
                    <DashboardSidebar
                        user={user}
                        onNavigate={onClose}
                        mobile
                    />
                </div>
            </aside>
        </div>
    );
}