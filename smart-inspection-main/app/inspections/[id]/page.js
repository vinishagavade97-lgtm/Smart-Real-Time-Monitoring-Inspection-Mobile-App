"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import InspectionOverview from "../../components/inspections/InspectionOverview";
import InspectionChecklist from "../../components/inspections/InspectionChecklist";
import InspectionEvidence from "../../components/inspections/InspectionEvidence";
import InspectionSummary from "../../components/inspections/InspectionSummary";
import InspectionLocation from "../../components/inspections/InspectionLocation";
import InspectionRemarks from "../../components/inspections/InspectionRemarks";

export default function InspectionDetailsPage() {
    const params = useParams();

    const inspectionId = params?.id;

    const [inspection, setInspection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data?.message ||
                        "Unable to load inspection"
                    );
                }

                setInspection(data.inspection);
            } catch (error) {
                console.error(
                    "❌ Failed to load inspection:",
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
       LOADING
    ====================================================== */

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC]">
                <main className="px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-[1280px]">
                        <div className="animate-pulse">
                            <div className="h-4 w-32 rounded bg-slate-200" />

                            <div className="mt-5 h-[300px] rounded-2xl bg-white ring-1 ring-slate-200" />

                            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.8fr)]">
                                <div className="h-[280px] rounded-2xl bg-white ring-1 ring-slate-200" />

                                <div className="h-[280px] rounded-2xl bg-white ring-1 ring-slate-200" />
                            </div>

                            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]">
                                <div className="h-[280px] rounded-2xl bg-white ring-1 ring-slate-200" />

                                <div className="h-[280px] rounded-2xl bg-white ring-1 ring-slate-200" />
                            </div>

                            <div className="mt-4 h-[130px] rounded-2xl bg-white ring-1 ring-slate-200" />
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
                    <div className="mx-auto max-w-[1280px]">
                        <div className="rounded-2xl border border-red-100 bg-white px-6 py-16 text-center shadow-sm shadow-slate-200/30">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-sm font-bold text-red-600">
                                !
                            </div>

                            <h1 className="mt-4 text-sm font-semibold text-slate-900">
                                Unable to load inspection
                            </h1>

                            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">
                                {error}
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    /* =====================================================
       NOT FOUND
    ====================================================== */

    if (!inspection) {
        return (
            <div className="min-h-screen bg-[#F8FAFC]">
                <main className="px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-[1280px]">
                        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm shadow-slate-200/30">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
                                —
                            </div>

                            <h1 className="mt-4 text-sm font-semibold text-slate-900">
                                Inspection not found
                            </h1>

                            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">
                                This inspection may no longer exist or you may not have access to it.
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    /* =====================================================
       REAL INSPECTION PAGE
    ====================================================== */

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <main className="px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-[1280px]">

                    {/* =================================================
                        OVERVIEW
                    ================================================== */}

                    <InspectionOverview
                        inspection={inspection}
                    />

                    {/* =================================================
                        CHECKLIST + SUMMARY
                    ================================================== */}

                    <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.8fr)]">
                        <InspectionChecklist
                            checklist={
                                inspection.checklist || []
                            }
                        />

                        <InspectionSummary
                            inspection={inspection}
                        />
                    </div>

                    {/* =================================================
                        EVIDENCE + LOCATION
                    ================================================== */}

                    <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]">
                        <InspectionEvidence
                            evidence={
                                inspection.evidence || []
                            }
                        />

                        <InspectionLocation
                            location={
                                inspection.location
                            }
                        />
                    </div>

                    {/* =================================================
                        REMARKS
                    ================================================== */}

                    <div className="mt-4">
                        <InspectionRemarks
                            remarks={
                                inspection.remarks || ""
                            }
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}