"use client";

import Link from "next/link";

import {
    ArrowRight,
    ClipboardList,
    RefreshCw,
} from "lucide-react";

import InspectionRow from "./InspectionRow";
import Pagination from "../ui/Pagination";

export default function RecentInspections({
    inspections = [],
    loading = false,
    error = "",
    onRetry,
    pagination = {
        page: 1,
        total: 0,
        totalPages: 1,
    },
    onPageChange,
}) {
    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">

            {/* =================================================
                HEADER
            ================================================== */}

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">

                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="font-[Sora] text-sm font-semibold tracking-[-0.02em] text-slate-900">
                            Recent inspections
                        </h2>

                        {!loading &&
                            !error &&
                            pagination.total > 0 && (
                                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-500">
                                    {pagination.total}
                                </span>
                            )}
                    </div>

                    <p className="mt-1 text-[11px] text-slate-400">
                        Latest inspection activity
                    </p>
                </div>

                <Link
                    href="/inspections"
                    className="group inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] font-semibold text-slate-500 transition-colors hover:bg-slate-50 hover:text-blue-600"
                >
                    <span className="hidden sm:inline">
                        View all
                    </span>

                    <ArrowRight
                        size={14}
                        strokeWidth={1.9}
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                </Link>

            </div>

            {/* =================================================
                LOADING
            ================================================== */}

            {loading && (
                <div className="divide-y divide-slate-100">

                    {[1, 2, 3, 4, 5].map(
                        (item) => (
                            <div
                                key={item}
                                className="flex items-center gap-3 px-5 py-4 sm:px-6"
                            >

                                <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-slate-100" />

                                <div className="min-w-0 flex-1">

                                    <div className="h-3.5 w-40 animate-pulse rounded bg-slate-100" />

                                    <div className="mt-2 h-3 w-28 animate-pulse rounded bg-slate-100" />

                                    <div className="mt-2 h-2.5 w-32 animate-pulse rounded bg-slate-100" />

                                </div>

                                <div className="hidden h-6 w-16 animate-pulse rounded-full bg-slate-100 sm:block" />

                            </div>
                        )
                    )}

                </div>
            )}

            {/* =================================================
                ERROR
            ================================================== */}

            {!loading && error && (
                <div className="flex flex-col items-center justify-center px-6 py-12 text-center">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                        <ClipboardList
                            size={19}
                            strokeWidth={1.8}
                        />
                    </div>

                    <h3 className="mt-4 text-sm font-semibold text-slate-900">
                        Unable to load inspections
                    </h3>

                    <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
                        We couldn't retrieve your recent
                        inspection activity.
                    </p>

                    {onRetry && (
                        <button
                            type="button"
                            onClick={onRetry}
                            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                        >
                            <RefreshCw
                                size={13}
                            />

                            Try again
                        </button>
                    )}

                </div>
            )}

            {/* =================================================
                EMPTY
            ================================================== */}

            {!loading &&
                !error &&
                inspections.length === 0 && (
                    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">

                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                            <ClipboardList
                                size={21}
                                strokeWidth={1.7}
                            />
                        </div>

                        <h3 className="mt-4 text-sm font-semibold text-slate-900">
                            No inspections yet
                        </h3>

                        <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
                            Your recent inspections will
                            appear here once you create
                            your first inspection.
                        </p>

                        <Link
                            href="/inspections/create"
                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 transition-colors hover:bg-blue-700"
                        >
                            Create inspection

                            <ArrowRight
                                size={13}
                            />
                        </Link>

                    </div>
                )}

            {/* =================================================
                DATA
            ================================================== */}

            {!loading &&
                !error &&
                inspections.length > 0 && (
                    <>
                        {/* Inspection rows */}

                        <div className="divide-y divide-slate-100">

                            {inspections.map(
                                (inspection) => (
                                    <InspectionRow
                                        key={
                                            inspection.id ||
                                            inspection._id
                                        }
                                        inspection={
                                            inspection
                                        }
                                    />
                                )
                            )}

                        </div>

                        {/* =================================================
                            PAGINATION
                        ================================================== */}

                        {pagination.totalPages >
                            1 && (
                                <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

                                    {/* Pagination information */}

                                    <p className="text-[11px] font-medium text-slate-400">

                                        Showing page{" "}

                                        <span className="font-semibold text-slate-600">
                                            {
                                                pagination.page
                                            }
                                        </span>

                                        {" "}of{" "}

                                        <span className="font-semibold text-slate-600">
                                            {
                                                pagination.totalPages
                                            }
                                        </span>

                                    </p>

                                    {/* Pagination component */}

                                    {onPageChange && (
                                        <Pagination
                                            page={
                                                pagination.page
                                            }
                                            totalPages={
                                                pagination.totalPages
                                            }
                                            onPageChange={
                                                onPageChange
                                            }
                                        />
                                    )}

                                </div>
                            )}

                    </>
                )}

        </section>
    );
}