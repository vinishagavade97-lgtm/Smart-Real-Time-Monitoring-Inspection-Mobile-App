"use client";

import {
    CheckCircle2,
    AlertTriangle,
    XCircle,
    ClipboardCheck,
    MessageSquareText,
} from "lucide-react";

const statusConfig = {
    pass: {
        label: "Pass",
        icon: CheckCircle2,
        iconClass: "text-emerald-600",
        badge:
            "border-emerald-100 bg-emerald-50 text-emerald-700",
        dot: "bg-emerald-500",
    },

    warning: {
        label: "Warning",
        icon: AlertTriangle,
        iconClass: "text-amber-600",
        badge:
            "border-amber-100 bg-amber-50 text-amber-700",
        dot: "bg-amber-500",
    },

    failed: {
        label: "Failed",
        icon: XCircle,
        iconClass: "text-red-600",
        badge:
            "border-red-100 bg-red-50 text-red-700",
        dot: "bg-red-500",
    },
};

function getCounts(checklist = []) {
    return checklist.reduce(
        (counts, item) => {
            if (item.status === "pass") {
                counts.pass += 1;
            }

            if (item.status === "warning") {
                counts.warning += 1;
            }

            if (item.status === "failed") {
                counts.failed += 1;
            }

            return counts;
        },
        {
            pass: 0,
            warning: 0,
            failed: 0,
        }
    );
}

export default function InspectionChecklist({
    checklist = [],
}) {
    const counts = getCounts(checklist);

    const total = checklist.length;

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/30">
            {/* =====================================================
                HEADER
            ====================================================== */}

            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
                            <ClipboardCheck
                                size={17}
                                strokeWidth={1.8}
                            />
                        </div>

                        <div>
                            <h2 className="font-[Sora] text-sm font-semibold tracking-[-0.02em] text-slate-900">
                                Inspection checklist
                            </h2>

                            <p className="mt-1 text-[11px] font-medium text-slate-400">
                                Review each inspection point and its recorded result.
                            </p>
                        </div>
                    </div>

                    {/* Result counts */}

                    {total > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-1.5 text-[9px] font-semibold text-emerald-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                {counts.pass} Passed
                            </span>

                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-100 bg-amber-50 px-2.5 py-1.5 text-[9px] font-semibold text-amber-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                {counts.warning} Warning
                            </span>

                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-2.5 py-1.5 text-[9px] font-semibold text-red-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                {counts.failed} Failed
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* =====================================================
                CHECKLIST
            ====================================================== */}

            {checklist.length > 0 ? (
                <div className="divide-y divide-slate-100">
                    {checklist.map((item, index) => {
                        const config =
                            statusConfig[item?.status] ||
                            statusConfig.pass;

                        const StatusIcon =
                            config.icon;

                        return (
                            <div
                                key={
                                    item?._id ||
                                    `${item?.item}-${index}`
                                }
                                className="group px-5 py-5 transition-colors duration-200 hover:bg-slate-50/60 sm:px-6"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Number */}

                                    <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-400 sm:flex">
                                        {String(
                                            index + 1
                                        ).padStart(2, "0")}
                                    </div>

                                    {/* Status icon */}

                                    <div
                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-white ${config.badge}`}
                                    >
                                        <StatusIcon
                                            size={17}
                                            strokeWidth={1.9}
                                            className={
                                                config.iconClass
                                            }
                                        />
                                    </div>

                                    {/* Content */}

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-semibold text-slate-400 sm:hidden">
                                                        {String(
                                                            index +
                                                            1
                                                        ).padStart(
                                                            2,
                                                            "0"
                                                        )}
                                                    </span>

                                                    <h3 className="text-xs font-semibold leading-5 text-slate-800 sm:text-sm">
                                                        {item?.item ||
                                                            "Inspection item"}
                                                    </h3>
                                                </div>

                                                {item?.remarks && (
                                                    <div className="mt-2.5 flex items-start gap-2">
                                                        <MessageSquareText
                                                            size={13}
                                                            strokeWidth={
                                                                1.7
                                                            }
                                                            className="mt-0.5 shrink-0 text-slate-400"
                                                        />

                                                        <p className="text-[11px] leading-5 text-slate-500">
                                                            {
                                                                item.remarks
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Status */}

                                            <span
                                                className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[9px] font-bold ${config.badge}`}
                                            >
                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
                                                />

                                                {
                                                    config.label
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="px-6 py-12 text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
                        <ClipboardCheck
                            size={19}
                            strokeWidth={1.7}
                        />
                    </div>

                    <h3 className="mt-3 text-xs font-semibold text-slate-800">
                        No checklist items
                    </h3>

                    <p className="mx-auto mt-1 max-w-sm text-[10px] leading-5 text-slate-400">
                        No inspection checks have been recorded for this inspection.
                    </p>
                </div>
            )}

            {/* =====================================================
                FOOTER SUMMARY
            ====================================================== */}

            {total > 0 && (
                <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3.5 sm:px-6">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-medium text-slate-400">
                            Total inspection points
                        </span>

                        <span className="text-xs font-bold text-slate-700">
                            {total}
                        </span>
                    </div>
                </div>
            )}
        </section>
    );
}