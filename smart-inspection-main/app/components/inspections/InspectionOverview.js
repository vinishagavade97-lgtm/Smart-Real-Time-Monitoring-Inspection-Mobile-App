"use client";

import Link from "next/link";

import {
    ArrowLeft,
    ArrowUpRight,
    CalendarDays,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Clock3,
    MapPin,
    UserRound,
    ClipboardCheck,
    Copy,
    Check,
} from "lucide-react";

import { useState } from "react";

const resultConfig = {
    passed: {
        label: "Passed",
        icon: CheckCircle2,
        badge:
            "border-emerald-200 bg-emerald-50 text-emerald-700",
        iconClass: "text-emerald-600",
        accent: "bg-emerald-500",
    },

    warning: {
        label: "Warning",
        icon: AlertTriangle,
        badge:
            "border-amber-200 bg-amber-50 text-amber-700",
        iconClass: "text-amber-600",
        accent: "bg-amber-500",
    },

    failed: {
        label: "Failed",
        icon: XCircle,
        badge:
            "border-red-200 bg-red-50 text-red-700",
        iconClass: "text-red-600",
        accent: "bg-red-500",
    },

    pending: {
        label: "Pending",
        icon: Clock3,
        badge:
            "border-slate-200 bg-slate-50 text-slate-600",
        iconClass: "text-slate-500",
        accent: "bg-slate-400",
    },
};

function formatDate(date) {
    if (!date) {
        return "Date unavailable";
    }

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
        return "Date unavailable";
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(value);
}

function formatTime(date) {
    if (!date) {
        return "";
    }

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
        return "";
    }

    return new Intl.DateTimeFormat("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).format(value);
}

function formatCoordinate(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return null;
    }

    return number.toFixed(4);
}

function InfoItem({
    icon: Icon,
    label,
    children,
    accent = false,
}) {
    return (
        <div className="group relative flex min-w-0 gap-3">
            <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors ${accent
                    ? "border-blue-100 bg-blue-50 text-blue-600"
                    : "border-slate-200 bg-slate-50 text-slate-500"
                    }`}
            >
                <Icon
                    size={15}
                    strokeWidth={1.8}
                />
            </div>

            <div className="min-w-0 pt-0.5">
                <p className="text-[9px] font-semibold uppercase tracking-[0.11em] text-slate-400">
                    {label}
                </p>

                <div className="mt-1">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default function InspectionOverview({
    inspection,
}) {
    const [copied, setCopied] = useState(false);

    const result =
        resultConfig[inspection?.result] ||
        resultConfig.pending;

    const ResultIcon = result.icon;

    const inspector =
        inspection?.inspector;

    const latitude = formatCoordinate(
        inspection?.location?.latitude
    );

    const longitude = formatCoordinate(
        inspection?.location?.longitude
    );

    const hasLocation =
        latitude !== null &&
        longitude !== null;

    const isSubmitted =
        inspection?.status === "submitted";

    const inspectionId =
        inspection?.id ||
        inspection?._id ||
        "";

    async function copyInspectionId() {
        if (!inspectionId) {
            return;
        }

        try {
            await navigator.clipboard.writeText(
                inspectionId
            );

            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 1800);
        } catch (error) {
            console.error(
                "Unable to copy inspection ID:",
                error
            );
        }
    }

    return (
        <section>
            {/* =====================================================
                BACK
            ====================================================== */}

            <div className="mb-6">
                <Link
                    href="/inspections"
                    className="group inline-flex items-center gap-2 text-xs font-semibold text-slate-400 transition-colors duration-200 hover:text-slate-800"
                >
                    <ArrowLeft
                        size={15}
                        strokeWidth={1.9}
                        className="transition-transform duration-200 group-hover:-translate-x-0.5"
                    />

                    Back to inspections
                </Link>
            </div>

            {/* =====================================================
                HERO
            ====================================================== */}

            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
                {/* Top accent */}
                <div
                    className={`absolute inset-x-0 top-0 h-[3px] ${result.accent}`}
                />

                {/* Subtle background decoration */}
                <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-50/50 blur-3xl" />

                <div className="relative px-5 py-6 sm:px-7 sm:py-7 lg:px-8 lg:py-8">
                    <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
                        {/* =================================================
                            LEFT
                        ================================================== */}

                        <div className="min-w-0">
                            {/* Eyebrow */}
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-blue-700">
                                    <ClipboardCheck
                                        size={11}
                                        strokeWidth={2}
                                    />

                                    Inspection record
                                </span>

                                <span className="text-[10px] text-slate-300">
                                    /
                                </span>

                                <span className="text-[10px] font-medium text-slate-400">
                                    {inspectionId
                                        ? `#${inspectionId.slice(
                                            -8
                                        )}`
                                        : "Record"}
                                </span>

                                {inspectionId && (
                                    <button
                                        type="button"
                                        onClick={
                                            copyInspectionId
                                        }
                                        className="inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                                        title="Copy inspection ID"
                                        aria-label="Copy inspection ID"
                                    >
                                        {copied ? (
                                            <Check
                                                size={12}
                                                className="text-emerald-600"
                                            />
                                        ) : (
                                            <Copy
                                                size={12}
                                            />
                                        )}
                                    </button>
                                )}
                            </div>

                            {/* Title */}
                            <h1 className="mt-5 max-w-3xl font-[Sora] text-2xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-3xl lg:text-[34px]">
                                {inspection?.assetName ||
                                    "Inspection"}
                            </h1>

                            {/* Type */}
                            <p className="mt-2 text-sm font-medium text-slate-500">
                                {inspection?.inspectionType ||
                                    "Inspection"}
                            </p>

                            {/* Quick context */}
                            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] font-medium text-slate-400">
                                <span className="inline-flex items-center gap-1.5">
                                    <CalendarDays
                                        size={13}
                                        strokeWidth={1.8}
                                    />

                                    {formatDate(
                                        inspection?.inspectedAt
                                    )}
                                </span>

                                <span className="hidden h-3 w-px bg-slate-200 sm:block" />

                                <span className="inline-flex items-center gap-1.5">
                                    <UserRound
                                        size={13}
                                        strokeWidth={1.8}
                                    />

                                    {inspector?.name ||
                                        "Unknown inspector"}
                                </span>
                            </div>
                        </div>

                        {/* =================================================
                            RIGHT STATUS
                        ================================================== */}

                        <div className="flex shrink-0 flex-col items-start gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
                            {/* Result */}
                            <div
                                className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 ${result.badge}`}
                            >
                                <span
                                    className={`flex h-6 w-6 items-center justify-center rounded-lg bg-white/70 ${result.iconClass}`}
                                >
                                    <ResultIcon
                                        size={14}
                                        strokeWidth={2}
                                    />
                                </span>

                                <div>
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.1em] opacity-60">
                                        Inspection result
                                    </p>

                                    <p className="mt-0.5 text-xs font-bold">
                                        {result.label}
                                    </p>
                                </div>
                            </div>

                            {/* Submission status */}
                            <div
                                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 ${isSubmitted
                                    ? "border-slate-200 bg-slate-50 text-slate-600"
                                    : "border-blue-100 bg-blue-50 text-blue-700"
                                    }`}
                            >
                                <span
                                    className={`h-1.5 w-1.5 rounded-full ${isSubmitted
                                        ? "bg-slate-400"
                                        : "bg-blue-500"
                                        }`}
                                />

                                <span className="text-[10px] font-semibold">
                                    {isSubmitted
                                        ? "Submitted"
                                        : "Draft"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* =====================================================
                    INFORMATION STRIP
                ====================================================== */}

                <div className="border-t border-slate-100 bg-slate-50/45 px-5 py-5 sm:px-7 lg:px-8">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        {/* Inspected */}
                        <InfoItem
                            icon={CalendarDays}
                            label="Inspected"
                        >
                            <p className="text-xs font-semibold text-slate-800">
                                {formatDate(
                                    inspection?.inspectedAt
                                )}
                            </p>

                            {formatTime(
                                inspection?.inspectedAt
                            ) && (
                                    <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                                        {formatTime(
                                            inspection?.inspectedAt
                                        )}
                                    </p>
                                )}
                        </InfoItem>

                        {/* Inspector */}
                        <InfoItem
                            icon={UserRound}
                            label="Inspector"
                            accent
                        >
                            <p className="truncate text-xs font-semibold text-slate-800">
                                {inspector?.name ||
                                    "Unknown inspector"}
                            </p>

                            <p className="mt-0.5 truncate text-[10px] font-medium text-slate-400">
                                {inspector?.email ||
                                    "Email unavailable"}
                            </p>
                        </InfoItem>

                        {/* Location */}
                        <InfoItem
                            icon={MapPin}
                            label="Inspection location"
                        >
                            {hasLocation ? (
                                <>
                                    <p className="text-xs font-semibold text-slate-800">
                                        GPS coordinates
                                    </p>

                                    <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                                        {latitude},{" "}
                                        {longitude}
                                    </p>
                                </>
                            ) : (
                                <p className="text-xs font-medium text-slate-400">
                                    Location unavailable
                                </p>
                            )}
                        </InfoItem>

                        {/* Submitted */}
                        <InfoItem
                            icon={Clock3}
                            label="Submitted"
                        >
                            {inspection?.submittedAt ? (
                                <>
                                    <p className="text-xs font-semibold text-slate-800">
                                        {formatDate(
                                            inspection.submittedAt
                                        )}
                                    </p>

                                    <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                                        {formatTime(
                                            inspection.submittedAt
                                        )}
                                    </p>
                                </>
                            ) : (
                                <p className="text-xs font-medium text-slate-400">
                                    Not submitted
                                </p>
                            )}
                        </InfoItem>
                    </div>
                </div>
            </div>
        </section>
    );
}