"use client";

import Link from "next/link";
import {
    ArrowUpRight,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Clock3,
} from "lucide-react";

const resultConfig = {
    passed: {
        label: "Passed",
        icon: CheckCircle2,
        classes:
            "bg-emerald-50 text-emerald-700 border-emerald-100",
        iconClasses: "text-emerald-600",
    },

    warning: {
        label: "Warning",
        icon: AlertTriangle,
        classes:
            "bg-amber-50 text-amber-700 border-amber-100",
        iconClasses: "text-amber-600",
    },

    failed: {
        label: "Failed",
        icon: XCircle,
        classes: "bg-red-50 text-red-700 border-red-100",
        iconClasses: "text-red-600",
    },

    pending: {
        label: "Draft",
        icon: Clock3,
        classes:
            "bg-slate-50 text-slate-600 border-slate-200",
        iconClasses: "text-slate-500",
    },
};

function formatDate(date) {
    if (!date) {
        return "Date unavailable";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Date unavailable";
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(parsedDate);
}

function formatTime(date) {
    if (!date) {
        return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "";
    }

    return new Intl.DateTimeFormat("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).format(parsedDate);
}

export default function InspectionRow({
    inspection,
}) {
    const result =
        resultConfig[inspection?.result] ||
        resultConfig.pending;

    const ResultIcon = result.icon;

    const inspectionId = inspection?.id;

    return (
        <div className="group flex flex-col gap-4 px-5 py-4 transition-colors duration-200 hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between">
            {/* Main information */}
            <div className="flex min-w-0 items-start gap-3">
                {/* Inspection icon */}
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition-colors group-hover:border-slate-300 group-hover:bg-white">
                    <span className="text-xs font-bold">
                        {inspection?.assetName
                            ?.slice(0, 2)
                            ?.toUpperCase() || "IN"}
                    </span>
                </div>

                {/* Details */}
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-slate-900">
                            {inspection?.assetName ||
                                "Unnamed inspection"}
                        </h3>

                        {/* Mobile status */}
                        <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold sm:hidden ${result.classes}`}
                        >
                            <ResultIcon
                                size={10}
                                className={result.iconClasses}
                                strokeWidth={2}
                            />

                            {result.label}
                        </span>
                    </div>

                    <p className="mt-1 truncate text-xs text-slate-500">
                        {inspection?.inspectionType ||
                            "Inspection"}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-medium text-slate-400">
                        <span>
                            {formatDate(
                                inspection?.inspectedAt
                            )}
                        </span>

                        {formatTime(
                            inspection?.inspectedAt
                        ) && (
                                <>
                                    <span className="h-1 w-1 rounded-full bg-slate-300" />

                                    <span>
                                        {formatTime(
                                            inspection?.inspectedAt
                                        )}
                                    </span>
                                </>
                            )}
                    </div>
                </div>
            </div>

            {/* Right side */}
            <div className="flex items-center justify-between gap-4 sm:justify-end">
                {/* Status */}
                <span
                    className={`hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold sm:inline-flex ${result.classes}`}
                >
                    <ResultIcon
                        size={12}
                        className={result.iconClasses}
                        strokeWidth={2}
                    />

                    {result.label}
                </span>

                {/* Details */}
                {inspectionId ? (
                    <Link
                        href={`/inspections/${inspectionId}`}
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 transition-colors hover:text-blue-600"
                    >
                        <span>View details</span>

                        <ArrowUpRight
                            size={14}
                            strokeWidth={1.9}
                            className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                    </Link>
                ) : (
                    <span className="text-[11px] text-slate-400">
                        Details unavailable
                    </span>
                )}
            </div>
        </div>
    );
}