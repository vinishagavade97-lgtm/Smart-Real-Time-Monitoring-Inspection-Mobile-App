"use client";

import {
    ClipboardList,
    RefreshCw,
    SearchX,
} from "lucide-react";

import InspectionListItem from "./InspectionListItem";

export default function InspectionList({
    inspections = [],
    loading = false,
    error = "",
    onRetry,
}) {
    // =========================================================
    // LOADING STATE
    // =========================================================

    if (loading) {
        return (
            <div className="divide-y divide-slate-100">
                {[1, 2, 3, 4].map((item) => (
                    <div
                        key={item}
                        className="px-5 py-5 sm:px-6"
                    >
                        <div className="flex items-center gap-4">
                            {/* Icon skeleton */}
                            <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-slate-100" />

                            {/* Content skeleton */}
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <div className="h-3.5 w-36 animate-pulse rounded-md bg-slate-100" />

                                    <div className="h-5 w-14 animate-pulse rounded-full bg-slate-100" />
                                </div>

                                <div className="mt-2 h-3 w-28 animate-pulse rounded-md bg-slate-100" />

                                <div className="mt-3 flex gap-3">
                                    <div className="h-2.5 w-24 animate-pulse rounded-md bg-slate-100" />

                                    <div className="h-2.5 w-20 animate-pulse rounded-md bg-slate-100" />

                                    <div className="hidden h-2.5 w-14 animate-pulse rounded-md bg-slate-100 sm:block" />
                                </div>
                            </div>

                            {/* Action skeleton */}
                            <div className="hidden h-9 w-24 shrink-0 animate-pulse rounded-lg bg-slate-100 sm:block" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // =========================================================
    // ERROR STATE
    // =========================================================

    if (error) {
        return (
            <div className="relative overflow-hidden px-6 py-16 text-center sm:py-20">
                {/* Subtle background */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.035),transparent_55%)]" />

                <div className="relative">
                    {/* Icon */}
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-600">
                        <ClipboardList
                            size={20}
                            strokeWidth={1.7}
                        />
                    </div>

                    {/* Heading */}
                    <h3 className="mt-4 text-sm font-semibold tracking-[-0.01em] text-slate-900">
                        Unable to load inspections
                    </h3>

                    {/* Description */}
                    <p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-slate-400">
                        We couldn't retrieve your
                        inspection records right now.
                        Please try again.
                    </p>

                    {/* Error detail */}
                    <p className="mx-auto mt-2 max-w-md truncate px-4 text-[10px] font-medium text-red-500">
                        {error}
                    </p>

                    {/* Retry */}
                    {onRetry && (
                        <button
                            type="button"
                            onClick={onRetry}
                            className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 shadow-sm shadow-slate-200/40 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98]"
                        >
                            <RefreshCw
                                size={13}
                                strokeWidth={1.9}
                            />

                            Try again
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // =========================================================
    // EMPTY STATE
    // =========================================================

    if (inspections.length === 0) {
        return (
            <div className="relative overflow-hidden px-6 py-16 text-center sm:py-20">
                {/* Background detail */}
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-50/40 blur-3xl" />

                <div className="relative">
                    {/* Icon */}
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400">
                        <SearchX
                            size={20}
                            strokeWidth={1.6}
                        />
                    </div>

                    {/* Heading */}
                    <h3 className="mt-4 text-sm font-semibold tracking-[-0.01em] text-slate-900">
                        No inspections found
                    </h3>

                    {/* Description */}
                    <p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-slate-400">
                        No inspection records match
                        your current search or
                        filters.
                    </p>

                    {/* Small contextual hint */}
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm shadow-slate-200/30">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />

                        <span className="text-[10px] font-medium text-slate-500">
                            Try changing your filters
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================
    // DATA STATE
    // =========================================================

    return (
        <div className="divide-y divide-slate-100">
            {inspections.map((inspection) => (
                <InspectionListItem
                    key={
                        inspection.id ||
                        inspection._id
                    }
                    inspection={inspection}
                />
            ))}
        </div>
    );
}