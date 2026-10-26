"use client";

import {
    AlertTriangle,
    CheckCircle2,
    ClipboardCheck,
    Clock3,
    XCircle,
} from "lucide-react";

const resultConfig = {
    passed: {
        label: "Passed",
        icon: CheckCircle2,
        iconClass: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-100",
        text: "text-emerald-700",
        dot: "bg-emerald-500",
    },

    warning: {
        label: "Warning",
        icon: AlertTriangle,
        iconClass: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-100",
        text: "text-amber-700",
        dot: "bg-amber-500",
    },

    failed: {
        label: "Failed",
        icon: XCircle,
        iconClass: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-100",
        text: "text-red-700",
        dot: "bg-red-500",
    },

    pending: {
        label: "Pending",
        icon: Clock3,
        iconClass: "text-slate-500",
        bg: "bg-slate-50",
        border: "border-slate-200",
        text: "text-slate-600",
        dot: "bg-slate-400",
    },
};

function SummaryStat({
    label,
    value,
    dot,
    valueClass = "text-slate-800",
}) {
    return (
        <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5">
            <div className="flex items-center gap-2">
                <span
                    className={`h-1.5 w-1.5 rounded-full ${dot}`}
                />

                <span className="text-[10px] font-medium text-slate-500">
                    {label}
                </span>
            </div>

            <span
                className={`text-xs font-bold ${valueClass}`}
            >
                {value}
            </span>
        </div>
    );
}

export default function InspectionSummary({
    inspection,
}) {
    const checklist =
        inspection?.checklist || [];

    const passedCount = checklist.filter(
        (item) => item?.status === "pass"
    ).length;

    const warningCount = checklist.filter(
        (item) => item?.status === "warning"
    ).length;

    const failedCount = checklist.filter(
        (item) => item?.status === "failed"
    ).length;

    const totalCount = checklist.length;

    const completedPercentage =
        totalCount > 0
            ? Math.round(
                ((passedCount +
                    warningCount +
                    failedCount) /
                    totalCount) *
                100
            )
            : 0;

    const result =
        resultConfig[inspection?.result] ||
        resultConfig.pending;

    const ResultIcon = result.icon;

    const isSubmitted =
        inspection?.status === "submitted";

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/30">
            {/* =========================================
                HEADER
            ========================================== */}

            <div className="border-b border-slate-100 px-5 py-4.5">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500">
                        <ClipboardCheck
                            size={16}
                            strokeWidth={1.8}
                        />
                    </div>

                    <div>
                        <h2 className="font-[Sora] text-sm font-semibold tracking-[-0.02em] text-slate-900">
                            Inspection summary
                        </h2>

                        <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                            Overall inspection status
                        </p>
                    </div>
                </div>
            </div>

            {/* =========================================
                RESULT
            ========================================== */}

            <div className="px-5 py-4">
                <div
                    className={`flex items-center justify-between rounded-xl border px-3.5 py-3 ${result.border} ${result.bg}`}
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/80">
                            <ResultIcon
                                size={17}
                                strokeWidth={1.9}
                                className={result.iconClass}
                            />
                        </div>

                        <div>
                            <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                                Overall result
                            </p>

                            <p
                                className={`mt-0.5 text-sm font-bold ${result.text}`}
                            >
                                {result.label}
                            </p>
                        </div>
                    </div>

                    <span
                        className={`h-2 w-2 rounded-full ${result.dot}`}
                    />
                </div>
            </div>

            {/* =========================================
                CHECKLIST STATS
            ========================================== */}

            <div className="px-5 pb-4">
                <p className="mb-2.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                    Checklist results
                </p>

                <div className="space-y-2">
                    <SummaryStat
                        label="Passed"
                        value={passedCount}
                        dot="bg-emerald-500"
                        valueClass="text-emerald-700"
                    />

                    <SummaryStat
                        label="Warning"
                        value={warningCount}
                        dot="bg-amber-500"
                        valueClass="text-amber-700"
                    />

                    <SummaryStat
                        label="Failed"
                        value={failedCount}
                        dot="bg-red-500"
                        valueClass="text-red-700"
                    />
                </div>
            </div>

            {/* =========================================
                DETAILS
            ========================================== */}

            <div className="border-t border-slate-100 bg-slate-50/45 px-5 py-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                            Inspection type
                        </p>

                        <p className="mt-1 truncate text-[10px] font-semibold text-slate-700">
                            {inspection?.inspectionType ||
                                "Not specified"}
                        </p>
                    </div>

                    <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                            Completion
                        </p>

                        <p className="mt-1 text-[10px] font-semibold text-slate-700">
                            {completedPercentage}%
                        </p>
                    </div>

                    <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                            Total checks
                        </p>

                        <p className="mt-1 text-[10px] font-semibold text-slate-700">
                            {totalCount}
                        </p>
                    </div>

                    <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                            Status
                        </p>

                        <div className="mt-1 flex items-center gap-1.5">
                            <span
                                className={`h-1.5 w-1.5 rounded-full ${isSubmitted
                                    ? "bg-slate-400"
                                    : "bg-blue-500"
                                    }`}
                            />

                            <span className="text-[10px] font-semibold text-slate-700">
                                {isSubmitted
                                    ? "Submitted"
                                    : "Draft"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}