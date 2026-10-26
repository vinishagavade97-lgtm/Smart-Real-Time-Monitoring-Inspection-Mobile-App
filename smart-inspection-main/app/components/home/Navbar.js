"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ClipboardCheck,
    Menu,
    X,
    ArrowRight,
    House,
    Sparkles,
    Workflow,
    Activity,
    Info,
    LogIn,
    ChevronRight,
} from "lucide-react";

const navLinks = [
    {
        label: "Home",
        href: "#home",
        icon: House,
    },
    {
        label: "Features",
        href: "#features",
        icon: Sparkles,
    },
    {
        label: "How It Works",
        href: "#how-it-works",
        icon: Workflow,
    },
    {
        label: "Monitoring",
        href: "#monitoring",
        icon: Activity,
    },
    {
        label: "About",
        href: "#about",
        icon: Info,
    },
];

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    return (
        <>
            {/* =====================================================
                NAVBAR
            ===================================================== */}

            <header className="fixed inset-x-0 top-0 z-50">
                <div className="mx-auto max-w-7xl px-3 pt-3 sm:px-6 sm:pt-4 lg:px-8">

                    <nav className="rounded-2xl border border-slate-200/80 bg-white/95 px-3 py-2.5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:px-5 sm:py-3">

                        <div className="flex items-center justify-between">

                            {/* =====================================================
                                LOGO
                            ===================================================== */}

                            <Link
                                href="/"
                                onClick={closeMobileMenu}
                                className="group flex items-center gap-2.5 sm:gap-3"
                            >
                                {/* Icon */}
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20 transition-all duration-200 group-hover:bg-blue-700 sm:h-10 sm:w-10">
                                    <ClipboardCheck
                                        size={20}
                                        strokeWidth={2.2}
                                    />
                                </div>

                                {/* Brand */}
                                <div>
                                    <p className="font-[family-name:var(--font-sora)] text-sm font-bold tracking-tight text-slate-950 sm:text-base">
                                        Smart Inspection
                                    </p>

                                    <p className="hidden text-[9px] font-medium uppercase tracking-[0.16em] text-slate-400 sm:block">
                                        Smart Automation
                                    </p>
                                </div>
                            </Link>

                            {/* =====================================================
                                DESKTOP NAVIGATION
                            ===================================================== */}

                            <div className="hidden items-center gap-1 lg:flex">

                                {navLinks.map((link) => {
                                    const Icon = link.icon;

                                    return (
                                        <a
                                            key={link.label}
                                            href={link.href}
                                            className="group flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:text-slate-950"
                                        >
                                            <Icon
                                                size={16}
                                                strokeWidth={1.9}
                                                className="text-slate-400 transition-colors group-hover:text-blue-600"
                                            />

                                            <span>
                                                {link.label}
                                            </span>
                                        </a>
                                    );
                                })}

                            </div>

                            {/* =====================================================
                                DESKTOP ACTIONS
                            ===================================================== */}

                            <div className="hidden items-center gap-2 sm:flex">

                                <Link
                                    href="/login"
                                    className="group flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-50 hover:text-slate-950"
                                >
                                    <LogIn
                                        size={16}
                                        strokeWidth={2}
                                        className="text-slate-400 transition-colors group-hover:text-blue-600"
                                    />

                                    Sign In
                                </Link>

                                <Link
                                    href="/register"
                                    className="group flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-600 hover:shadow-md hover:shadow-blue-600/20"
                                >
                                    Get Started

                                    <ArrowRight
                                        size={15}
                                        strokeWidth={2}
                                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                                    />
                                </Link>

                            </div>

                            {/* =====================================================
                                MOBILE MENU BUTTON
                            ===================================================== */}

                            <button
                                type="button"
                                onClick={() =>
                                    setMobileMenuOpen(!mobileMenuOpen)
                                }
                                aria-label={
                                    mobileMenuOpen
                                        ? "Close menu"
                                        : "Open menu"
                                }
                                aria-expanded={mobileMenuOpen}
                                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all duration-200 sm:hidden ${mobileMenuOpen
                                    ? "border-slate-200 bg-slate-100 text-slate-900"
                                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                    }`}
                            >
                                {mobileMenuOpen ? (
                                    <X
                                        size={18}
                                        strokeWidth={2}
                                    />
                                ) : (
                                    <Menu
                                        size={18}
                                        strokeWidth={2}
                                    />
                                )}

                                <span>
                                    {mobileMenuOpen
                                        ? "Close"
                                        : "Menu"}
                                </span>
                            </button>

                        </div>

                    </nav>
                </div>
            </header>

            {/* =====================================================
                MOBILE MENU OVERLAY
            ===================================================== */}

            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[2px] sm:hidden"
                    onClick={closeMobileMenu}
                />
            )}

            {/* =====================================================
                MOBILE MENU PANEL
            ===================================================== */}

            <div
                className={`fixed inset-x-3 top-[76px] z-50 sm:hidden ${mobileMenuOpen
                    ? "pointer-events-auto opacity-100"
                    : "pointer-events-none opacity-0"
                    }`}
            >
                <div
                    className={`overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.16)] transition-all duration-200 ${mobileMenuOpen
                        ? "translate-y-0 scale-100"
                        : "-translate-y-2 scale-[0.98]"
                        }`}
                    onClick={(e) => e.stopPropagation()}
                >

                    {/* =================================================
                        MENU HEADER
                    ================================================= */}

                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-600">
                                Navigation
                            </p>

                            <p className="mt-0.5 font-[family-name:var(--font-sora)] text-sm font-semibold text-slate-950">
                                Smart Inspection
                            </p>
                        </div>

                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <ClipboardCheck size={16} />
                        </div>

                    </div>

                    {/* =================================================
                        NAVIGATION LINKS
                    ================================================= */}

                    <div className="px-3 py-3">

                        {navLinks.map((link, index) => {
                            const Icon = link.icon;

                            return (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    onClick={closeMobileMenu}
                                    className="group flex items-center gap-3 rounded-2xl px-3 py-3.5 transition-colors duration-200 hover:bg-slate-50 active:bg-slate-100"
                                >
                                    {/* Icon */}
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition-all duration-200 group-hover:bg-blue-50 group-hover:text-blue-600">
                                        <Icon
                                            size={18}
                                            strokeWidth={1.9}
                                        />
                                    </span>

                                    {/* Text */}
                                    <span className="flex-1">
                                        <span className="block text-sm font-semibold text-slate-800">
                                            {link.label}
                                        </span>

                                        <span className="mt-0.5 block text-[11px] text-slate-400">
                                            {getLinkDescription(link.label)}
                                        </span>
                                    </span>

                                    {/* Arrow */}
                                    <ChevronRight
                                        size={17}
                                        className="text-slate-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-blue-500"
                                    />
                                </a>
                            );
                        })}

                    </div>

                    {/* =================================================
                        AUTH ACTIONS
                    ================================================= */}

                    <div className="border-t border-slate-100 bg-slate-50/70 p-3">

                        <div className="grid grid-cols-2 gap-2.5">

                            {/* Sign In */}
                            <Link
                                href="/login"
                                onClick={closeMobileMenu}
                                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50"
                            >
                                <LogIn size={16} />

                                Sign In
                            </Link>

                            {/* Get Started */}
                            <Link
                                href="/register"
                                onClick={closeMobileMenu}
                                className="group flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-all duration-200 hover:bg-blue-700"
                            >
                                Get Started

                                <ArrowRight
                                    size={15}
                                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                                />
                            </Link>

                        </div>

                        {/* Small Brand Footer */}
                        <div className="mt-3 flex items-center justify-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                            <span className="text-[10px] font-medium text-slate-400">
                                Smart inspection platform
                            </span>
                        </div>

                    </div>

                </div>
            </div>
        </>
    );
}

/* =====================================================
   MOBILE LINK DESCRIPTIONS
===================================================== */

function getLinkDescription(label) {
    switch (label) {
        case "Home":
            return "Overview of Smart Inspection";

        case "Features":
            return "Explore platform capabilities";

        case "How It Works":
            return "See the inspection workflow";

        case "Monitoring":
            return "View inspection activity";

        case "About":
            return "Learn about the platform";

        default:
            return "";
    }
}