"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    Camera,
    Check,
    CheckCircle2,
    ClipboardCheck,
    Clock3,
    FileImage,
    Loader2,
    Lock,
    MapPin,
    ShieldCheck,
    User,
    XCircle,
} from "lucide-react";

const RESULT_CONFIG = {
    passed: {
        label: "Passed",
        description:
            "All checklist points passed successfully.",
        icon: CheckCircle2,
        box:
            "border-emerald-200 bg-emerald-50",
        iconClass: "text-emerald-600",
        textClass: "text-emerald-700",
    },

    warning: {
        label: "Warning",
        description:
            "One or more inspection points require attention.",
        icon: AlertTriangle,
        box:
            "border-amber-200 bg-amber-50",
        iconClass: "text-amber-600",
        textClass: "text-amber-700",
    },

    failed: {
        label: "Failed",
        description:
            "One or more inspection points failed.",
        icon: XCircle,
        box:
            "border-red-200 bg-red-50",
        iconClass: "text-red-600",
        textClass: "text-red-700",
    },

    pending: {
        label: "Pending",
        description:
            "Complete the inspection before submitting.",
        icon: Clock3,
        box:
            "border-slate-200 bg-slate-50",
        iconClass: "text-slate-500",
        textClass: "text-slate-600",
    },
};

function calculateResult(checklist = []) {
    if (!checklist.length) {
        return "pending";
    }

    if (
        checklist.some(
            (item) =>
                item.status === "failed"
        )
    ) {
        return "failed";
    }

    if (
        checklist.some(
            (item) =>
                item.status === "warning"
        )
    ) {
        return "warning";
    }

    return "passed";
}

function formatDateTime(value) {
    if (!value) {
        return "Not available";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return new Intl.DateTimeFormat(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        }
    ).format(date);
}

export default function InspectionReviewPage() {
    const params = useParams();
    const router = useRouter();

    const inspectionId = params?.id;

    const [inspection, setInspection] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");

    /* =====================================================
       LOAD
    ====================================================== */

    useEffect(() => {
        if (!inspectionId) {
            return;
        }

        async function fetchInspection() {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `/api/inspections/${inspectionId}`,
                    {
                        credentials:
                            "include",
                        cache: "no-store",
                    }
                );

                const data =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        data?.message ||
                        "Unable to load inspection"
                    );
                }

                setInspection(
                    data.inspection
                );
            } catch (error) {
                console.error(
                    "❌ [REVIEW] Load failed:",
                    error
                );

                setError(
                    error.message ||
                    "Unable to load inspection"
                );
            } finally {
                setLoading(false);
            }
        }

        fetchInspection();
    }, [inspectionId]);

    /* =====================================================
       CALCULATED SUMMARY
    ====================================================== */

    const checklist =
        inspection?.checklist || [];

    const evidence =
        inspection?.evidence || [];

    const calculatedResult = useMemo(
        () =>
            calculateResult(
                checklist
            ),
        [checklist]
    );

    const resultConfig =
        RESULT_CONFIG[
        calculatedResult
        ];

    const ResultIcon =
        resultConfig.icon;

    const counts = useMemo(
        () => ({
            pass: checklist.filter(
                (item) =>
                    item.status === "pass"
            ).length,

            warning: checklist.filter(
                (item) =>
                    item.status ===
                    "warning"
            ).length,

            failed: checklist.filter(
                (item) =>
                    item.status === "failed"
            ).length,
        }),
        [checklist]
    );

    /* =====================================================
       SUBMIT
    ====================================================== */

    async function submitInspection() {
        if (submitting) {
            return;
        }

        if (!checklist.length) {
            setError(
                "At least one checklist item is required."
            );

            return;
        }

        if (!evidence.length) {
            setError(
                "At least one evidence photo is required."
            );

            return;
        }

        const confirmed =
            window.confirm(
                "Submit this inspection? Once submitted, it will be locked and cannot be edited."
            );

        if (!confirmed) {
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            console.log(
                "🚀 [REVIEW] Submitting inspection:",
                inspectionId
            );

            const response =
                await fetch(
                    `/api/inspections/${inspectionId}/submit`,
                    {
                        method: "POST",
                        credentials:
                            "include",
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    "Unable to submit inspection"
                );
            }

            console.log(
                "✅ [REVIEW] Inspection submitted:",
                data
            );

            router.push(
                `/inspections/${inspectionId}`
            );
        } catch (error) {
            console.error(
                "❌ [REVIEW] Submit failed:",
                error
            );

            setError(
                error.message ||
                "Unable to submit inspection"
            );
        } finally {
            setSubmitting(false);
        }
    }

    /* =====================================================
       LOADING
    ====================================================== */

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC]">
                <main className="px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-[980px]">
                        <div className="animate-pulse">
                            <div className="h-4 w-32 rounded bg-slate-200" />

                            <div className="mt-5 h-16 rounded-2xl bg-white ring-1 ring-slate-200" />

                            <div className="mt-4 h-[650px] rounded-2xl bg-white ring-1 ring-slate-200" />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    /* =====================================================
       ERROR
    ====================================================== */

    if (error && !inspection) {
        return (
            <div className="min-h-screen bg-[#F8FAFC]">
                <main className="px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-[980px]">
                        <div className="rounded-2xl border border-red-100 bg-white px-6 py-16 text-center shadow-sm">
                            <AlertCircle
                                size={30}
                                className="mx-auto text-red-600"
                            />

                            <h1 className="mt-4 text-sm font-semibold text-slate-900">
                                Unable to load review
                            </h1>

                            <p className="mt-2 text-xs text-slate-500">
                                {error}
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    /* =====================================================
       MAIN
    ====================================================== */

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <main className="px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-[980px]">

                    {/* BACK */}

                    <div className="mb-4">
                        <Link
                            href={`/inspections/create/${inspectionId}/evidence`}
                            className="group inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-800"
                        >
                            <ArrowLeft
                                size={15}
                                className="transition-transform group-hover:-translate-x-0.5"
                            />
                            Back to evidence
                        </Link>
                    </div>

                    {/* HEADER */}

                    <div className="mb-4 flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
                            <ClipboardCheck
                                size={18}
                            />
                        </div>

                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-600">
                                Step 4 of 4
                            </p>

                            <h1 className="mt-1 font-[Sora] text-xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-2xl">
                                Review inspection
                            </h1>

                            <p className="mt-1 text-xs text-slate-400">
                                Verify everything before final submission.
                            </p>
                        </div>
                    </div>

                    {/* STEPS */}

                    <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-5">
                        <div className="flex items-center">

                            <Step
                                number="1"
                                label="Basic information"
                                complete
                            />

                            <div className="mx-3 h-px flex-1 bg-blue-200" />

                            <Step
                                number="2"
                                label="Checklist"
                                complete
                            />

                            <div className="mx-3 h-px flex-1 bg-blue-200" />

                            <Step
                                number="3"
                                label="Evidence"
                                complete
                            />

                            <div className="mx-3 h-px flex-1 bg-blue-200" />

                            <Step
                                number="4"
                                label="Review"
                                active
                            />

                        </div>
                    </div>

                    {/* RESULT */}

                    <section
                        className={`mb-4 overflow-hidden rounded-2xl border ${resultConfig.box}`}
                    >
                        <div className="flex items-center justify-between gap-4 px-5 py-5 sm:px-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/80">
                                    <ResultIcon
                                        size={21}
                                        className={
                                            resultConfig.iconClass
                                        }
                                    />
                                </div>

                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-slate-400">
                                        Inspection result
                                    </p>

                                    <h2
                                        className={`mt-1 font-[Sora] text-lg font-semibold ${resultConfig.textClass}`}
                                    >
                                        {
                                            resultConfig.label
                                        }
                                    </h2>

                                    <p className="mt-1 text-[10px] text-slate-500">
                                        {
                                            resultConfig.description
                                        }
                                    </p>
                                </div>
                            </div>

                            <ShieldCheck
                                size={25}
                                className="hidden text-slate-300 sm:block"
                            />
                        </div>
                    </section>

                    {/* OVERVIEW */}

                    <section className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <SectionHeader
                            icon={ClipboardCheck}
                            title="Inspection summary"
                            subtitle="Basic inspection information"
                        />

                        <div className="grid gap-px bg-slate-100 sm:grid-cols-2">
                            <SummaryItem
                                label="Asset"
                                value={
                                    inspection?.assetName
                                }
                            />

                            <SummaryItem
                                label="Inspection type"
                                value={
                                    inspection?.inspectionType
                                }
                            />

                            <SummaryItem
                                label="Inspected"
                                value={formatDateTime(
                                    inspection?.inspectedAt
                                )}
                            />

                            <SummaryItem
                                label="Inspector"
                                value={
                                    inspection
                                        ?.inspector
                                        ?.name ||
                                    "Current inspector"
                                }
                            />

                            <SummaryItem
                                label="Location"
                                value={
                                    inspection
                                        ?.location
                                        ? `${Number(
                                            inspection.location
                                                .latitude
                                        ).toFixed(
                                            4
                                        )}, ${Number(
                                            inspection.location
                                                .longitude
                                        ).toFixed(
                                            4
                                        )}`
                                        : "GPS unavailable"
                                }
                            />

                            <SummaryItem
                                label="Evidence"
                                value={`${evidence.length} photo${evidence.length !==
                                    1
                                    ? "s"
                                    : ""
                                    } attached`}
                            />
                        </div>
                    </section>

                    {/* CHECKLIST */}

                    <section className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <SectionHeader
                            icon={ClipboardCheck}
                            title="Checklist results"
                            subtitle="Final condition recorded during inspection"
                            right={
                                <div className="flex gap-1.5">
                                    <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 text-[9px] font-semibold text-emerald-700">
                                        {counts.pass} Passed
                                    </span>

                                    <span className="rounded-full border border-amber-100 bg-amber-50 px-2 py-1 text-[9px] font-semibold text-amber-700">
                                        {
                                            counts.warning
                                        }{" "}
                                        Warning
                                    </span>

                                    <span className="rounded-full border border-red-100 bg-red-50 px-2 py-1 text-[9px] font-semibold text-red-700">
                                        {counts.failed} Failed
                                    </span>
                                </div>
                            }
                        />

                        <div className="divide-y divide-slate-100">
                            {checklist.map(
                                (
                                    item,
                                    index
                                ) => {
                                    const failed =
                                        item.status ===
                                        "failed";

                                    const warning =
                                        item.status ===
                                        "warning";

                                    const ItemIcon =
                                        failed
                                            ? XCircle
                                            : warning
                                                ? AlertTriangle
                                                : CheckCircle2;

                                    return (
                                        <div
                                            key={
                                                item._id ||
                                                index
                                            }
                                            className="flex items-start gap-3 px-5 py-3.5 sm:px-6"
                                        >
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-[9px] font-bold text-slate-400">
                                                {String(
                                                    index +
                                                    1
                                                ).padStart(
                                                    2,
                                                    "0"
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-3">
                                                    <p className="text-xs font-semibold text-slate-800">
                                                        {
                                                            item.item
                                                        }
                                                    </p>

                                                    <span
                                                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 text-[9px] font-semibold ${failed
                                                            ? "border-red-100 bg-red-50 text-red-700"
                                                            : warning
                                                                ? "border-amber-100 bg-amber-50 text-amber-700"
                                                                : "border-emerald-100 bg-emerald-50 text-emerald-700"
                                                            }`}
                                                    >
                                                        <ItemIcon
                                                            size={
                                                                11
                                                            }
                                                        />

                                                        {failed
                                                            ? "Failed"
                                                            : warning
                                                                ? "Warning"
                                                                : "Pass"}
                                                    </span>
                                                </div>

                                                {item.remarks && (
                                                    <p className="mt-1 text-[10px] leading-5 text-slate-400">
                                                        {
                                                            item.remarks
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    </section>

                    {/* EVIDENCE */}

                    <section className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <SectionHeader
                            icon={Camera}
                            title="Evidence photos"
                            subtitle="Visual evidence attached to this inspection"
                            right={
                                <span className="text-[10px] font-semibold text-slate-400">
                                    {
                                        evidence.length
                                    }{" "}
                                    photos
                                </span>
                            }
                        />

                        <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 sm:p-6">
                            {evidence.map(
                                (
                                    item,
                                    index
                                ) => (
                                    <div
                                        key={
                                            item._id ||
                                            index
                                        }
                                        className="overflow-hidden rounded-xl border border-slate-200"
                                    >
                                        <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                                            <img
                                                src={
                                                    item.url
                                                }
                                                alt={
                                                    item.caption ||
                                                    `Evidence ${index + 1}`
                                                }
                                                className="h-full w-full object-cover"
                                            />
                                        </div>

                                        <div className="p-2.5">
                                            <p className="text-[9px] leading-4 text-slate-500">
                                                {item.caption ||
                                                    "No caption"}
                                            </p>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </section>

                    {/* SECURITY NOTICE */}

                    <div className="mb-4 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3.5">
                        <Lock
                            size={15}
                            className="mt-0.5 shrink-0 text-blue-600"
                        />

                        <div>
                            <p className="text-[10px] font-semibold text-slate-800">
                                Final submission
                            </p>

                            <p className="mt-0.5 text-[9px] leading-4 text-slate-500">
                                After submission, this inspection will be locked. The final result is calculated automatically from the checklist by the server.
                            </p>
                        </div>
                    </div>

                    {/* ERROR */}

                    {error && (
                        <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                            <AlertCircle
                                size={14}
                                className="mt-0.5 text-red-600"
                            />

                            <p className="text-[10px] font-semibold leading-4 text-red-700">
                                {error}
                            </p>
                        </div>
                    )}

                    {/* FOOTER */}

                    <div className="flex flex-col-reverse gap-2.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                        <Link
                            href={`/inspections/create/${inspectionId}/evidence`}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                        >
                            <ArrowLeft
                                size={14}
                            />
                            Back to evidence
                        </Link>

                        <button
                            type="button"
                            onClick={
                                submitInspection
                            }
                            disabled={
                                submitting ||
                                !checklist.length ||
                                !evidence.length
                            }
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-[11px] font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                        >
                            {submitting ? (
                                <>
                                    <Loader2
                                        size={14}
                                        className="animate-spin"
                                    />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <ShieldCheck
                                        size={14}
                                    />
                                    Submit inspection
                                    <ArrowRight
                                        size={14}
                                    />
                                </>
                            )}
                        </button>
                    </div>

                </div>
            </main>
        </div>
    );
}

/* =========================================================
   STEP
========================================================= */

function Step({
    number,
    label,
    complete = false,
    active = false,
}) {
    return (
        <div className="flex items-center gap-2">
            <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ${complete
                    ? "border border-blue-200 bg-blue-50 text-blue-700"
                    : active
                        ? "bg-blue-600 text-white"
                        : "border border-slate-200 bg-slate-50 text-slate-400"
                    }`}
            >
                {complete ? (
                    <Check size={13} />
                ) : (
                    number
                )}
            </span>

            <span
                className={`hidden text-[11px] sm:block ${active
                    ? "font-semibold text-slate-800"
                    : complete
                        ? "font-semibold text-slate-700"
                        : "font-medium text-slate-400"
                    }`}
            >
                {label}
            </span>
        </div>
    );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
    icon: Icon,
    title,
    subtitle,
    right,
}) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
                    <Icon
                        size={16}
                        strokeWidth={1.8}
                    />
                </div>

                <div>
                    <h2 className="text-xs font-semibold text-slate-900">
                        {title}
                    </h2>

                    <p className="mt-0.5 text-[9px] text-slate-400">
                        {subtitle}
                    </p>
                </div>
            </div>

            {right}
        </div>
    );
}

/* =========================================================
   SUMMARY ITEM
========================================================= */

function SummaryItem({
    label,
    value,
}) {
    return (
        <div className="bg-white px-5 py-4">
            <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                {label}
            </p>

            <p className="mt-1 text-xs font-semibold text-slate-800">
                {value || "Not available"}
            </p>
        </div>
    );
}