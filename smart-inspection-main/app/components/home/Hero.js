"use client";

import {
    ArrowRight,
    Play,
    CheckCircle2,
    Activity,
    ClipboardCheck,
    MapPin,
    Camera,
    Clock3,
    ChevronRight,
} from "lucide-react";

export default function Hero() {
    return (
        <section
            id="home"
            className="relative overflow-hidden bg-slate-50"
        >
            {/* =====================================================
          BACKGROUND
      ===================================================== */}

            <div className="pointer-events-none absolute inset-0">
                {/* Very subtle ambient light */}
                <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-blue-500/[0.035] blur-[120px]" />

                <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-blue-400/[0.03] blur-[120px]" />

                {/* Subtle grid */}
                <div
                    className="absolute inset-0 opacity-[0.018]"
                    style={{
                        backgroundImage:
                            "linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)",
                        backgroundSize: "48px 48px",
                    }}
                />
            </div>

            {/* =====================================================
          CONTAINER
      ===================================================== */}

            <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-32 sm:px-6 sm:pb-12 lg:px-8 lg:pb-14 lg:pt-36">
                <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
                    {/* =================================================
              LEFT CONTENT
          ================================================= */}

                    <div className="relative z-10 max-w-xl">
                        {/* Eyebrow */}
                        <div className="mb-7 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                            Smart Inspection
                        </div>

                        {/* Heading */}
                        <h1 className="font-[family-name:var(--font-sora)] text-[2.9rem] font-bold leading-[1.04] tracking-[-0.055em] text-slate-950 sm:text-5xl md:text-6xl lg:text-[4.15rem]">
                            Make every
                            <span className="block">inspection</span>
                            <span className="block text-blue-600">smarter.</span>
                        </h1>

                        {/* Description */}
                        <p className="mt-7 max-w-lg text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                            A simple platform for digital inspections, real-time
                            monitoring, evidence collection and automated results.
                        </p>

                        {/* CTA */}
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <a
                                href="#get-started"
                                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(37,99,235,0.16)] transition-all duration-200 hover:bg-blue-700 hover:shadow-[0_10px_28px_rgba(37,99,235,0.2)]"
                            >
                                Get Started

                                <ArrowRight
                                    size={16}
                                    className="transition-transform duration-200 group-hover:translate-x-1"
                                />
                            </a>

                            <a
                                href="#how-it-works"
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50"
                            >
                                <Play
                                    size={13}
                                    fill="currentColor"
                                    className="text-slate-500"
                                />

                                See How It Works
                            </a>
                        </div>

                        {/* Trust points */}
                        <div className="mt-9 border-t border-slate-200 pt-6">
                            <div className="flex flex-wrap gap-x-6 gap-y-3">
                                <FeaturePoint>
                                    <CheckCircle2
                                        size={15}
                                        className="text-emerald-500"
                                    />
                                    Digital inspections
                                </FeaturePoint>

                                <FeaturePoint>
                                    <Activity
                                        size={15}
                                        className="text-blue-600"
                                    />
                                    Real-time monitoring
                                </FeaturePoint>

                                <FeaturePoint>
                                    <ClipboardCheck
                                        size={15}
                                        className="text-slate-500"
                                    />
                                    Automated results
                                </FeaturePoint>
                            </div>
                        </div>
                    </div>

                    {/* =================================================
              RIGHT — CLEAN PRODUCT PREVIEW
          ================================================= */}

                    <div className="relative">
                        {/* Very subtle backdrop */}
                        <div className="absolute -inset-6 rounded-[36px] bg-blue-500/[0.02] blur-3xl" />

                        {/* Main application window */}
                        <div className="relative mx-auto w-full max-w-[540px] overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_25px_70px_-35px_rgba(15,23,42,0.28)]">
                            {/* =========================================
                  APPLICATION HEADER
              ========================================= */}

                            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 sm:px-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
                                        <ClipboardCheck size={17} />
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">
                                            Smart Inspection
                                        </p>

                                        <p className="text-[10px] text-slate-400">
                                            Inspection management
                                        </p>
                                    </div>
                                </div>

                                <div className="hidden items-center gap-2 sm:flex">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                                    <span className="text-[10px] font-medium text-slate-500">
                                        System operational
                                    </span>
                                </div>
                            </div>

                            {/* =========================================
                  APPLICATION BODY
              ========================================= */}

                            <div className="p-4 sm:p-5">
                                {/* Page heading */}
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
                                            Current inspection
                                        </p>

                                        <h2 className="mt-1 font-[family-name:var(--font-sora)] text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
                                            Machine A-01
                                        </h2>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-400">
                                            Status
                                        </p>

                                        <p className="mt-1 text-xs font-semibold text-emerald-600">
                                            In progress
                                        </p>
                                    </div>
                                </div>

                                {/* Progress */}
                                <div className="mt-4">
                                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                                        <span>Inspection progress</span>

                                        <span className="font-semibold text-slate-600">
                                            75%
                                        </span>
                                    </div>

                                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                                        <div className="h-full w-3/4 rounded-full bg-blue-600" />
                                    </div>
                                </div>

                                {/* =====================================
                    CHECKLIST
                ===================================== */}

                                <div className="mt-5">
                                    <div className="mb-2.5 flex items-center justify-between">
                                        <p className="text-xs font-semibold text-slate-900">
                                            Inspection checklist
                                        </p>

                                        <p className="text-[10px] text-slate-400">
                                            3 of 4 completed
                                        </p>
                                    </div>

                                    <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                                        <ChecklistItem
                                            title="Electrical system"
                                            status="Passed"
                                            type="success"
                                        />

                                        <ChecklistItem
                                            title="Mechanical components"
                                            status="Passed"
                                            type="success"
                                        />

                                        <ChecklistItem
                                            title="Safety guards"
                                            status="Passed"
                                            type="success"
                                        />

                                        <ChecklistItem
                                            title="Temperature check"
                                            status="Review"
                                            type="warning"
                                        />
                                    </div>
                                </div>

                                {/* =====================================
                    EVIDENCE
                ===================================== */}

                                <div className="mt-4 grid grid-cols-2 gap-3">
                                    <InfoBox
                                        icon={Camera}
                                        label="Evidence"
                                        value="3 photos attached"
                                    />

                                    <InfoBox
                                        icon={MapPin}
                                        label="Location"
                                        value="GPS verified"
                                    />
                                </div>

                                {/* =====================================
                    AUTOMATION
                ===================================== */}

                                <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/50 p-3.5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
                                                <Activity size={16} />
                                            </div>

                                            <div>
                                                <p className="text-xs font-semibold text-slate-900">
                                                    Smart automation
                                                </p>

                                                <p className="mt-0.5 text-[10px] text-slate-500">
                                                    Inspection status is calculated automatically
                                                </p>
                                            </div>
                                        </div>

                                        <ChevronRight
                                            size={16}
                                            className="text-slate-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* =========================================
                  FOOTER
              ========================================= */}

                            <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-2.5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                        <Clock3 size={12} />
                                        Last updated just now
                                    </div>

                                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-600">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        Operational
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* =====================================================
            MOBILE PRODUCT FEATURES
        ===================================================== */}

                <div className="mt-6 grid grid-cols-3 gap-2 sm:hidden">
                    <MobileFeature
                        title="Inspect"
                        icon={ClipboardCheck}
                    />

                    <MobileFeature
                        title="Monitor"
                        icon={Activity}
                    />

                    <MobileFeature
                        title="Automate"
                        icon={CheckCircle2}
                    />
                </div>
            </div>
        </section>
    );
}

/* =====================================================
   FEATURE POINT
===================================================== */

function FeaturePoint({ children }) {
    return (
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            {children}
        </div>
    );
}

/* =====================================================
   CHECKLIST ITEM
===================================================== */

function ChecklistItem({
    title,
    status,
    type,
}) {
    const success = type === "success";

    return (
        <div className="flex items-center justify-between px-3.5 py-2.5">
            <div className="flex items-center gap-3">
                <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full ${success
                        ? "bg-emerald-50"
                        : "bg-amber-50"
                        }`}
                >
                    <CheckCircle2
                        size={13}
                        className={
                            success
                                ? "text-emerald-500"
                                : "text-amber-500"
                        }
                    />
                </div>

                <span className="text-xs font-medium text-slate-700">
                    {title}
                </span>
            </div>

            <span
                className={`text-[10px] font-semibold ${success
                    ? "text-emerald-600"
                    : "text-amber-600"
                    }`}
            >
                {status}
            </span>
        </div>
    );
}

/* =====================================================
   INFO BOX
===================================================== */

function InfoBox({
    icon: Icon,
    label,
    value,
}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <div className="flex items-center gap-2">
                <Icon
                    size={14}
                    className="text-slate-500"
                />

                <span className="text-[10px] font-medium text-slate-400">
                    {label}
                </span>
            </div>

            <p className="mt-1.5 text-xs font-semibold text-slate-800">
                {value}
            </p>
        </div>
    );
}

/* =====================================================
   MOBILE FEATURE
===================================================== */

function MobileFeature({
    title,
    icon: Icon,
}) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-2 py-3">
            <Icon
                size={16}
                className="text-blue-600"
            />

            <span className="mt-1.5 text-[10px] font-semibold text-slate-600">
                {title}
            </span>
        </div>
    );
}