"use client";

import { useEffect, useState } from "react";

import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    ClipboardCheck,
    Crosshair,
    MapPin,
    RefreshCw,
} from "lucide-react";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function CreateInspectionPage() {
    const router = useRouter();
    const params = useParams();

    const inspectionId = params?.id;

    const [assetName, setAssetName] = useState("");
    const [inspectionType, setInspectionType] =
        useState("");

    const [location, setLocation] = useState(null);

    const [locationLoading, setLocationLoading] =
        useState(false);

    const [locationError, setLocationError] =
        useState("");

    const [inspectedAt, setInspectedAt] =
        useState("");

    const [submitting, setSubmitting] =
        useState(false);

    const [submitError, setSubmitError] =
        useState("");

    const [loadingInspection, setLoadingInspection] =
        useState(true);

    // ============================================================
    // LOAD EXISTING DRAFT
    // ============================================================

    useEffect(() => {
        if (!inspectionId) {
            setLoadingInspection(false);
            return;
        }

        async function loadInspection() {
            try {
                setLoadingInspection(true);
                setSubmitError("");

                console.log(
                    "📋 [CONTINUE INSPECTION] Loading draft:",
                    inspectionId
                );

                const response = await fetch(
                    `/api/inspections/${inspectionId}`,
                    {
                        method: "GET",
                        credentials: "include",
                        cache: "no-store",
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data?.message ||
                        "Unable to load inspection"
                    );
                }

                const inspection =
                    data?.inspection ||
                    data?.data ||
                    data;

                if (!inspection) {
                    throw new Error(
                        "Inspection data was not found."
                    );
                }

                // Submitted inspections are locked.
                if (inspection.status !== "draft") {
                    console.log(
                        "🔒 [CONTINUE INSPECTION] Inspection is already submitted."
                    );

                    router.replace(
                        `/inspections/${inspectionId}`
                    );

                    return;
                }

                // ------------------------------------------------
                // Existing basic information
                // ------------------------------------------------

                setAssetName(
                    inspection.assetName || ""
                );

                setInspectionType(
                    inspection.inspectionType || ""
                );

                // ------------------------------------------------
                // Existing inspection date/time
                // ------------------------------------------------

                if (inspection.inspectedAt) {
                    const date = new Date(
                        inspection.inspectedAt
                    );

                    if (!Number.isNaN(date.getTime())) {
                        const localDate = new Date(
                            date.getTime() -
                            date.getTimezoneOffset() *
                            60000
                        );

                        setInspectedAt(
                            localDate
                                .toISOString()
                                .slice(0, 16)
                        );
                    }
                }

                // ------------------------------------------------
                // Existing location
                // ------------------------------------------------

                if (
                    inspection.location &&
                    Number.isFinite(
                        Number(
                            inspection.location.latitude
                        )
                    ) &&
                    Number.isFinite(
                        Number(
                            inspection.location.longitude
                        )
                    )
                ) {
                    setLocation({
                        latitude: Number(
                            inspection.location.latitude
                        ),
                        longitude: Number(
                            inspection.location.longitude
                        ),
                    });
                }

                console.log(
                    "✅ [CONTINUE INSPECTION] Draft loaded successfully."
                );
            } catch (error) {
                console.error(
                    "❌ [CONTINUE INSPECTION] Failed to load draft:",
                    error
                );

                setSubmitError(
                    error.message ||
                    "Unable to load inspection. Please try again."
                );
            } finally {
                setLoadingInspection(false);
            }
        }

        loadInspection();
    }, [inspectionId, router]);

    // ============================================================
    // CAPTURE LOCATION
    // ============================================================

    function captureLocation() {
        if (!navigator.geolocation) {
            setLocationError(
                "Geolocation is not supported by this browser."
            );

            return;
        }

        setLocationLoading(true);
        setLocationError("");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude:
                        position.coords.latitude,

                    longitude:
                        position.coords.longitude,
                });

                setLocationLoading(false);
            },

            (error) => {
                console.error(
                    "❌ Location capture failed:",
                    error
                );

                setLocationLoading(false);

                if (
                    error.code ===
                    error.PERMISSION_DENIED
                ) {
                    setLocationError(
                        "Location permission was denied. Please allow location access and try again."
                    );
                } else if (
                    error.code ===
                    error.POSITION_UNAVAILABLE
                ) {
                    setLocationError(
                        "Your current location could not be determined."
                    );
                } else {
                    setLocationError(
                        "Unable to capture your location. Please try again."
                    );
                }
            },

            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    }

    // ============================================================
    // FORM VALIDATION
    // ============================================================

    const isValid =
        assetName.trim().length >= 2 &&
        inspectionType.trim().length >= 2 &&
        location !== null &&
        inspectedAt;

    // ============================================================
    // UPDATE EXISTING DRAFT & CONTINUE
    // ============================================================

    async function handleContinue() {
        if (
            !isValid ||
            submitting ||
            !inspectionId
        ) {
            return;
        }

        try {
            setSubmitting(true);
            setSubmitError("");

            console.log(
                "📋 [CONTINUE INSPECTION] Updating existing draft..."
            );

            const response = await fetch(
                `/api/inspections/${inspectionId}`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        assetName:
                            assetName.trim(),

                        inspectionType:
                            inspectionType.trim(),

                        location: {
                            latitude:
                                location.latitude,

                            longitude:
                                location.longitude,
                        },

                        inspectedAt:
                            new Date(
                                inspectedAt
                            ).toISOString(),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    "Unable to update inspection"
                );
            }

            console.log(
                "✅ [CONTINUE INSPECTION] Draft updated successfully:",
                data
            );

            // Move to existing checklist.
            router.push(
                `/inspections/create/${inspectionId}/checklist`
            );
        } catch (error) {
            console.error(
                "❌ [CONTINUE INSPECTION] Failed:",
                error
            );

            setSubmitError(
                error.message ||
                "Unable to save inspection. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    }

    // ============================================================
    // LOADING STATE
    // ============================================================

    if (loadingInspection) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <RefreshCw
                        size={15}
                        strokeWidth={1.9}
                        className="animate-spin"
                    />

                    Loading inspection...
                </div>
            </div>
        );
    }

    // ============================================================
    // PAGE
    // ============================================================

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <main className="px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-[980px]">

                    {/* =================================================
                        BACK
                    ================================================== */}

                    <div className="mb-5">
                        <Link
                            href="/inspections"
                            className="group inline-flex items-center gap-2 text-xs font-semibold text-slate-400 transition-colors hover:text-slate-800"
                        >
                            <ArrowLeft
                                size={15}
                                strokeWidth={1.9}
                                className="transition-transform duration-200 group-hover:-translate-x-0.5"
                            />

                            Back to inspections
                        </Link>
                    </div>

                    {/* =================================================
                        PAGE HEADER
                    ================================================== */}

                    <div className="mb-5">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
                                <ClipboardCheck
                                    size={18}
                                    strokeWidth={1.8}
                                />
                            </div>

                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-600">
                                    Draft inspection
                                </p>

                                <h1 className="mt-1 font-[Sora] text-xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-2xl">
                                    Continue inspection
                                </h1>

                                <p className="mt-1.5 max-w-xl text-xs leading-5 text-slate-400">
                                    Review the basic inspection details before continuing to the checklist.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* =================================================
                        STEP INDICATOR
                    ================================================== */}

                    <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm shadow-slate-200/30 sm:px-5">
                        <div className="flex items-center">

                            <div className="flex items-center gap-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-sm shadow-blue-600/20">
                                    1
                                </span>

                                <span className="text-[11px] font-semibold text-slate-800">
                                    Basic information
                                </span>
                            </div>

                            <div className="mx-3 h-px flex-1 bg-slate-200" />

                            <div className="flex items-center gap-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-400">
                                    2
                                </span>

                                <span className="hidden text-[11px] font-medium text-slate-400 sm:block">
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

                    {/* =================================================
                        FORM CARD
                    ================================================== */}

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/30">

                        {/* Card header */}

                        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                            <h2 className="font-[Sora] text-sm font-semibold tracking-[-0.02em] text-slate-900">
                                Inspection information
                            </h2>

                            <p className="mt-1 text-[10px] font-medium text-slate-400">
                                Update the asset and inspection details if required.
                            </p>
                        </div>

                        <div className="px-5 py-5 sm:px-6 sm:py-6">

                            {/* =================================================
                                FORM GRID
                            ================================================== */}

                            <div className="grid gap-5 sm:grid-cols-2">

                                {/* Asset */}

                                <div>
                                    <label
                                        htmlFor="assetName"
                                        className="mb-2 block text-[10px] font-semibold text-slate-700"
                                    >
                                        Asset / equipment

                                        <span className="ml-1 text-red-500">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        id="assetName"
                                        type="text"
                                        value={assetName}
                                        onChange={(event) =>
                                            setAssetName(
                                                event.target
                                                    .value
                                            )
                                        }
                                        placeholder="e.g. Computer Lab 1"
                                        maxLength={150}
                                        disabled={submitting}
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-300 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50"
                                    />

                                    <p className="mt-1.5 text-[9px] text-slate-400">
                                        Enter the equipment, room, machine or asset being inspected.
                                    </p>
                                </div>

                                {/* Inspection type */}

                                <div>
                                    <label
                                        htmlFor="inspectionType"
                                        className="mb-2 block text-[10px] font-semibold text-slate-700"
                                    >
                                        Inspection type

                                        <span className="ml-1 text-red-500">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        id="inspectionType"
                                        type="text"
                                        value={
                                            inspectionType
                                        }
                                        onChange={(event) =>
                                            setInspectionType(
                                                event.target
                                                    .value
                                            )
                                        }
                                        placeholder="e.g. Daily Lab Inspection"
                                        maxLength={100}
                                        disabled={submitting}
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-300 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50"
                                    />

                                    <p className="mt-1.5 text-[9px] text-slate-400">
                                        Describe the purpose or type of this inspection.
                                    </p>
                                </div>

                                {/* Date / time */}

                                <div>
                                    <label
                                        htmlFor="inspectedAt"
                                        className="mb-2 block text-[10px] font-semibold text-slate-700"
                                    >
                                        Inspection date & time

                                        <span className="ml-1 text-red-500">
                                            *
                                        </span>
                                    </label>

                                    <div className="relative">
                                        <CalendarDays
                                            size={15}
                                            strokeWidth={1.8}
                                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                        />

                                        <input
                                            id="inspectedAt"
                                            type="datetime-local"
                                            value={
                                                inspectedAt
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setInspectedAt(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            disabled={
                                                submitting
                                            }
                                            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-xs font-medium text-slate-700 outline-none transition-all hover:border-slate-300 focus:border-blue-300 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50"
                                        />
                                    </div>

                                    <p className="mt-1.5 text-[9px] text-slate-400">
                                        The inspection time is recorded with the inspection.
                                    </p>
                                </div>

                                {/* Location */}

                                <div>
                                    <label className="mb-2 block text-[10px] font-semibold text-slate-700">
                                        Inspection location

                                        <span className="ml-1 text-red-500">
                                            *
                                        </span>
                                    </label>

                                    <div
                                        className={`min-h-[86px] rounded-xl border p-3 ${location
                                            ? "border-emerald-200 bg-emerald-50/40"
                                            : "border-slate-200 bg-slate-50/50"
                                            }`}
                                    >
                                        {location ? (
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex min-w-0 items-center gap-2.5">
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                                                        <MapPin
                                                            size={
                                                                15
                                                            }
                                                            strokeWidth={
                                                                1.9
                                                            }
                                                        />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-bold text-emerald-700">
                                                            Location captured
                                                        </p>

                                                        <p className="mt-1 truncate text-[9px] font-medium text-slate-500">
                                                            {location.latitude.toFixed(
                                                                4
                                                            )}
                                                            ,{" "}
                                                            {location.longitude.toFixed(
                                                                4
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={
                                                        captureLocation
                                                    }
                                                    disabled={
                                                        locationLoading ||
                                                        submitting
                                                    }
                                                    className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[9px] font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <RefreshCw
                                                        size={
                                                            12
                                                        }
                                                        strokeWidth={
                                                            1.9
                                                        }
                                                    />

                                                    Recapture
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex min-w-0 items-center gap-2.5">
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 ring-1 ring-slate-200">
                                                        <Crosshair
                                                            size={
                                                                15
                                                            }
                                                            strokeWidth={
                                                                1.8
                                                            }
                                                        />
                                                    </div>

                                                    <div>
                                                        <p className="text-[10px] font-semibold text-slate-700">
                                                            Capture current location
                                                        </p>

                                                        <p className="mt-1 text-[9px] text-slate-400">
                                                            GPS coordinates are required.
                                                        </p>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={
                                                        captureLocation
                                                    }
                                                    disabled={
                                                        locationLoading ||
                                                        submitting
                                                    }
                                                    className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-[9px] font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    {locationLoading ? (
                                                        <>
                                                            <RefreshCw
                                                                size={
                                                                    12
                                                                }
                                                                className="animate-spin"
                                                            />

                                                            Detecting
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Crosshair
                                                                size={
                                                                    12
                                                                }
                                                                strokeWidth={
                                                                    2
                                                                }
                                                            />

                                                            Get location
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {locationError && (
                                        <p className="mt-1.5 text-[9px] font-medium text-red-500">
                                            {locationError}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Submit error */}

                            {submitError && (
                                <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3">
                                    <p className="text-[10px] font-semibold text-red-700">
                                        {submitError}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* =================================================
                            FOOTER
                        ================================================== */}

                        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <p className="text-[9px] font-medium text-slate-400">
                                Fields marked with{" "}
                                <span className="text-red-500">
                                    *
                                </span>{" "}
                                are required.
                            </p>

                            <button
                                type="button"
                                onClick={
                                    handleContinue
                                }
                                disabled={
                                    !isValid ||
                                    submitting
                                }
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                            >
                                {submitting ? (
                                    <>
                                        <RefreshCw
                                            size={14}
                                            strokeWidth={1.9}
                                            className="animate-spin"
                                        />

                                        Saving inspection...
                                    </>
                                ) : (
                                    <>
                                        Continue to checklist

                                        <ArrowRight
                                            size={14}
                                            strokeWidth={1.9}
                                        />
                                    </>
                                )}
                            </button>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}