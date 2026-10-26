"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    Check,
    CheckCircle2,
    ClipboardCheck,
    Loader2,
    Plus,
    Save,
    Trash2,
    XCircle,
} from "lucide-react";

const STATUS_OPTIONS = [
    {
        value: "pass",
        label: "Pass",
        icon: CheckCircle2,
        active:
            "border-emerald-200 bg-emerald-50 text-emerald-700",
        iconClass: "text-emerald-600",
    },
    {
        value: "warning",
        label: "Warning",
        icon: AlertTriangle,
        active:
            "border-amber-200 bg-amber-50 text-amber-700",
        iconClass: "text-amber-600",
    },
    {
        value: "failed",
        label: "Failed",
        icon: XCircle,
        active:
            "border-red-200 bg-red-50 text-red-700",
        iconClass: "text-red-600",
    },
];

function normalizeChecklist(items = []) {
    return Array.isArray(items)
        ? items.map((item) => ({
            id:
                item?._id ||
                item?.id ||
                crypto.randomUUID(),

            item:
                typeof item?.item === "string"
                    ? item.item
                    : "",

            status:
                item?.status === "warning" ||
                    item?.status === "failed"
                    ? item.status
                    : "pass",

            remarks:
                typeof item?.remarks === "string"
                    ? item.remarks
                    : "",
        }))
        : [];
}

function toPayload(items = []) {
    return items.map((item) => ({
        item: item.item.trim(),
        status: item.status,
        remarks: item.remarks.trim(),
    }));
}

export default function InspectionChecklistPage() {
    const params = useParams();
    const router = useRouter();

    const inspectionId = params?.id;

    const [inspection, setInspection] =
        useState(null);

    const [checklist, setChecklist] =
        useState([]);

    const [savedSnapshot, setSavedSnapshot] =
        useState("[]");

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [saveError, setSaveError] =
        useState("");

    const [saveSuccess, setSaveSuccess] =
        useState(false);

    /* =====================================================
       LOAD INSPECTION
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
                        method: "GET",
                        credentials: "include",
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

                const currentInspection =
                    data.inspection;

                setInspection(
                    currentInspection
                );

                const normalized =
                    normalizeChecklist(
                        currentInspection?.checklist
                    );

                setChecklist(normalized);

                setSavedSnapshot(
                    JSON.stringify(
                        toPayload(normalized)
                    )
                );
            } catch (error) {
                console.error(
                    "❌ [CHECKLIST] Failed to load inspection:",
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
       UNSAVED CHANGES
    ====================================================== */

    const currentSnapshot = useMemo(
        () =>
            JSON.stringify(
                toPayload(checklist)
            ),
        [checklist]
    );

    const hasUnsavedChanges =
        currentSnapshot !== savedSnapshot;

    useEffect(() => {
        if (!hasUnsavedChanges) {
            return;
        }

        function handleBeforeUnload(event) {
            event.preventDefault();
            event.returnValue = "";
        }

        window.addEventListener(
            "beforeunload",
            handleBeforeUnload
        );

        return () => {
            window.removeEventListener(
                "beforeunload",
                handleBeforeUnload
            );
        };
    }, [hasUnsavedChanges]);

    /* =====================================================
       COUNTS
    ====================================================== */

    const counts = useMemo(() => {
        return {
            pass: checklist.filter(
                (item) =>
                    item.status === "pass"
            ).length,

            warning: checklist.filter(
                (item) =>
                    item.status === "warning"
            ).length,

            failed: checklist.filter(
                (item) =>
                    item.status === "failed"
            ).length,

            total: checklist.length,
        };
    }, [checklist]);

    /* =====================================================
       UPDATE ITEM
    ====================================================== */

    function updateChecklistItem(
        itemId,
        field,
        value
    ) {
        setSaveSuccess(false);
        setSaveError("");

        setChecklist((current) =>
            current.map((item) =>
                item.id === itemId
                    ? {
                        ...item,
                        [field]: value,
                    }
                    : item
            )
        );
    }

    /* =====================================================
       ADD ITEM
    ====================================================== */

    function addChecklistItem() {
        if (saving) {
            return;
        }

        if (checklist.length >= 100) {
            setSaveError(
                "You can add a maximum of 100 checklist items."
            );

            return;
        }

        setSaveSuccess(false);
        setSaveError("");

        setChecklist((current) => [
            ...current,
            {
                id: crypto.randomUUID(),
                item: "",
                status: "pass",
                remarks: "",
            },
        ]);
    }

    /* =====================================================
       VALIDATE CHECKLIST
    ====================================================== */

    function validateChecklist(items) {
        if (items.length === 0) {
            return "Add at least one checklist item before saving.";
        }

        const invalidItem = items.find(
            (item) =>
                !item.item ||
                item.item.trim().length === 0
        );

        if (invalidItem) {
            return "Every checklist item must have a name.";
        }

        const tooLongItem = items.find(
            (item) =>
                item.item.trim().length > 200
        );

        if (tooLongItem) {
            return "Checklist item names cannot exceed 200 characters.";
        }

        const tooLongRemark = items.find(
            (item) =>
                item.remarks.trim().length > 500
        );

        if (tooLongRemark) {
            return "Remarks cannot exceed 500 characters.";
        }

        return "";
    }

    /* =====================================================
       PERSIST CHECKLIST
    ====================================================== */

    async function persistChecklist(
        nextChecklist,
        successMessage = "Checklist saved successfully."
    ) {
        const cleanedChecklist =
            toPayload(nextChecklist);

        const validationError =
            validateChecklist(
                cleanedChecklist
            );

        if (validationError) {
            setSaveError(validationError);
            setSaveSuccess(false);

            return false;
        }

        try {
            setSaving(true);
            setSaveError("");
            setSaveSuccess(false);

            console.log(
                "📋 [CHECKLIST] Saving checklist..."
            );

            const response = await fetch(
                `/api/inspections/${inspectionId}/checklist`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        checklist:
                            cleanedChecklist,
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    "Unable to save checklist"
                );
            }

            console.log(
                "✅ [CHECKLIST] Checklist saved:",
                data
            );

            const savedChecklist =
                Array.isArray(
                    data?.inspection
                        ?.checklist
                )
                    ? data.inspection.checklist
                    : cleanedChecklist;

            const normalized =
                normalizeChecklist(
                    savedChecklist
                );

            setChecklist(normalized);

            setInspection((current) =>
                current
                    ? {
                        ...current,
                        checklist:
                            savedChecklist,
                    }
                    : current
            );

            setSavedSnapshot(
                JSON.stringify(
                    toPayload(normalized)
                )
            );

            setSaveSuccess(true);

            console.log(
                `✅ [CHECKLIST] ${successMessage}`
            );

            return true;
        } catch (error) {
            console.error(
                "❌ [CHECKLIST] Save failed:",
                error
            );

            setSaveError(
                error.message ||
                "Unable to save checklist"
            );

            setSaveSuccess(false);

            return false;
        } finally {
            setSaving(false);
        }
    }

    /* =====================================================
       DELETE ITEM
       IMPORTANT:
       Delete is persisted immediately.
    ====================================================== */

    async function removeChecklistItem(
        itemId
    ) {
        if (saving) {
            return;
        }

        if (checklist.length <= 1) {
            setSaveError(
                "At least one checklist item is required."
            );

            setSaveSuccess(false);

            return;
        }

        const itemToDelete =
            checklist.find(
                (item) =>
                    item.id === itemId
            );

        if (!itemToDelete) {
            return;
        }

        const nextChecklist =
            checklist.filter(
                (item) =>
                    item.id !== itemId
            );

        console.log(
            "🗑️ [CHECKLIST] Removing item:",
            itemToDelete.item
        );

        const success =
            await persistChecklist(
                nextChecklist,
                "Checklist item removed successfully."
            );

        if (!success) {
            return;
        }
    }

    /* =====================================================
       SAVE
    ====================================================== */

    async function saveChecklist() {
        return persistChecklist(
            checklist,
            "Checklist saved successfully."
        );
    }

    /* =====================================================
       CONTINUE
    ====================================================== */

    async function handleContinue() {
        const saved =
            await saveChecklist();

        if (!saved) {
            return;
        }

        router.push(
            `/inspections/create/${inspectionId}/evidence`
        );
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

                            <div className="mt-4 h-[460px] rounded-2xl bg-white ring-1 ring-slate-200" />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    /* =====================================================
       ERROR
    ====================================================== */

    if (error) {
        return (
            <div className="min-h-screen bg-[#F8FAFC]">
                <main className="px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-[980px]">
                        <div className="rounded-2xl border border-red-100 bg-white px-6 py-16 text-center shadow-sm">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600">
                                <AlertCircle
                                    size={20}
                                    strokeWidth={1.8}
                                />
                            </div>

                            <h1 className="mt-4 text-sm font-semibold text-slate-900">
                                Unable to load inspection
                            </h1>

                            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">
                                {error}
                            </p>

                            <Link
                                href="/inspections"
                                className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
                            >
                                <ArrowLeft
                                    size={13}
                                />
                                Back to inspections
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    /* =====================================================
       SUBMITTED PROTECTION
    ====================================================== */

    if (
        inspection?.status ===
        "submitted"
    ) {
        return (
            <div className="min-h-screen bg-[#F8FAFC]">
                <main className="px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-[980px]">
                        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600">
                                <Check
                                    size={20}
                                    strokeWidth={2}
                                />
                            </div>

                            <h1 className="mt-4 text-sm font-semibold text-slate-900">
                                Inspection already submitted
                            </h1>

                            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">
                                This inspection is locked and can no longer be edited.
                            </p>

                            <Link
                                href={`/inspections/${inspectionId}`}
                                className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-3.5 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
                            >
                                View inspection

                                <ArrowRight
                                    size={13}
                                />
                            </Link>
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
                            href="/inspections"
                            className="group inline-flex items-center gap-2 text-xs font-semibold text-slate-400 transition-colors hover:text-slate-800"
                        >
                            <ArrowLeft
                                size={15}
                                strokeWidth={1.9}
                                className="transition-transform group-hover:-translate-x-0.5"
                            />

                            Back to inspections
                        </Link>
                    </div>

                    {/* HEADER */}

                    <div className="mb-4 flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
                                <ClipboardCheck
                                    size={18}
                                    strokeWidth={1.8}
                                />
                            </div>

                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-600">
                                        Step 2 of 3
                                    </p>

                                    {hasUnsavedChanges && (
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-[9px] font-semibold text-amber-700">
                                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                            Unsaved changes
                                        </span>
                                    )}
                                </div>

                                <h1 className="mt-1 font-[Sora] text-xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-2xl">
                                    Inspection checklist
                                </h1>

                                <p className="mt-1 text-xs leading-5 text-slate-400">
                                    Record the condition of each inspection point.
                                </p>
                            </div>
                        </div>

                        <span className="hidden shrink-0 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-semibold text-blue-700 sm:inline-flex">
                            Draft
                        </span>
                    </div>

                    {/* STEP INDICATOR */}

                    <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-200/30 sm:px-5">
                        <div className="flex items-center">

                            <div className="flex items-center gap-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-700">
                                    <Check
                                        size={13}
                                        strokeWidth={2.2}
                                    />
                                </span>

                                <span className="hidden text-[11px] font-semibold text-slate-700 sm:block">
                                    Basic information
                                </span>
                            </div>

                            <div className="mx-3 h-px flex-1 bg-blue-200" />

                            <div className="flex items-center gap-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-sm shadow-blue-600/20">
                                    2
                                </span>

                                <span className="text-[11px] font-semibold text-slate-800">
                                    Checklist
                                </span>
                            </div>

                            <div className="mx-3 h-px flex-1 bg-slate-200" />

                            <div className="flex items-center gap-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-400">
                                    3
                                </span>

                                <span className="hidden text-[11px] font-medium text-slate-400 sm:block">
                                    Review
                                </span>
                            </div>

                        </div>
                    </div>

                    {/* CONTEXT */}

                    <div className="mb-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-200/20">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                                Asset
                            </p>

                            <p className="mt-1 truncate text-xs font-semibold text-slate-800">
                                {inspection?.assetName ||
                                    "Unnamed asset"}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-200/20">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                                Inspection type
                            </p>

                            <p className="mt-1 truncate text-xs font-semibold text-slate-800">
                                {inspection?.inspectionType ||
                                    "Inspection"}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-200/20">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                                Inspection points
                            </p>

                            <p className="mt-1 text-xs font-semibold text-slate-800">
                                {counts.total}
                            </p>
                        </div>
                    </div>

                    {/* CHECKLIST */}

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/30">

                        {/* HEADER */}

                        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <div>
                                <h2 className="font-[Sora] text-sm font-semibold tracking-[-0.02em] text-slate-900">
                                    Checklist items
                                </h2>

                                <p className="mt-1 text-[10px] font-medium text-slate-400">
                                    Mark each inspection point based on its current condition.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5">
                                <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[9px] font-semibold text-emerald-700">
                                    {counts.pass} Passed
                                </span>

                                <span className="rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[9px] font-semibold text-amber-700">
                                    {counts.warning} Warning
                                </span>

                                <span className="rounded-full border border-red-100 bg-red-50 px-2.5 py-1 text-[9px] font-semibold text-red-700">
                                    {counts.failed} Failed
                                </span>
                            </div>
                        </div>

                        {/* ITEMS */}

                        {checklist.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {checklist.map(
                                    (
                                        item,
                                        index
                                    ) => (
                                        <div
                                            key={
                                                item.id
                                            }
                                            className="px-4 py-4 sm:px-5"
                                        >
                                            <div className="flex items-start gap-3">

                                                {/* NUMBER */}

                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-400">
                                                    {String(
                                                        index +
                                                        1
                                                    ).padStart(
                                                        2,
                                                        "0"
                                                    )}
                                                </div>

                                                {/* CONTENT */}

                                                <div className="min-w-0 flex-1">

                                                    {/* ITEM NAME */}

                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={
                                                                item.item
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                updateChecklistItem(
                                                                    item.id,
                                                                    "item",
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Enter inspection point..."
                                                            maxLength={
                                                                200
                                                            }
                                                            disabled={
                                                                saving
                                                            }
                                                            className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-300 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-50"
                                                        />

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeChecklistItem(
                                                                    item.id
                                                                )
                                                            }
                                                            disabled={
                                                                saving ||
                                                                checklist.length <=
                                                                1
                                                            }
                                                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-40"
                                                            title={
                                                                checklist.length <=
                                                                    1
                                                                    ? "At least one checklist item is required"
                                                                    : "Remove item"
                                                            }
                                                            aria-label="Remove checklist item"
                                                        >
                                                            <Trash2
                                                                size={
                                                                    14
                                                                }
                                                                strokeWidth={
                                                                    1.8
                                                                }
                                                            />
                                                        </button>
                                                    </div>

                                                    {/* STATUS */}

                                                    <div className="mt-2.5 flex flex-col gap-2.5 lg:flex-row lg:items-center">
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {STATUS_OPTIONS.map(
                                                                (
                                                                    option
                                                                ) => {
                                                                    const Icon =
                                                                        option.icon;

                                                                    const isActive =
                                                                        item.status ===
                                                                        option.value;

                                                                    return (
                                                                        <button
                                                                            key={
                                                                                option.value
                                                                            }
                                                                            type="button"
                                                                            onClick={() =>
                                                                                updateChecklistItem(
                                                                                    item.id,
                                                                                    "status",
                                                                                    option.value
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                saving
                                                                            }
                                                                            className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[10px] font-semibold transition-all active:scale-[0.98] ${isActive
                                                                                ? option.active
                                                                                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                                                                                }`}
                                                                        >
                                                                            <Icon
                                                                                size={
                                                                                    12
                                                                                }
                                                                                strokeWidth={
                                                                                    1.9
                                                                                }
                                                                                className={
                                                                                    isActive
                                                                                        ? option.iconClass
                                                                                        : "text-slate-400"
                                                                                }
                                                                            />

                                                                            {
                                                                                option.label
                                                                            }
                                                                        </button>
                                                                    );
                                                                }
                                                            )}
                                                        </div>

                                                        {/* REMARKS */}

                                                        <input
                                                            type="text"
                                                            value={
                                                                item.remarks
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                updateChecklistItem(
                                                                    item.id,
                                                                    "remarks",
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Add observation or note..."
                                                            maxLength={
                                                                500
                                                            }
                                                            disabled={
                                                                saving
                                                            }
                                                            className="h-8 min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50/40 px-3 text-[10px] font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50 disabled:bg-slate-50"
                                                        />
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <div className="px-6 py-12 text-center">
                                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
                                    <ClipboardCheck
                                        size={19}
                                        strokeWidth={1.7}
                                    />
                                </div>

                                <h3 className="mt-3 text-sm font-semibold text-slate-900">
                                    No checklist items yet
                                </h3>

                                <p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-slate-400">
                                    Add inspection points to start recording the condition of this asset.
                                </p>

                                <button
                                    type="button"
                                    onClick={
                                        addChecklistItem
                                    }
                                    className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-3.5 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
                                >
                                    <Plus
                                        size={14}
                                        strokeWidth={2}
                                    />

                                    Add first item
                                </button>
                            </div>
                        )}

                        {/* ADD ITEM */}

                        {checklist.length > 0 && (
                            <div className="border-t border-slate-100 bg-slate-50/40 px-4 py-3 sm:px-5">
                                <button
                                    type="button"
                                    onClick={
                                        addChecklistItem
                                    }
                                    disabled={
                                        saving ||
                                        checklist.length >=
                                        100
                                    }
                                    className="inline-flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[10px] font-semibold text-slate-600 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50/40 hover:text-blue-700 disabled:pointer-events-none disabled:opacity-40"
                                >
                                    <Plus
                                        size={13}
                                        strokeWidth={2}
                                    />

                                    Add checklist item
                                </button>

                                <span className="ml-3 text-[9px] font-medium text-slate-400">
                                    {checklist.length}/100
                                </span>
                            </div>
                        )}

                        {/* FEEDBACK */}

                        {(saveError ||
                            saveSuccess) && (
                                <div className="border-t border-slate-100 px-4 py-3 sm:px-5">
                                    {saveError && (
                                        <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5">
                                            <AlertCircle
                                                size={14}
                                                className="mt-0.5 shrink-0 text-red-600"
                                            />

                                            <p className="text-[10px] font-semibold leading-4 text-red-700">
                                                {
                                                    saveError
                                                }
                                            </p>
                                        </div>
                                    )}

                                    {saveSuccess && (
                                        <div className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2.5">
                                            <CheckCircle2
                                                size={14}
                                                className="shrink-0 text-emerald-600"
                                            />

                                            <p className="text-[10px] font-semibold text-emerald-700">
                                                Checklist saved successfully.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                        {/* FOOTER */}

                        <div className="flex flex-col-reverse gap-2.5 border-t border-slate-100 bg-white px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">

                            <Link
                                href={`/inspections/${inspectionId}`}
                                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                                <ArrowLeft
                                    size={13}
                                    strokeWidth={1.9}
                                />

                                Cancel
                            </Link>

                            <div className="flex flex-col gap-2 sm:flex-row">

                                {/* SAVE */}

                                <button
                                    type="button"
                                    onClick={
                                        saveChecklist
                                    }
                                    disabled={
                                        saving ||
                                        checklist.length ===
                                        0 ||
                                        !hasUnsavedChanges
                                    }
                                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[11px] font-semibold text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
                                >
                                    {saving ? (
                                        <Loader2
                                            size={14}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <Save
                                            size={14}
                                            strokeWidth={
                                                1.9
                                            }
                                        />
                                    )}

                                    {saving
                                        ? "Saving..."
                                        : "Save checklist"}
                                </button>

                                {/* CONTINUE */}

                                <button
                                    type="button"
                                    onClick={
                                        handleContinue
                                    }
                                    disabled={
                                        saving ||
                                        checklist.length ===
                                        0
                                    }
                                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-[11px] font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2
                                                size={
                                                    14
                                                }
                                                className="animate-spin"
                                            />

                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            Continue

                                            <ArrowRight
                                                size={
                                                    14
                                                }
                                                strokeWidth={
                                                    1.9
                                                }
                                            />
                                        </>
                                    )}
                                </button>

                            </div>
                        </div>

                    </section>
                </div>
            </main>
        </div>
    );
}