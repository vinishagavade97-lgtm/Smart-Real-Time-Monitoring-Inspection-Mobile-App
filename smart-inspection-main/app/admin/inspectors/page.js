"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
    ArrowLeft,
    Search,
    UserRound,
    UserCheck,
    UserX,
    Trash2,
    RefreshCw,
    ShieldCheck,
    Users,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
} from "lucide-react";

const DEFAULT_PAGINATION = {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
};

const DEFAULT_SUMMARY = {
    total: 0,
    active: 0,
    inactive: 0,
};

export default function AdminInspectorsPage() {
    const [user, setUser] = useState(null);
    const [inspectors, setInspectors] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState("");

    const [search, setSearch] = useState("");

    const [summary, setSummary] = useState(DEFAULT_SUMMARY);

    const [pagination, setPagination] = useState(
        DEFAULT_PAGINATION
    );

    // ============================================================
    // LOAD INSPECTORS
    // ============================================================

    const loadPage = async (
        page = 1,
        searchValue = ""
    ) => {
        try {
            setLoading(true);
            setError("");

            // ----------------------------------------------------
            // Verify authentication
            // ----------------------------------------------------

            const authResponse = await fetch(
                "/api/auth/me",
                {
                    credentials: "include",
                    cache: "no-store",
                }
            );

            let authData = null;

            try {
                authData = await authResponse.json();
            } catch {
                authData = null;
            }

            if (
                !authResponse.ok ||
                !authData?.user
            ) {
                window.location.href = "/login";
                return;
            }

            // ----------------------------------------------------
            // Admin only
            // ----------------------------------------------------

            if (
                authData.user.role !== "admin"
            ) {
                window.location.href = "/dashboard";
                return;
            }

            setUser(authData.user);

            // ----------------------------------------------------
            // Build query
            // ----------------------------------------------------

            const params = new URLSearchParams();

            params.set(
                "page",
                String(page)
            );

            params.set(
                "limit",
                "10"
            );

            if (searchValue.trim()) {
                params.set(
                    "search",
                    searchValue.trim()
                );
            }

            // ----------------------------------------------------
            // Fetch inspector accounts
            // ----------------------------------------------------

            const response = await fetch(
                `/api/admin/inspectors?${params.toString()}`,
                {
                    credentials: "include",
                    cache: "no-store",
                }
            );

            let data = null;

            try {
                data = await response.json();
            } catch {
                throw new Error(
                    "The inspector API returned an invalid response."
                );
            }

            if (
                !response.ok ||
                !data?.success
            ) {
                throw new Error(
                    data?.message ||
                    "Unable to load inspector accounts."
                );
            }

            // ----------------------------------------------------
            // Update state
            // ----------------------------------------------------

            setInspectors(
                Array.isArray(
                    data.data?.inspectors
                )
                    ? data.data.inspectors
                    : []
            );

            setSummary(
                data.data?.summary || DEFAULT_SUMMARY
            );

            setPagination(
                data.data?.pagination ||
                DEFAULT_PAGINATION
            );
        } catch (err) {
            console.error(
                "❌ [ADMIN INSPECTORS] Loading error:",
                err
            );

            setError(
                err?.message ||
                "Unable to load inspector accounts."
            );
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // INITIAL LOAD + SEARCH
    // ============================================================

    useEffect(() => {
        const timer = setTimeout(() => {
            loadPage(1, search);
        }, search ? 400 : 0);

        return () => {
            clearTimeout(timer);
        };
    }, [search]);

    // ============================================================
    // TOGGLE ACTIVE / INACTIVE
    // ============================================================

    const handleToggleStatus = async (
        inspector
    ) => {
        const nextStatus =
            inspector.isActive === false;

        const confirmed = window.confirm(
            nextStatus
                ? `Activate ${inspector.name}?`
                : `Deactivate ${inspector.name}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(
                `status-${inspector.id}`
            );

            setError("");

            const response = await fetch(
                `/api/admin/inspectors/${inspector.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        isActive: nextStatus,
                    }),
                }
            );

            let data = null;

            try {
                data = await response.json();
            } catch {
                throw new Error(
                    "The server returned an invalid response."
                );
            }

            if (
                !response.ok ||
                !data?.success
            ) {
                throw new Error(
                    data?.message ||
                    "Unable to update inspector status."
                );
            }

            await loadPage(
                pagination.page,
                search
            );
        } catch (err) {
            console.error(
                "❌ [ADMIN INSPECTORS] Status update error:",
                err
            );

            setError(
                err?.message ||
                "Unable to update inspector status."
            );
        } finally {
            setActionLoading("");
        }
    };

    // ============================================================
    // DELETE INSPECTOR
    // ============================================================

    const handleDelete = async (
        inspector
    ) => {
        const confirmed = window.confirm(
            `Delete ${inspector.name}'s account?\n\nThis action cannot be undone.`
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(
                `delete-${inspector.id}`
            );

            setError("");

            const response = await fetch(
                `/api/admin/inspectors/${inspector.id}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            let data = null;

            try {
                data = await response.json();
            } catch {
                throw new Error(
                    "The server returned an invalid response."
                );
            }

            if (
                !response.ok ||
                !data?.success
            ) {
                throw new Error(
                    data?.message ||
                    "Unable to delete inspector."
                );
            }

            // If current page becomes empty,
            // move to the previous page.
            const nextPage =
                inspectors.length === 1 &&
                    pagination.page > 1
                    ? pagination.page - 1
                    : pagination.page;

            await loadPage(
                nextPage,
                search
            );
        } catch (err) {
            console.error(
                "❌ [ADMIN INSPECTORS] Delete error:",
                err
            );

            setError(
                err?.message ||
                "Unable to delete inspector."
            );
        } finally {
            setActionLoading("");
        }
    };

    // ============================================================
    // PAGINATION
    // ============================================================

    const handlePageChange = (page) => {
        if (
            loading ||
            page < 1 ||
            page > pagination.totalPages ||
            page === pagination.page
        ) {
            return;
        }

        loadPage(
            page,
            search
        );
    };

    // ============================================================
    // PAGE NUMBER GENERATOR
    // ============================================================

    const getPageNumbers = () => {
        const totalPages =
            pagination.totalPages;

        const currentPage =
            pagination.page;

        if (totalPages <= 7) {
            return Array.from(
                {
                    length: totalPages,
                },
                (_, index) => index + 1
            );
        }

        if (currentPage <= 4) {
            return [
                1,
                2,
                3,
                4,
                5,
                "ellipsis-start",
                totalPages,
            ];
        }

        if (
            currentPage >=
            totalPages - 3
        ) {
            return [
                1,
                "ellipsis-end",
                totalPages - 4,
                totalPages - 3,
                totalPages - 2,
                totalPages - 1,
                totalPages,
            ];
        }

        return [
            1,
            "ellipsis-middle",
            currentPage - 1,
            currentPage,
            currentPage + 1,
            "ellipsis-end",
            totalPages,
        ];
    };

    // ============================================================
    // DISPLAY RANGE
    // ============================================================

    const showingFrom =
        pagination.total === 0
            ? 0
            : (pagination.page - 1) *
            pagination.limit +
            1;

    const showingTo = Math.min(
        pagination.page *
        pagination.limit,
        pagination.total
    );

    // ============================================================
    // INITIAL LOADING SCREEN
    // ============================================================

    if (loading && !user) {
        return (
            <main className="min-h-screen bg-slate-50">
                <div className="flex min-h-screen items-center justify-center px-5">
                    <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                            <RefreshCw
                                size={21}
                                className="animate-spin"
                            />
                        </div>

                        <h2 className="mt-5 font-[family-name:var(--font-sora)] text-base font-semibold text-slate-900">
                            Loading inspector accounts
                        </h2>

                        <p className="mt-2 text-xs leading-5 text-slate-400">
                            Please wait while we load
                            the account data.
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50">

            {/* ====================================================
                HEADER
            ===================================================== */}

            <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
                <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-4 sm:h-[78px] sm:px-6 lg:px-8">

                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">

                        <Link
                            href="/admin/dashboard"
                            aria-label="Back to admin dashboard"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-95"
                        >
                            <ArrowLeft
                                size={18}
                            />
                        </Link>

                        <div className="min-w-0">

                            <div className="flex items-center gap-2">

                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                    <ShieldCheck
                                        size={16}
                                    />
                                </div>

                                <h1 className="truncate font-[family-name:var(--font-sora)] text-sm font-semibold tracking-tight text-slate-950 sm:text-lg">
                                    Inspector Accounts
                                </h1>

                            </div>

                            <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">
                                Manage inspector access and account status
                            </p>

                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            loadPage(
                                pagination.page,
                                search
                            )
                        }
                        disabled={loading}
                        className="flex h-10 shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3.5"
                    >
                        <RefreshCw
                            size={16}
                            className={
                                loading
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        <span className="hidden sm:inline">
                            Refresh
                        </span>
                    </button>

                </div>
            </header>

            {/* ====================================================
                CONTENT
            ===================================================== */}

            <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

                {/* =================================================
                    INTRO
                ================================================== */}

                <section className="mb-7">

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

                        <div>

                            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />

                                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
                                    Account Management
                                </span>
                            </div>

                            <h2 className="mt-4 font-[family-name:var(--font-sora)] text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl lg:text-[34px]">
                                Manage inspectors
                            </h2>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                Control inspector access,
                                review account status, and
                                manage platform users from
                                one place.
                            </p>

                        </div>

                        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm lg:flex">

                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                <CheckCircle2
                                    size={15}
                                />
                            </div>

                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                                    Access control
                                </p>

                                <p className="text-xs font-semibold text-slate-700">
                                    Operational
                                </p>
                            </div>

                        </div>

                    </div>

                </section>

                {/* =================================================
                    ERROR
                ================================================== */}

                {error && (
                    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 shadow-sm">

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                            <XCircle
                                size={17}
                            />
                        </div>

                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-red-700">
                                Unable to complete request
                            </p>

                            <p className="mt-1 text-xs leading-5 text-red-600">
                                {error}
                            </p>
                        </div>

                    </div>
                )}

                {/* =================================================
                    SUMMARY
                ================================================== */}

                <section className="grid gap-4 sm:grid-cols-3">

                    <SummaryCard
                        label="Total inspectors"
                        value={summary.total}
                        description="Registered inspector accounts"
                        icon={Users}
                        iconClass="bg-blue-50 text-blue-600"
                    />

                    <SummaryCard
                        label="Active"
                        value={summary.active}
                        description="Currently allowed to sign in"
                        icon={UserCheck}
                        iconClass="bg-emerald-50 text-emerald-600"
                    />

                    <SummaryCard
                        label="Inactive"
                        value={summary.inactive}
                        description="Access currently disabled"
                        icon={UserX}
                        iconClass="bg-slate-100 text-slate-500"
                    />

                </section>

                {/* =================================================
                    INSPECTOR ACCOUNTS
                ================================================== */}

                <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

                    {/* ------------------------------------------------
                        CARD HEADER
                    ------------------------------------------------- */}

                    <div className="border-b border-slate-100 px-4 py-4 sm:px-6">

                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                            <div className="min-w-0">

                                <div className="flex items-center gap-2">

                                    <h3 className="font-[family-name:var(--font-sora)] text-base font-semibold text-slate-950">
                                        Inspector accounts
                                    </h3>

                                    {loading && (
                                        <RefreshCw
                                            size={14}
                                            className="animate-spin text-blue-500"
                                        />
                                    )}

                                </div>

                                <p className="mt-1 text-xs text-slate-400">
                                    {pagination.total ===
                                        0
                                        ? "No accounts found"
                                        : `Showing ${showingFrom}–${showingTo} of ${pagination.total} accounts`}
                                </p>

                            </div>

                            {/* Search */}

                            <div className="relative w-full lg:w-[340px]">

                                <Search
                                    size={16}
                                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(
                                            event.target
                                                .value
                                        )
                                    }
                                    placeholder="Search by name or email..."
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                />

                                {search && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSearch("")
                                        }
                                        className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-lg leading-none text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                                        aria-label="Clear search"
                                    >
                                        ×
                                    </button>
                                )}

                            </div>

                        </div>
                    </div>

                    {/* =================================================
                        DESKTOP TABLE
                    ================================================== */}

                    <div className="hidden overflow-x-auto md:block">

                        <table className="w-full min-w-[900px]">

                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/70">

                                    <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                        Inspector
                                    </th>

                                    <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                        Email
                                    </th>

                                    <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                        Status
                                    </th>

                                    <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                        Joined
                                    </th>

                                    <th className="px-6 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                        Actions
                                    </th>

                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">

                                {loading ? (
                                    Array.from({
                                        length: 6,
                                    }).map(
                                        (_, index) => (
                                            <TableSkeleton
                                                key={
                                                    index
                                                }
                                            />
                                        )
                                    )
                                ) : inspectors.length > 0 ? (
                                    inspectors.map(
                                        (
                                            inspector
                                        ) => (
                                            <InspectorTableRow
                                                key={
                                                    inspector.id
                                                }
                                                inspector={
                                                    inspector
                                                }
                                                actionLoading={
                                                    actionLoading
                                                }
                                                onToggleStatus={
                                                    handleToggleStatus
                                                }
                                                onDelete={
                                                    handleDelete
                                                }
                                            />
                                        )
                                    )
                                ) : null}

                            </tbody>
                        </table>
                    </div>

                    {/* =================================================
                        MOBILE CARDS
                    ================================================== */}

                    <div className="divide-y divide-slate-100 md:hidden">

                        {loading ? (
                            Array.from({
                                length: 4,
                            }).map(
                                (_, index) => (
                                    <MobileSkeleton
                                        key={index}
                                    />
                                )
                            )
                        ) : inspectors.length > 0 ? (
                            inspectors.map(
                                (
                                    inspector
                                ) => (
                                    <InspectorMobileCard
                                        key={
                                            inspector.id
                                        }
                                        inspector={
                                            inspector
                                        }
                                        actionLoading={
                                            actionLoading
                                        }
                                        onToggleStatus={
                                            handleToggleStatus
                                        }
                                        onDelete={
                                            handleDelete
                                        }
                                    />
                                )
                            )
                        ) : null}

                    </div>

                    {/* =================================================
                        EMPTY STATE
                    ================================================== */}

                    {!loading &&
                        inspectors.length ===
                        0 && (
                            <div className="px-5 py-16 text-center sm:py-20">

                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400">
                                    {search ? (
                                        <Search
                                            size={21}
                                        />
                                    ) : (
                                        <UserRound
                                            size={21}
                                        />
                                    )}
                                </div>

                                <h4 className="mt-4 font-[family-name:var(--font-sora)] text-sm font-semibold text-slate-800">
                                    {search
                                        ? "No matching inspectors"
                                        : "No inspectors found"}
                                </h4>

                                <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
                                    {search
                                        ? "Try searching with a different name or email address."
                                        : "No inspector accounts are available yet."}
                                </p>

                                {search && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSearch("")
                                        }
                                        className="mt-5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
                                    >
                                        Clear search
                                    </button>
                                )}

                            </div>
                        )}

                    {/* =================================================
                        PAGINATION
                    ================================================== */}

                    {!loading &&
                        pagination.totalPages >
                        1 && (
                            <div className="border-t border-slate-100 px-4 py-4 sm:px-6">

                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                    {/* Range */}

                                    <p className="text-xs text-slate-500">
                                        Showing{" "}
                                        <span className="font-semibold text-slate-700">
                                            {showingFrom}
                                        </span>{" "}
                                        to{" "}
                                        <span className="font-semibold text-slate-700">
                                            {showingTo}
                                        </span>{" "}
                                        of{" "}
                                        <span className="font-semibold text-slate-700">
                                            {
                                                pagination.total
                                            }
                                        </span>
                                    </p>

                                    {/* Controls */}

                                    <div className="flex items-center justify-between gap-2 sm:justify-end">

                                        {/* Previous */}

                                        <button
                                            type="button"
                                            disabled={
                                                !pagination.hasPreviousPage ||
                                                loading
                                            }
                                            onClick={() =>
                                                handlePageChange(
                                                    pagination.page -
                                                    1
                                                )
                                            }
                                            className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            <ChevronLeft
                                                size={14}
                                            />

                                            <span className="hidden sm:inline">
                                                Previous
                                            </span>
                                        </button>

                                        {/* Page numbers */}

                                        <div className="flex items-center gap-1">

                                            {getPageNumbers().map(
                                                (
                                                    page,
                                                    index
                                                ) => {
                                                    if (
                                                        typeof page !==
                                                        "number"
                                                    ) {
                                                        return (
                                                            <span
                                                                key={`${page}-${index}`}
                                                                className="flex h-9 w-7 items-center justify-center text-slate-400"
                                                            >
                                                                <MoreHorizontal
                                                                    size={
                                                                        15
                                                                    }
                                                                />
                                                            </span>
                                                        );
                                                    }

                                                    const isActive =
                                                        page ===
                                                        pagination.page;

                                                    return (
                                                        <button
                                                            key={
                                                                page
                                                            }
                                                            type="button"
                                                            onClick={() =>
                                                                handlePageChange(
                                                                    page
                                                                )
                                                            }
                                                            disabled={
                                                                loading
                                                            }
                                                            className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-semibold transition-all ${isActive
                                                                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                                                                : "border border-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                                                                }`}
                                                        >
                                                            {page}
                                                        </button>
                                                    );
                                                }
                                            )}

                                        </div>

                                        {/* Next */}

                                        <button
                                            type="button"
                                            disabled={
                                                !pagination.hasNextPage ||
                                                loading
                                            }
                                            onClick={() =>
                                                handlePageChange(
                                                    pagination.page +
                                                    1
                                                )
                                            }
                                            className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            <span className="hidden sm:inline">
                                                Next
                                            </span>

                                            <ChevronRight
                                                size={14}
                                            />
                                        </button>

                                    </div>
                                </div>

                            </div>
                        )}

                </section>

                {/* =================================================
                    FOOTER
                ================================================== */}

                <footer className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-2">

                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                            <CheckCircle2
                                size={12}
                            />
                        </span>

                        <span>
                            Admin account management operational
                        </span>

                    </div>

                    <span>
                        Smart Inspection
                    </span>

                </footer>

            </div>
        </main>
    );
}

/* ================================================================
   SUMMARY CARD
================================================================ */

function SummaryCard({
    label,
    value,
    description,
    icon: Icon,
    iconClass,
}) {
    return (
        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_6px_24px_rgba(15,23,42,0.035)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_10px_30px_rgba(15,23,42,0.06)]">

            <div className="flex items-start justify-between gap-4">

                <div className="min-w-0">

                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                        {label}
                    </p>

                    <p className="mt-2 font-[family-name:var(--font-sora)] text-2xl font-semibold tracking-tight text-slate-950">
                        {value}
                    </p>

                    <p className="mt-1.5 text-xs leading-5 text-slate-400">
                        {description}
                    </p>

                </div>

                <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
                >
                    <Icon size={19} />
                </div>

            </div>
        </div>
    );
}

/* ================================================================
   DESKTOP TABLE ROW
================================================================ */

function InspectorTableRow({
    inspector,
    actionLoading,
    onToggleStatus,
    onDelete,
}) {
    const active =
        inspector.isActive !== false;

    const statusLoading =
        actionLoading ===
        `status-${inspector.id}`;

    const deleteLoading =
        actionLoading ===
        `delete-${inspector.id}`;

    return (
        <tr className="group transition-colors duration-150 hover:bg-slate-50/70">

            {/* Inspector */}

            <td className="px-6 py-4">

                <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
                        <UserRound size={17} />
                    </div>

                    <div className="min-w-0">

                        <p className="truncate text-sm font-semibold text-slate-800">
                            {inspector.name}
                        </p>

                        <p className="mt-0.5 text-[11px] text-slate-400">
                            Inspector
                        </p>

                    </div>
                </div>

            </td>

            {/* Email */}

            <td className="px-6 py-4">

                <p className="max-w-[280px] truncate text-sm text-slate-600">
                    {inspector.email}
                </p>

            </td>

            {/* Status */}

            <td className="px-6 py-4">

                {active ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-[11px] font-semibold text-slate-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                        Inactive
                    </span>
                )}

            </td>

            {/* Joined */}

            <td className="px-6 py-4">

                <p className="text-sm text-slate-500">
                    {inspector.createdAt
                        ? new Date(
                            inspector.createdAt
                        ).toLocaleDateString(
                            "en-IN",
                            {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                            }
                        )
                        : "—"}
                </p>

            </td>

            {/* Actions */}

            <td className="px-6 py-4">

                <div className="flex items-center justify-end gap-2">

                    <button
                        type="button"
                        onClick={() =>
                            onToggleStatus(
                                inspector
                            )
                        }
                        disabled={
                            statusLoading ||
                            deleteLoading
                        }
                        className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${active
                            ? "border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300 hover:bg-amber-100"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100"
                            }`}
                    >
                        {statusLoading ? (
                            <RefreshCw
                                size={14}
                                className="animate-spin"
                            />
                        ) : active ? (
                            <UserX size={14} />
                        ) : (
                            <UserCheck size={14} />
                        )}

                        {active
                            ? "Deactivate"
                            : "Activate"}
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            onDelete(inspector)
                        }
                        disabled={
                            statusLoading ||
                            deleteLoading
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition-all hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={`Delete ${inspector.name}`}
                    >
                        {deleteLoading ? (
                            <RefreshCw
                                size={14}
                                className="animate-spin"
                            />
                        ) : (
                            <Trash2 size={14} />
                        )}
                    </button>

                </div>

            </td>

        </tr>
    );
}

/* ================================================================
   MOBILE CARD
================================================================ */

function InspectorMobileCard({
    inspector,
    actionLoading,
    onToggleStatus,
    onDelete,
}) {
    const active =
        inspector.isActive !== false;

    const statusLoading =
        actionLoading ===
        `status-${inspector.id}`;

    const deleteLoading =
        actionLoading ===
        `delete-${inspector.id}`;

    return (
        <div className="p-5">

            <div className="flex items-start gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
                    <UserRound size={18} />
                </div>

                <div className="min-w-0 flex-1">

                    <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                            <p className="truncate text-sm font-semibold text-slate-800">
                                {inspector.name}
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-400">
                                {inspector.email}
                            </p>

                        </div>

                        {active ? (
                            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Active
                            </span>
                        ) : (
                            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                Inactive
                            </span>
                        )}

                    </div>

                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">

                        <span>Joined</span>

                        <span className="text-slate-300">
                            •
                        </span>

                        <span>
                            {inspector.createdAt
                                ? new Date(
                                    inspector.createdAt
                                ).toLocaleDateString(
                                    "en-IN",
                                    {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    }
                                )
                                : "—"}
                        </span>

                    </div>

                </div>

            </div>

            <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">

                <button
                    type="button"
                    onClick={() =>
                        onToggleStatus(
                            inspector
                        )
                    }
                    disabled={
                        statusLoading ||
                        deleteLoading
                    }
                    className={`flex h-10 items-center justify-center gap-2 rounded-xl border text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${active
                        ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                >
                    {statusLoading ? (
                        <RefreshCw
                            size={14}
                            className="animate-spin"
                        />
                    ) : active ? (
                        <UserX size={14} />
                    ) : (
                        <UserCheck size={14} />
                    )}

                    {active
                        ? "Deactivate inspector"
                        : "Activate inspector"}
                </button>

                <button
                    type="button"
                    onClick={() =>
                        onDelete(inspector)
                    }
                    disabled={
                        statusLoading ||
                        deleteLoading
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 transition-all hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={`Delete ${inspector.name}`}
                >
                    {deleteLoading ? (
                        <RefreshCw
                            size={14}
                            className="animate-spin"
                        />
                    ) : (
                        <Trash2 size={15} />
                    )}
                </button>

            </div>

        </div>
    );
}

/* ================================================================
   DESKTOP TABLE SKELETON
================================================================ */

function TableSkeleton() {
    return (
        <tr>
            <td className="px-6 py-5">
                <div className="flex items-center gap-3">

                    <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />

                    <div className="space-y-2">
                        <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
                        <div className="h-2.5 w-16 animate-pulse rounded bg-slate-100" />
                    </div>

                </div>
            </td>

            <td className="px-6 py-5">
                <div className="h-3 w-48 animate-pulse rounded bg-slate-100" />
            </td>

            <td className="px-6 py-5">
                <div className="h-6 w-16 animate-pulse rounded-full bg-slate-100" />
            </td>

            <td className="px-6 py-5">
                <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
            </td>

            <td className="px-6 py-5">
                <div className="ml-auto flex justify-end gap-2">

                    <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-100" />

                    <div className="h-9 w-9 animate-pulse rounded-lg bg-slate-100" />

                </div>
            </td>
        </tr>
    );
}

/* ================================================================
   MOBILE SKELETON
================================================================ */

function MobileSkeleton() {
    return (
        <div className="p-5">

            <div className="flex items-start gap-3">

                <div className="h-11 w-11 animate-pulse rounded-xl bg-slate-100" />

                <div className="flex-1 space-y-2">

                    <div className="h-3.5 w-36 animate-pulse rounded bg-slate-100" />

                    <div className="h-3 w-48 animate-pulse rounded bg-slate-100" />

                    <div className="h-2.5 w-24 animate-pulse rounded bg-slate-100" />

                </div>

            </div>

            <div className="mt-4 flex gap-2">

                <div className="h-10 flex-1 animate-pulse rounded-xl bg-slate-100" />

                <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />

            </div>

        </div>
    );
}