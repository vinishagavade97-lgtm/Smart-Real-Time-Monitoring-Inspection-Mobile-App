"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Plus,
    ClipboardCheck,
} from "lucide-react";

import DashboardSidebar from "../components/layout/DashboardSidebar";
import DashboardHeader from "../components/layout/DashboardHeader";
import MobileSidebar from "../components/layout/MobileSidebar";

import InspectionFilters from "../components/inspections/InspectionFilters";
import InspectionList from "../components/inspections/InspectionList";
import Pagination from "../components/ui/Pagination";

export default function InspectionsPage() {
    const router = useRouter();

    // =========================================================
    // USER
    // =========================================================

    const [user, setUser] = useState(null);

    const [loadingUser, setLoadingUser] =
        useState(true);

    // =========================================================
    // INSPECTIONS
    // =========================================================

    const [inspections, setInspections] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    // =========================================================
    // PAGINATION
    // =========================================================

    const [pagination, setPagination] =
        useState({
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 1,
        });

    // =========================================================
    // FILTERS
    // =========================================================

    const [search, setSearch] =
        useState("");

    const [status, setStatus] =
        useState("all");

    const [result, setResult] =
        useState("all");

    // =========================================================
    // MOBILE SIDEBAR
    // =========================================================

    const [mobileSidebarOpen, setMobileSidebarOpen] =
        useState(false);

    // =========================================================
    // LOAD INSPECTIONS
    // =========================================================

    const loadInspections = useCallback(
        async (page = 1) => {
            try {
                setLoading(true);
                setError("");

                const params =
                    new URLSearchParams();

                params.set(
                    "page",
                    String(page)
                );

                params.set(
                    "limit",
                    "10"
                );

                if (search.trim()) {
                    params.set(
                        "search",
                        search.trim()
                    );
                }

                if (status !== "all") {
                    params.set(
                        "status",
                        status
                    );
                }

                if (result !== "all") {
                    params.set(
                        "result",
                        result
                    );
                }

                const response =
                    await fetch(
                        `/api/inspections?${params.toString()}`,
                        {
                            method: "GET",
                            credentials:
                                "include",
                            cache: "no-store",
                        }
                    );

                const data =
                    await response.json();

                if (
                    !response.ok ||
                    !data.success
                ) {
                    throw new Error(
                        data.message ||
                        "Failed to load inspections"
                    );
                }

                /*
                 * Supports the existing API
                 * response shape.
                 */
                const inspectionData =
                    Array.isArray(
                        data.inspections
                    )
                        ? data.inspections
                        : Array.isArray(
                            data.data
                        )
                            ? data.data
                            : [];

                setInspections(
                    inspectionData
                );

                if (data.pagination) {
                    setPagination(
                        data.pagination
                    );
                }
            } catch (requestError) {
                console.error(
                    "❌ Inspections loading error:",
                    requestError
                );

                setError(
                    requestError.message ||
                    "Unable to load inspections"
                );

                setInspections([]);
            } finally {
                setLoading(false);
            }
        },
        [search, status, result]
    );

    // =========================================================
    // AUTHENTICATION
    // =========================================================

    useEffect(() => {
        async function loadUser() {
            try {
                const response =
                    await fetch(
                        "/api/auth/me",
                        {
                            method: "GET",
                            credentials:
                                "include",
                            cache: "no-store",
                        }
                    );

                const data =
                    await response.json();

                if (
                    !response.ok ||
                    !data.success
                ) {
                    router.replace(
                        "/login"
                    );

                    return;
                }

                setUser(data.user);
            } catch (requestError) {
                console.error(
                    "❌ Auth check failed:",
                    requestError
                );

                router.replace("/login");
            } finally {
                setLoadingUser(false);
            }
        }

        loadUser();
    }, [router]);

    // =========================================================
    // LOAD DATA WHEN FILTERS CHANGE
    // =========================================================

    useEffect(() => {
        if (loadingUser) {
            return;
        }

        const timer = setTimeout(() => {
            loadInspections(1);
        }, 250);

        return () =>
            clearTimeout(timer);
    }, [
        loadingUser,
        loadInspections,
    ]);

    // =========================================================
    // LOGOUT
    // =========================================================

    async function handleLogout() {
        try {
            await fetch(
                "/api/auth/logout",
                {
                    method: "POST",
                    credentials:
                        "include",
                }
            );
        } catch (logoutError) {
            console.error(
                "❌ Logout error:",
                logoutError
            );
        } finally {
            router.replace("/login");
        }
    }

    // =========================================================
    // CLEAR FILTERS
    // =========================================================

    function clearFilters() {
        setSearch("");
        setStatus("all");
        setResult("all");
    }

    // =========================================================
    // INITIAL LOADING
    // =========================================================

    if (loadingUser) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

                    <span>
                        Loading inspections...
                    </span>
                </div>
            </div>
        );
    }

    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* =================================================
                DESKTOP SIDEBAR
            ================================================== */}

            <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">
                <DashboardSidebar
                    user={user}
                />
            </div>

            {/* =================================================
                MOBILE SIDEBAR
            ================================================== */}

            <MobileSidebar
                open={mobileSidebarOpen}
                onClose={() =>
                    setMobileSidebarOpen(
                        false
                    )
                }
                user={user}
            />

            {/* =================================================
                MAIN
            ================================================== */}

            <div className="lg:pl-[272px]">
                <DashboardHeader
                    user={user}
                    onMenuClick={() =>
                        setMobileSidebarOpen(
                            true
                        )
                    }
                    onLogout={handleLogout}
                />

                <main className="px-4 py-7 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-[1440px]">
                        {/* =================================================
                            PAGE HEADER
                        ================================================== */}

                        <section className="mb-7">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    {/* Eyebrow */}
                                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5">
                                        <ClipboardCheck
                                            size={12}
                                            strokeWidth={
                                                2
                                            }
                                            className="text-blue-600"
                                        />

                                        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-700">
                                            Inspection
                                            workspace
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h2 className="font-[Sora] text-2xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-3xl">
                                        Inspections
                                    </h2>

                                    {/* Description */}
                                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                        Review, search,
                                        and manage
                                        your
                                        inspection
                                        records.
                                    </p>
                                </div>

                                {/* New inspection */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        router.push(
                                            "/inspections/create"
                                        )
                                    }
                                    className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 transition-all duration-200 hover:bg-blue-700 active:scale-[0.98]"
                                >
                                    <Plus
                                        size={16}
                                        strokeWidth={
                                            2
                                        }
                                    />

                                    New inspection
                                </button>
                            </div>
                        </section>

                        {/* =================================================
                            INSPECTION LIST
                        ================================================== */}

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
                            {/* Filters */}
                            <InspectionFilters
                                search={search}
                                onSearchChange={
                                    setSearch
                                }
                                status={status}
                                onStatusChange={
                                    setStatus
                                }
                                result={result}
                                onResultChange={
                                    setResult
                                }
                                onClear={
                                    clearFilters
                                }
                            />

                            {/* Inspection list */}
                            <InspectionList
                                inspections={
                                    inspections
                                }
                                loading={
                                    loading
                                }
                                error={error}
                                onRetry={() =>
                                    loadInspections(
                                        pagination.page
                                    )
                                }
                            />

                            {/* =================================================
                                PAGINATION
                            ================================================== */}

                            {!loading &&
                                !error &&
                                inspections.length >
                                0 && (
                                    <div className="flex min-h-[56px] items-center justify-between border-t border-slate-100 px-5 py-3 sm:px-6">
                                        {/* Count */}
                                        <p className="text-[10px] font-medium text-slate-400">
                                            {pagination.total >
                                                0
                                                ? `${pagination.total} inspection${pagination.total ===
                                                    1
                                                    ? ""
                                                    : "s"
                                                }`
                                                : "No inspections"}
                                        </p>

                                        {/* Compact pagination */}
                                        <Pagination
                                            page={
                                                pagination.page
                                            }
                                            totalPages={
                                                pagination.totalPages
                                            }
                                            onPageChange={(
                                                nextPage
                                            ) =>
                                                loadInspections(
                                                    nextPage
                                                )
                                            }
                                        />
                                    </div>
                                )}
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
}