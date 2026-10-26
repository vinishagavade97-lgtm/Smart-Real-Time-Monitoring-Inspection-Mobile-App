"use client";

import Link from "next/link";

import {
    ArrowUpRight,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Clock3,
    MapPin,
    CalendarDays,
    ClipboardCheck,
} from "lucide-react";

const resultConfig = {
    passed: {
        label: "Passed",
        icon: CheckCircle2,
        badge:
            "border-emerald-100 bg-emerald-50 text-emerald-700",
        iconClass: "text-emerald-600",
        dot: "bg-emerald-500",
    },

    warning: {
        label: "Warning",
        icon: AlertTriangle,
        badge:
            "border-amber-100 bg-amber-50 text-amber-700",
        iconClass: "text-amber-600",
        dot: "bg-amber-500",
    },

    failed: {
        label: "Failed",
        icon: XCircle,
        badge:
            "border-red-100 bg-red-50 text-red-700",
        iconClass: "text-red-600",
        dot: "bg-red-500",
    },

    pending: {
        label: "Pending",
        icon: Clock3,
        badge:
            "border-slate-200 bg-slate-50 text-slate-600",
        iconClass: "text-slate-500",
        dot: "bg-slate-400",
    },
};

const statusConfig = {
    draft: "Draft",
    submitted: "Submitted",
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

export default function InspectionListItem({
    inspection,
}) {
    const result =
        resultConfig[inspection?.result] ||
        resultConfig.pending;

    const ResultIcon = result.icon;

    const inspectionId =
        inspection?.id || inspection?._id;

    const assetName =
        inspection?.assetName ||
        "Unnamed inspection";

    const inspectionType =
        inspection?.inspectionType ||
        "Inspection";

    const status =
        statusConfig[inspection?.status] ||
        inspection?.status ||
        "Unknown";

    const latitude =
        formatCoordinate(
            inspection?.location?.latitude
        );

    const longitude =
        formatCoordinate(
            inspection?.location?.longitude
        );

    const hasLocation =
        latitude !== null &&
        longitude !== null;

    const initials = assetName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) =>
            word.charAt(0).toUpperCase()
        )
        .join("");

    return (
        <article className="group relative border-b border-slate-100 bg-white px-4 py-5 transition-all duration-200 last:border-b-0 hover:bg-slate-50/70 sm:px-5 lg:px-6">

            {/* Subtle active edge */}
            <div className="absolute inset-y-4 left-0 w-0.5 rounded-r-full bg-blue-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                {/* =================================================
                    INSPECTION INFORMATION
                ================================================== */}

                <div className="flex min-w-0 items-start gap-3.5">

                    {/* Asset avatar */}
                    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100 text-[10px] font-bold tracking-wide text-slate-500 shadow-sm shadow-slate-200/30">
                        {initials || "IN"}

                        {/* Status dot */}
                        <span
                            className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${result.dot}`}
                        />
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">

                        {/* Title row */}
                        <div className="flex flex-wrap items-center gap-2">

                            <h3 className="max-w-[280px] truncate text-sm font-semibold tracking-[-0.015em] text-slate-900">
                                {assetName}
                            </h3>

                            {/* Result */}
                            <span
                                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 text-[9px] font-semibold tracking-[-0.01em] ${result.badge}`}
                            >
                                <ResultIcon
                                    size={11}
                                    strokeWidth={2}
                                    className={
                                        result.iconClass
                                    }
                                />

                                {result.label}
                            </span>
                        </div>

                        {/* Inspection type */}
                        <div className="mt-1.5 flex items-center gap-1.5">
                            <ClipboardCheck
                                size={12}
                                strokeWidth={1.7}
                                className="shrink-0 text-slate-400"
                            />

                            <p className="truncate text-xs font-medium text-slate-500">
                                {inspectionType}
                            </p>
                        </div>

                        {/* Metadata */}
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">

                            {/* Date */}
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                                <CalendarDays
                                    size={12}
                                    strokeWidth={1.8}
                                    className="text-slate-400"
                                />

                                <span>
                                    {formatDate(
                                        inspection?.inspectedAt
                                    )}
                                </span>

                                {formatTime(
                                    inspection?.inspectedAt
                                ) && (
                                        <>
                                            <span className="text-slate-300">
                                                ·
                                            </span>

                                            <span>
                                                {formatTime(
                                                    inspection?.inspectedAt
                                                )}
                                            </span>
                                        </>
                                    )}
                            </span>

                            {/* Location */}
                            {hasLocation && (
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                                    <MapPin
                                        size={12}
                                        strokeWidth={1.8}
                                        className="text-slate-400"
                                    />

                                    <span>
                                        {latitude},{" "}
                                        {longitude}
                                    </span>
                                </span>
                            )}

                            {/* Status */}
                            <span
                                className={`inline-flex items-center gap-1.5 rounded-md border px-1.5 py-1 text-[9px] font-semibold ${inspection?.status ===
                                    "submitted"
                                    ? "border-slate-200 bg-slate-50 text-slate-500"
                                    : "border-blue-100 bg-blue-50 text-blue-600"
                                    }`}
                            >
                                <span
                                    className={`h-1.5 w-1.5 rounded-full ${inspection?.status ===
                                        "submitted"
                                        ? "bg-slate-400"
                                        : "bg-blue-500"
                                        }`}
                                />

                                {status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* =================================================
                    ACTION
                ================================================== */}

                <div className="flex shrink-0 justify-end lg:pl-6">
                    {inspectionId ? (
                        <Link
                            href={
                                inspection?.status === "draft"
                                    ? `/inspections/create/${inspectionId}`
                                    : `/inspections/${inspectionId}`
                            }
                            className="group/action inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-[11px] font-semibold text-slate-600 shadow-sm shadow-slate-200/20 transition-all duration-200 hover:border-blue-200 hover:bg-blue-50/40 hover:text-blue-700 active:scale-[0.98]"
                        >
                            <span>
                                {inspection?.status ===
                                    "draft"
                                    ? "Continue inspection"
                                    : "View details"}
                            </span>

                            <ArrowUpRight
                                size={14}
                                strokeWidth={1.8}
                                className="transition-transform duration-200 group-hover/action:translate-x-0.5 group-hover/action:-translate-y-0.5"
                            />
                        </Link>
                    ) : (
                        <span className="text-[11px] font-medium text-slate-400">
                            Details unavailable
                        </span>
                    )}
                </div>
            </div>
        </article>
    );
}