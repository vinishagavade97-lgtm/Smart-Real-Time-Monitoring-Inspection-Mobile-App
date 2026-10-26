"use client";

import {
    useCallback,
    useEffect,
    useState,
} from "react";

import { useRouter } from "next/navigation";

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import DashboardSidebar from "../components/layout/DashboardSidebar";
import DashboardHeader from "../components/layout/DashboardHeader";
import MobileSidebar from "../components/layout/MobileSidebar";
import DashboardWelcome from "../components/dashboard/DashboardWelcome";
import StatsGrid from "../components/dashboard/StatsGrid";
import RecentInspections from "../components/dashboard/RecentInspections";

export default function DashboardPage() {
    const router = useRouter();

    // =========================================================
    // USER
    // =========================================================

    const [user, setUser] = useState(null);

    const [loadingUser, setLoadingUser] =
        useState(true);

    // =========================================================
    // STATS
    // =========================================================

    const [stats, setStats] = useState(null);

    const [loadingStats, setLoadingStats] =
        useState(true);

    const [statsError, setStatsError] =
        useState("");

    // =========================================================
    // RECENT INSPECTIONS
    // =========================================================

    const [recentInspections, setRecentInspections] =
        useState([]);

    const [loadingRecent, setLoadingRecent] =
        useState(true);

    const [recentError, setRecentError] =
        useState("");

    // =========================================================
    // RECENT INSPECTIONS PAGINATION
    // =========================================================

    const [recentPagination, setRecentPagination] =
        useState({
            page: 1,
            limit: 5,
            total: 0,
            totalPages: 1,
        });

    // =========================================================
    // MOBILE SIDEBAR
    // =========================================================

    const [mobileSidebarOpen, setMobileSidebarOpen] =
        useState(false);

    // =========================================================
    // EXPORT
    // =========================================================

    const [exporting, setExporting] =
        useState(false);

    const [exportError, setExportError] =
        useState("");

    // =========================================================
    // LOAD RECENT INSPECTIONS
    // =========================================================

    const loadRecentInspections = useCallback(
        async (page = 1) => {
            try {
                setLoadingRecent(true);
                setRecentError("");

                const response = await fetch(
                    `/api/inspections/recent?page=${page}&limit=5`,
                    {
                        method: "GET",
                        credentials: "include",
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
                        "Failed to load recent inspections"
                    );
                }

                setRecentInspections(
                    Array.isArray(data.data)
                        ? data.data
                        : []
                );

                setRecentPagination(
                    data.pagination || {
                        page,
                        limit: 5,
                        total: 0,
                        totalPages: 1,
                    }
                );
            } catch (error) {
                console.error(
                    "❌ Recent inspections error:",
                    error
                );

                setRecentError(
                    error.message ||
                    "Unable to load recent inspections"
                );
            } finally {
                setLoadingRecent(false);
            }
        },
        []
    );

    // =========================================================
    // LOAD DASHBOARD
    // =========================================================

    useEffect(() => {
        let mounted = true;

        async function loadDashboard() {
            try {
                setLoadingUser(true);
                setLoadingStats(true);
                setStatsError("");

                // =============================================
                // 1. AUTHENTICATED USER
                // =============================================

                const userResponse =
                    await fetch(
                        "/api/auth/me",
                        {
                            method: "GET",
                            credentials:
                                "include",
                            cache: "no-store",
                        }
                    );

                const userData =
                    await userResponse.json();

                if (
                    !userResponse.ok ||
                    !userData.success
                ) {
                    router.replace("/login");
                    return;
                }

                if (!mounted) {
                    return;
                }

                setUser(userData.user);
                setLoadingUser(false);

                // =============================================
                // 2. INSPECTION STATISTICS
                // =============================================

                const statsResponse =
                    await fetch(
                        "/api/inspections/stats",
                        {
                            method: "GET",
                            credentials:
                                "include",
                            cache: "no-store",
                        }
                    );

                const statsData =
                    await statsResponse.json();

                if (
                    !statsResponse.ok ||
                    !statsData.success
                ) {
                    throw new Error(
                        statsData.message ||
                        "Failed to load statistics"
                    );
                }

                if (!mounted) {
                    return;
                }

                setStats(
                    statsData.data || {
                        total: 0,
                        completed: 0,
                        pending: 0,
                        passed: 0,
                        warning: 0,
                        failed: 0,
                    }
                );

                setLoadingStats(false);

                // =============================================
                // 3. RECENT INSPECTIONS
                // =============================================

                await loadRecentInspections(1);
            } catch (error) {
                console.error(
                    "❌ Dashboard loading error:",
                    error
                );

                if (!mounted) {
                    return;
                }

                setStatsError(
                    error.message ||
                    "Unable to load dashboard data"
                );

                setLoadingStats(false);
            } finally {
                if (mounted) {
                    setLoadingUser(false);
                }
            }
        }

        loadDashboard();

        return () => {
            mounted = false;
        };
    }, [
        router,
        loadRecentInspections,
    ]);

    // =========================================================
    // EXPORT INSPECTIONS
    // =========================================================

    async function handleExport() {
        try {
            setExporting(true);
            setExportError("");

            const response = await fetch(
                "/api/inspections/export",
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            if (!response.ok) {
                const errorData =
                    await response
                        .json()
                        .catch(() => null);

                throw new Error(
                    errorData?.message ||
                    "Failed to export inspections"
                );
            }

            const blob =
                await response.blob();

            const url =
                window.URL.createObjectURL(
                    blob
                );

            const link =
                document.createElement("a");

            link.href = url;

            link.download = `my-inspections-${new Date()
                .toISOString()
                .slice(0, 10)}.xlsx`;

            document.body.appendChild(link);
            link.click();

            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(
                "❌ Export error:",
                error
            );

            setExportError(
                error.message ||
                "Unable to export inspections"
            );
        } finally {
            setExporting(false);
        }
    }

    // =========================================================
    // LOGOUT
    // =========================================================

    async function handleLogout() {
        try {
            await fetch(
                "/api/auth/logout",
                {
                    method: "POST",
                    credentials: "include",
                }
            );
        } catch (error) {
            console.error(
                "❌ Logout error:",
                error
            );
        } finally {
            router.replace("/login");
        }
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
                        Loading dashboard...
                    </span>
                </div>
            </div>
        );
    }

    // =========================================================
    // SAFE STATS
    // =========================================================

    const total =
        Number(stats?.total) || 0;

    const completed =
        Number(stats?.completed) || 0;

    const pending =
        Number(stats?.pending) || 0;

    const passed =
        Number(stats?.passed) || 0;

    const warning =
        Number(stats?.warning) || 0;

    const failed =
        Number(stats?.failed) || 0;

    // =========================================================
    // CHART DATA
    // =========================================================

    const outcomeData = [
        {
            name: "Passed",
            value: passed,
            color: "#16A34A",
        },
        {
            name: "Warning",
            value: warning,
            color: "#F59E0B",
        },
        {
            name: "Failed",
            value: failed,
            color: "#DC2626",
        },
    ];

    const statusData = [
        {
            name: "Completed",
            value: completed,
            color: "#2563EB",
        },
        {
            name: "Pending",
            value: pending,
            color: "#F59E0B",
        },
        {
            name: "Attention",
            value: failed,
            color: "#DC2626",
        },
    ];

    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="min-h-screen bg-[#F8FAFC]">

            {/* =================================================
                DESKTOP SIDEBAR
            ================================================== */}

            <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">
                <DashboardSidebar user={user} />
            </div>

            {/* =================================================
                MOBILE SIDEBAR
            ================================================== */}

            <MobileSidebar
                open={mobileSidebarOpen}
                onClose={() =>
                    setMobileSidebarOpen(false)
                }
                user={user}
            />

            {/* =================================================
                MAIN APPLICATION AREA
            ================================================== */}

            <div className="lg:pl-[272px]">

                {/* =================================================
                    HEADER
                ================================================== */}

                <DashboardHeader
                    user={user}
                    onMenuClick={() =>
                        setMobileSidebarOpen(true)
                    }
                    onLogout={handleLogout}
                />

                {/* =================================================
                    PAGE CONTENT
                ================================================== */}

                <main className="px-4 py-7 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-[1440px]">

                        {/* =========================================
                            WELCOME
                        ========================================== */}

                        <DashboardWelcome
                            total={total}
                        />

                        {/* =========================================
                            STATS
                        ========================================== */}

                        <StatsGrid
                            stats={stats}
                            loading={loadingStats}
                        />

                        {/* =========================================
                            STATS ERROR
                        ========================================== */}

                        {statsError && (
                            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
                                <p className="text-sm font-semibold text-red-700">
                                    Unable to load inspection
                                    statistics
                                </p>

                                <p className="mt-1 text-xs leading-5 text-red-600">
                                    {statsError}
                                </p>
                            </div>
                        )}

                        {/* =========================================
                            EXPORT ERROR
                        ========================================== */}

                        {exportError && (
                            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-red-700">
                                            Export failed
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-red-600">
                                            {exportError}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() =>
                                            setExportError("")
                                        }
                                        className="text-xs font-medium text-red-500 hover:text-red-700"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* =================================================
                            MONITORING OVERVIEW
                        ================================================== */}

                        <section className="mb-6">

                            {/* Section heading */}

                            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <h2 className="font-[Sora] text-base font-semibold tracking-[-0.025em] text-slate-900">
                                        Monitoring overview
                                    </h2>

                                    <p className="mt-1 text-xs text-slate-400">
                                        A live view of your current inspection activity and results.
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500" />

                                        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                            Live data
                                        </span>
                                    </div>

                                    <button
                                        onClick={handleExport}
                                        disabled={exporting}
                                        className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 shadow-sm transition-all hover:bg-emerald-100 hover:shadow-md active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {exporting ? (
                                            <>
                                                <svg
                                                    className="h-4 w-4 animate-spin"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    />
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                                    />
                                                </svg>
                                                Exporting…
                                            </>
                                        ) : (
                                            <>
                                                <svg
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M12 10v6m0 0l-3-3m3 3l3-3M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                    />
                                                </svg>
                                                Export Excel
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* =================================================
                                CHART GRID
                            ================================================== */}

                            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_0.85fr]">

                                {/* =============================================
                                    INSPECTION OUTCOMES
                                ============================================== */}

                                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">

                                    {/* Header */}

                                    <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                                        <div className="flex items-start justify-between gap-4">

                                            <div>
                                                <h3 className="font-[Sora] text-sm font-semibold text-slate-900">
                                                    Inspection outcomes
                                                </h3>

                                                <p className="mt-1 text-[11px] text-slate-400">
                                                    Breakdown of completed inspection results.
                                                </p>
                                            </div>

                                            <div className="rounded-xl bg-blue-50 px-3 py-2 text-right">
                                                <p className="text-[9px] font-semibold uppercase tracking-wide text-blue-500">
                                                    Completed
                                                </p>

                                                <p className="mt-0.5 text-base font-bold text-blue-700">
                                                    {loadingStats
                                                        ? "—"
                                                        : completed}
                                                </p>
                                            </div>

                                        </div>
                                    </div>

                                    {/* Content */}

                                    <div className="grid grid-cols-1 items-center px-5 py-6 sm:grid-cols-[1fr_0.9fr] sm:px-6">

                                        {/* Donut chart */}

                                        <div className="relative h-[250px] w-full">

                                            {loadingStats ? (
                                                <div className="flex h-full items-center justify-center">
                                                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
                                                </div>
                                            ) : total === 0 ? (
                                                <div className="flex h-full flex-col items-center justify-center">
                                                    <div className="flex h-32 w-32 items-center justify-center rounded-full border-[18px] border-slate-100">
                                                        <span className="text-2xl font-bold text-slate-300">
                                                            0
                                                        </span>
                                                    </div>

                                                    <p className="mt-4 text-xs font-medium text-slate-400">
                                                        No inspection results yet
                                                    </p>
                                                </div>
                                            ) : (
                                                <>
                                                    <ResponsiveContainer
                                                        width="100%"
                                                        height="100%"
                                                    >
                                                        <PieChart>

                                                            <Pie
                                                                data={outcomeData}
                                                                cx="50%"
                                                                cy="50%"
                                                                innerRadius={68}
                                                                outerRadius={94}
                                                                paddingAngle={4}
                                                                dataKey="value"
                                                                stroke="none"
                                                            >
                                                                {outcomeData.map(
                                                                    (
                                                                        entry
                                                                    ) => (
                                                                        <Cell
                                                                            key={
                                                                                entry.name
                                                                            }
                                                                            fill={
                                                                                entry.color
                                                                            }
                                                                        />
                                                                    )
                                                                )}
                                                            </Pie>

                                                            <Tooltip
                                                                contentStyle={{
                                                                    border:
                                                                        "1px solid #E2E8F0",
                                                                    borderRadius:
                                                                        "12px",
                                                                    background:
                                                                        "#FFFFFF",
                                                                    boxShadow:
                                                                        "0 10px 30px rgba(15, 23, 42, 0.10)",
                                                                    fontSize:
                                                                        "12px",
                                                                }}
                                                                formatter={(
                                                                    value
                                                                ) => [
                                                                        value,
                                                                        "Inspections",
                                                                    ]}
                                                            />

                                                        </PieChart>
                                                    </ResponsiveContainer>

                                                    {/* Center */}

                                                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                                        <p className="text-2xl font-bold tracking-tight text-slate-900">
                                                            {completed}
                                                        </p>

                                                        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                                            Completed
                                                        </p>
                                                    </div>
                                                </>
                                            )}

                                        </div>

                                        {/* Result summary */}

                                        <div className="space-y-3">

                                            {/* Passed */}

                                            <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3">

                                                <div className="flex items-center gap-3">

                                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
                                                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                                                    </div>

                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-700">
                                                            Passed
                                                        </p>

                                                        <p className="mt-0.5 text-[10px] text-slate-400">
                                                            All checks passed
                                                        </p>
                                                    </div>

                                                </div>

                                                <p className="text-lg font-bold text-emerald-600">
                                                    {loadingStats
                                                        ? "—"
                                                        : passed}
                                                </p>

                                            </div>

                                            {/* Warning */}

                                            <div className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50/70 px-4 py-3">

                                                <div className="flex items-center gap-3">

                                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100">
                                                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                                                    </div>

                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-700">
                                                            Warning
                                                        </p>

                                                        <p className="mt-0.5 text-[10px] text-slate-400">
                                                            Requires attention
                                                        </p>
                                                    </div>

                                                </div>

                                                <p className="text-lg font-bold text-amber-600">
                                                    {loadingStats
                                                        ? "—"
                                                        : warning}
                                                </p>

                                            </div>

                                            {/* Failed */}

                                            <div className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50/70 px-4 py-3">

                                                <div className="flex items-center gap-3">

                                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100">
                                                        <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
                                                    </div>

                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-700">
                                                            Failed
                                                        </p>

                                                        <p className="mt-0.5 text-[10px] text-slate-400">
                                                            Immediate attention
                                                        </p>
                                                    </div>

                                                </div>

                                                <p className="text-lg font-bold text-red-600">
                                                    {loadingStats
                                                        ? "—"
                                                        : failed}
                                                </p>

                                            </div>

                                        </div>
                                    </div>

                                    {/* Footer */}

                                    <div className="grid grid-cols-3 border-t border-slate-100">

                                        <div className="px-4 py-3 text-center sm:px-6">
                                            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                                                Total
                                            </p>

                                            <p className="mt-1 text-sm font-bold text-slate-900">
                                                {loadingStats
                                                    ? "—"
                                                    : total}
                                            </p>
                                        </div>

                                        <div className="border-x border-slate-100 px-4 py-3 text-center sm:px-6">
                                            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                                                Passed
                                            </p>

                                            <p className="mt-1 text-sm font-bold text-emerald-600">
                                                {loadingStats
                                                    ? "—"
                                                    : passed}
                                            </p>
                                        </div>

                                        <div className="px-4 py-3 text-center sm:px-6">
                                            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                                                Failed
                                            </p>

                                            <p className="mt-1 text-sm font-bold text-red-600">
                                                {loadingStats
                                                    ? "—"
                                                    : failed}
                                            </p>
                                        </div>

                                    </div>

                                </div>

                                {/* =============================================
                                    INSPECTION STATUS
                                ============================================== */}

                                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">

                                    {/* Header */}

                                    <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

                                        <div className="flex items-start justify-between gap-4">

                                            <div>
                                                <h3 className="font-[Sora] text-sm font-semibold text-slate-900">
                                                    Inspection status
                                                </h3>

                                                <p className="mt-1 text-[11px] text-slate-400">
                                                    Current workload across your inspections.
                                                </p>
                                            </div>

                                            <div className="rounded-xl bg-slate-50 px-3 py-2 text-right">
                                                <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                                                    Total
                                                </p>

                                                <p className="mt-0.5 text-base font-bold text-slate-800">
                                                    {loadingStats
                                                        ? "—"
                                                        : total}
                                                </p>
                                            </div>

                                        </div>

                                    </div>

                                    {/* Bar chart */}

                                    <div className="px-5 py-6 sm:px-6">

                                        {loadingStats ? (
                                            <div className="flex h-[250px] items-center justify-center">
                                                <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
                                            </div>
                                        ) : (
                                            <div className="h-[250px] w-full">

                                                <ResponsiveContainer
                                                    width="100%"
                                                    height="100%"
                                                >
                                                    <BarChart
                                                        data={statusData}
                                                        layout="vertical"
                                                        margin={{
                                                            top: 10,
                                                            right: 20,
                                                            left: 5,
                                                            bottom: 10,
                                                        }}
                                                        barCategoryGap="28%"
                                                    >

                                                        <CartesianGrid
                                                            horizontal={false}
                                                            stroke="#E2E8F0"
                                                            strokeDasharray="3 3"
                                                        />

                                                        <XAxis
                                                            type="number"
                                                            allowDecimals={
                                                                false
                                                            }
                                                            axisLine={false}
                                                            tickLine={false}
                                                            tick={{
                                                                fill: "#94A3B8",
                                                                fontSize: 10,
                                                            }}
                                                        />

                                                        <YAxis
                                                            type="category"
                                                            dataKey="name"
                                                            axisLine={false}
                                                            tickLine={false}
                                                            tick={{
                                                                fill: "#475569",
                                                                fontSize: 11,
                                                                fontWeight: 600,
                                                            }}
                                                            width={78}
                                                        />

                                                        <Tooltip
                                                            cursor={{
                                                                fill: "#F8FAFC",
                                                            }}
                                                            contentStyle={{
                                                                border:
                                                                    "1px solid #E2E8F0",
                                                                borderRadius:
                                                                    "12px",
                                                                background:
                                                                    "#FFFFFF",
                                                                boxShadow:
                                                                    "0 10px 30px rgba(15, 23, 42, 0.10)",
                                                                fontSize:
                                                                    "12px",
                                                            }}
                                                            formatter={(
                                                                value
                                                            ) => [
                                                                    value,
                                                                    "Inspections",
                                                                ]}
                                                        />

                                                        <Bar
                                                            dataKey="value"
                                                            radius={[
                                                                0,
                                                                7,
                                                                7,
                                                                0,
                                                            ]}
                                                            maxBarSize={
                                                                32
                                                            }
                                                        >
                                                            {statusData.map(
                                                                (
                                                                    entry
                                                                ) => (
                                                                    <Cell
                                                                        key={
                                                                            entry.name
                                                                        }
                                                                        fill={
                                                                            entry.color
                                                                        }
                                                                    />
                                                                )
                                                            )}
                                                        </Bar>

                                                    </BarChart>
                                                </ResponsiveContainer>

                                            </div>
                                        )}

                                    </div>

                                    {/* Status footer */}

                                    <div className="grid grid-cols-3 border-t border-slate-100">

                                        <div className="px-3 py-3 text-center">
                                            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                                                Completed
                                            </p>

                                            <p className="mt-1 text-sm font-bold text-blue-600">
                                                {loadingStats
                                                    ? "—"
                                                    : completed}
                                            </p>
                                        </div>

                                        <div className="border-x border-slate-100 px-3 py-3 text-center">
                                            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                                                Pending
                                            </p>

                                            <p className="mt-1 text-sm font-bold text-amber-600">
                                                {loadingStats
                                                    ? "—"
                                                    : pending}
                                            </p>
                                        </div>

                                        <div className="px-3 py-3 text-center">
                                            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                                                Attention
                                            </p>

                                            <p className="mt-1 text-sm font-bold text-red-600">
                                                {loadingStats
                                                    ? "—"
                                                    : failed}
                                            </p>
                                        </div>

                                    </div>

                                </div>

                            </div>
                        </section>

                        {/* =================================================
                            RECENT INSPECTIONS
                        ================================================== */}

                        <section className="mb-6">

                            <RecentInspections
                                inspections={
                                    recentInspections
                                }
                                loading={
                                    loadingRecent
                                }
                                error={
                                    recentError
                                }
                                onRetry={() =>
                                    loadRecentInspections(
                                        recentPagination.page
                                    )
                                }
                                pagination={
                                    recentPagination
                                }
                                onPageChange={(
                                    nextPage
                                ) =>
                                    loadRecentInspections(
                                        nextPage
                                    )
                                }
                            />

                        </section>

                    </div>
                </main>
            </div>
        </div>
    );
}