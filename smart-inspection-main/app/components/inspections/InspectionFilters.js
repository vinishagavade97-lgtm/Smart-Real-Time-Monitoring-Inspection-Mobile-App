"use client";

import {
    Search,
    SlidersHorizontal,
    X,
    ChevronDown,
} from "lucide-react";

export default function InspectionFilters({
    search,
    onSearchChange,
    status,
    onStatusChange,
    result,
    onResultChange,
    onClear,
}) {
    const hasFilters =
        search.trim() ||
        status !== "all" ||
        result !== "all";

    const filterActive =
        status !== "all" ||
        result !== "all";

    return (
        <div className="border-b border-slate-100 bg-white px-4 py-4 sm:px-5 lg:px-6">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                {/* =====================================================
                    SEARCH
                ====================================================== */}

                <div className="relative min-w-0 flex-1 xl:max-w-[620px]">
                    <Search
                        size={16}
                        strokeWidth={1.8}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                            onSearchChange(
                                event.target.value
                            )
                        }
                        placeholder="Search by room, equipment or inspection type..."
                        aria-label="Search inspections"
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-4 text-xs font-medium text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    />

                    {/* Keyboard hint */}
                    {!search && (
                        <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-medium text-slate-400 shadow-sm sm:block">
                            Search
                        </span>
                    )}
                </div>

                {/* =====================================================
                    FILTER CONTROLS
                ====================================================== */}

                <div className="flex flex-wrap items-center gap-2">
                    {/* Filter label */}
                    <div className="mr-1 hidden items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400 xl:flex">
                        <SlidersHorizontal
                            size={13}
                            strokeWidth={1.8}
                        />

                        Filters
                    </div>

                    {/* Status */}
                    <div
                        className={`relative flex h-10 items-center rounded-xl border bg-white transition-all duration-200 ${status !== "all"
                            ? "border-blue-200 bg-blue-50/40"
                            : "border-slate-200 hover:border-slate-300"
                            }`}
                    >
                        <select
                            value={status}
                            onChange={(event) =>
                                onStatusChange(
                                    event.target.value
                                )
                            }
                            aria-label="Filter by status"
                            className={`h-full appearance-none bg-transparent pl-3 pr-9 text-xs font-semibold outline-none ${status !== "all"
                                ? "text-blue-700"
                                : "text-slate-600"
                                }`}
                        >
                            <option value="all">
                                All status
                            </option>

                            <option value="draft">
                                Draft
                            </option>

                            <option value="submitted">
                                Submitted
                            </option>
                        </select>

                        <ChevronDown
                            size={14}
                            strokeWidth={1.8}
                            className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 ${status !== "all"
                                ? "text-blue-500"
                                : "text-slate-400"
                                }`}
                        />
                    </div>

                    {/* Result */}
                    <div
                        className={`relative flex h-10 items-center rounded-xl border bg-white transition-all duration-200 ${result !== "all"
                            ? "border-blue-200 bg-blue-50/40"
                            : "border-slate-200 hover:border-slate-300"
                            }`}
                    >
                        <select
                            value={result}
                            onChange={(event) =>
                                onResultChange(
                                    event.target.value
                                )
                            }
                            aria-label="Filter by result"
                            className={`h-full appearance-none bg-transparent pl-3 pr-9 text-xs font-semibold outline-none ${result !== "all"
                                ? "text-blue-700"
                                : "text-slate-600"
                                }`}
                        >
                            <option value="all">
                                All results
                            </option>

                            <option value="pending">
                                Pending
                            </option>

                            <option value="passed">
                                Passed
                            </option>

                            <option value="warning">
                                Warning
                            </option>

                            <option value="failed">
                                Failed
                            </option>
                        </select>

                        <ChevronDown
                            size={14}
                            strokeWidth={1.8}
                            className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 ${result !== "all"
                                ? "text-blue-500"
                                : "text-slate-400"
                                }`}
                        />
                    </div>

                    {/* Clear */}
                    {hasFilters && (
                        <button
                            type="button"
                            onClick={onClear}
                            className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-slate-500 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]"
                        >
                            <X
                                size={14}
                                strokeWidth={1.9}
                            />

                            Clear
                        </button>
                    )}

                    {/* Active filter indicator */}
                    {filterActive && (
                        <span className="ml-0.5 hidden h-1.5 w-1.5 rounded-full bg-blue-600 sm:block" />
                    )}
                </div>
            </div>

            {/* =====================================================
                MOBILE FILTER SUMMARY
            ====================================================== */}

            {filterActive && (
                <div className="mt-3 flex items-center gap-2 xl:hidden">
                    <span className="text-[10px] font-medium text-slate-400">
                        Filters active
                    </span>

                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                </div>
            )}
        </div>
    );
}