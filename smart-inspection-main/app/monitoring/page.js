"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
    Activity,
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    Clock3,
    RefreshCw,
    ShieldCheck,
    XCircle,
} from "lucide-react";

import DashboardSidebar from "../components/layout/DashboardSidebar";
import DashboardHeader from "../components/layout/DashboardHeader";
import MobileSidebar from "../components/layout/MobileSidebar";

/* =============================================================
   RESULT CONFIG
============================================================= */

const RESULT_CONFIG = {
    passed: {
        label: "Passed",
        shortLabel: "Normal",
        icon: CheckCircle2,
        badge:
            "border-emerald-200 bg-emerald-50 text-emerald-700",
        iconBox:
            "bg-emerald-50 text-emerald-600",
        dot: "bg-emerald-500",
        accent: "text-emerald-600",
    },

    warning: {
        label: "Warning",
        shortLabel: "Review",
        icon: AlertTriangle,
        badge:
            "border-amber-200 bg-amber-50 text-amber-700",
        iconBox:
            "bg-amber-50 text-amber-600",
        dot: "bg-amber-500",
        accent: "text-amber-600",
    },

    failed: {
        label: "Failed",
        shortLabel: "Critical",
        icon: XCircle,
        badge:
            "border-red-200 bg-red-50 text-red-700",
        iconBox:
            "bg-red-50 text-red-600",
        dot: "bg-red-500",
        accent: "text-red-600",
    },

    pending: {
        label: "Pending",
        shortLabel: "Pending",
        icon: Clock3,
        badge:
            "border-slate-200 bg-slate-50 text-slate-600",
        iconBox:
            "bg-slate-100 text-slate-500",
        dot: "bg-slate-400",
        accent: "text-slate-500",
    },
};

/* =============================================================
   HELPERS
============================================================= */

function normalizeResult(result) {
    const value = String(result || "pending").toLowerCase();

    if (
        value === "passed" ||
        value === "warning" ||
        value === "failed"
    ) {
        return value;
    }

    return "pending";
}

function formatDateTime(value) {
    if (!value) {
        return {
            date: "—",
            time: "—",
        };
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return {
            date: "—",
            time: "—",
        };
    }

    return {
        date: date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }),

        time: date.toLocaleTimeString("en-IN", {
            hour: "numeric",
            minute: "2-digit",
        }),
    };
}

function formatActivityTime(value) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
    });
}

/* =============================================================
   PAGE
============================================================= */

export default function MonitoringPage() {
    const router = useRouter();

    /* =========================================================
       USER
    ========================================================= */

    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    /* =========================================================
       DATA
    ========================================================= */

    const [stats, setStats] = useState(null);
    const [inspections, setInspections] = useState([]);

    /* =========================================================
       LOADING / ERROR
    ========================================================= */

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /* =========================================================
       REFRESH
    ========================================================= */

    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    /* =========================================================
       MOBILE SIDEBAR
    ========================================================= */

    const [mobileSidebarOpen, setMobileSidebarOpen] =
        useState(false);

    /* =========================================================
       LOAD MONITORING
    ========================================================= */

    const loadMonitoring = useCallback(
        async (showRefreshState = false) => {
            try {
                if (showRefreshState) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");

                /* -------------------------------------------------
                   USER
                ------------------------------------------------- */

                const userResponse = await fetch(
                    "/api/auth/me",
                    {
                        method: "GET",
                        credentials: "include",
                        cache: "no-store",
                    }
                );

                const userData =
                    await userResponse.json();

                if (userResponse.status === 401) {
                    router.replace("/login");
                    return;
                }

                if (
                    !userResponse.ok ||
                    !userData.success
                ) {
                    throw new Error(
                        userData.message ||
                        "Failed to load user"
                    );
                }

                setUser(userData.user);

                /* -------------------------------------------------
                   STATS
                ------------------------------------------------- */

                const statsResponse = await fetch(
                    "/api/inspections/stats",
                    {
                        method: "GET",
                        credentials: "include",
                        cache: "no-store",
                    }
                );

                const statsData =
                    await statsResponse.json();

                if (statsResponse.status === 401) {
                    router.replace("/login");
                    return;
                }

                if (
                    !statsResponse.ok ||
                    !statsData.success
                ) {
                    throw new Error(
                        statsData.message ||
                        "Failed to load monitoring statistics"
                    );
                }

                setStats(statsData.data || {});

                /* -------------------------------------------------
                   RECENT INSPECTIONS
                ------------------------------------------------- */

                const recentResponse = await fetch(
                    "/api/inspections/recent?page=1&limit=20",
                    {
                        method: "GET",
                        credentials: "include",
                        cache: "no-store",
                    }
                );

                const recentData =
                    await recentResponse.json();

                if (recentResponse.status === 401) {
                    router.replace("/login");
                    return;
                }

                if (
                    !recentResponse.ok ||
                    !recentData.success
                ) {
                    throw new Error(
                        recentData.message ||
                        "Failed to load inspection activity"
                    );
                }

                setInspections(
                    Array.isArray(recentData.data)
                        ? recentData.data
                        : []
                );

                setLastUpdated(new Date());
            } catch (error) {
                console.error(
                    "❌ Monitoring loading error:",
                    error
                );

                setError(
                    error.message ||
                    "Unable to load monitoring data"
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
                setLoadingUser(false);
            }
        },
        [router]
    );

    /* =========================================================
       INITIAL LOAD
    ========================================================= */

    useEffect(() => {
        loadMonitoring(false);
    }, [loadMonitoring]);

    /* =========================================================
       AUTO REFRESH
    ========================================================= */

    useEffect(() => {
        const interval = setInterval(() => {
            loadMonitoring(true);
        }, 30000);

        return () => {
            clearInterval(interval);
        };
    }, [loadMonitoring]);

    /* =========================================================
       LOGOUT
    ========================================================= */

    async function handleLogout() {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });
        } catch (error) {
            console.error(
                "❌ Logout error:",
                error
            );
        } finally {
            router.replace("/login");
        }
    }

    /* =========================================================
       SAFE STATS
    ========================================================= */

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

    const attention =
        warning + failed;

    /* =========================================================
       ATTENTION QUEUE
    ========================================================= */

    const attentionInspections = useMemo(() => {
        return inspections
            .filter((inspection) => {
                const result = normalizeResult(
                    inspection.result
                );

                return (
                    result === "failed" ||
                    result === "warning"
                );
            })
            .sort((a, b) => {
                const resultA =
                    normalizeResult(a.result);

                const resultB =
                    normalizeResult(b.result);

                if (
                    resultA === "failed" &&
                    resultB !== "failed"
                ) {
                    return -1;
                }

                if (
                    resultB === "failed" &&
                    resultA !== "failed"
                ) {
                    return 1;
                }

                const dateA = new Date(
                    a.inspectedAt ||
                    a.createdAt ||
                    0
                ).getTime();

                const dateB = new Date(
                    b.inspectedAt ||
                    b.createdAt ||
                    0
                ).getTime();

                return dateB - dateA;
            });
    }, [inspections]);

    /* =========================================================
       AUTOMATION ACTIVITY
    ========================================================= */

    const automationActivity = useMemo(() => {
        return inspections
            .slice()
            .sort((a, b) => {
                const dateA = new Date(
                    a.inspectedAt ||
                    a.createdAt ||
                    0
                ).getTime();

                const dateB = new Date(
                    b.inspectedAt ||
                    b.createdAt ||
                    0
                ).getTime();

                return dateB - dateA;
            })
            .slice(0, 6)
            .map((inspection) => {
                const result =
                    normalizeResult(
                        inspection.result
                    );

                const assetName =
                    inspection.assetName ||
                    "Untitled inspection";

                const id =
                    inspection.id ||
                    inspection._id;

                if (result === "failed") {
                    return {
                        id,
                        result,
                        title:
                            "Failed inspection detected",
                        description:
                            `${assetName} was marked as failed and requires immediate attention.`,
                        time:
                            inspection.inspectedAt ||
                            inspection.createdAt,
                    };
                }

                if (result === "warning") {
                    return {
                        id,
                        result,
                        title:
                            "Warning condition detected",
                        description:
                            `${assetName} was marked for review.`,
                        time:
                            inspection.inspectedAt ||
                            inspection.createdAt,
                    };
                }

                if (result === "passed") {
                    return {
                        id,
                        result,
                        title:
                            "Inspection completed",
                        description:
                            `${assetName} automatically received a passed result.`,
                        time:
                            inspection.inspectedAt ||
                            inspection.createdAt,
                    };
                }

                return {
                    id,
                    result,
                    title:
                        "Inspection pending",
                    description:
                        `${assetName} has not received a final result yet.`,
                    time:
                        inspection.inspectedAt ||
                        inspection.createdAt,
                };
            });
    }, [inspections]);

    /* =========================================================
       INSPECTION PERFORMANCE
       Passed result / completed inspections
    ========================================================= */

    const passRate =
        completed > 0
            ? Math.round(
                (passed / completed) * 100
            )
            : 0;

    const performanceLabel =
        completed === 0
            ? "No completed inspections"
            : passRate >= 80
                ? "Strong performance"
                : passRate >= 50
                    ? "Needs review"
                    : "Attention required";

    const performanceColor =
        completed === 0
            ? "text-slate-500"
            : passRate >= 80
                ? "text-emerald-600"
                : passRate >= 50
                    ? "text-amber-600"
                    : "text-red-600";

    /* =========================================================
       LOADING SCREEN
    ========================================================= */

    if (loadingUser) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

                    <span>
                        Loading monitoring...
                    </span>
                </div>
            </div>
        );
    }

    /* =========================================================
       PAGE
    ========================================================= */

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
                MAIN
            ================================================== */}

            <div className="lg:pl-[272px]">
                <DashboardHeader
                    user={user}
                    title="Monitoring"
                    subtitle="Inspector workspace"
                    onMenuClick={() =>
                        setMobileSidebarOpen(true)
                    }
                    onLogout={handleLogout}
                />

                <main className="px-4 py-7 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-[1440px]">
                        {/* =================================================
                            PAGE HEADER
                        ================================================== */}

                        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20">
                                        <Activity
                                            size={18}
                                            strokeWidth={2}
                                        />
                                    </div>

                                    <div>
                                        <h1 className="font-[family-name:var(--font-sora)] text-xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-2xl">
                                            Monitoring
                                        </h1>

                                        <p className="mt-0.5 text-xs text-slate-400">
                                            Operational attention center
                                        </p>
                                    </div>
                                </div>

                                <p className="mt-3 max-w-2xl text-xs leading-5 text-slate-500">
                                    Review inspection conditions,
                                    identify issues, and follow
                                    system-generated inspection
                                    activity.
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                {lastUpdated && (
                                    <div className="hidden text-right sm:block">
                                        <p className="text-[10px] uppercase tracking-[0.12em] text-slate-400">
                                            Last updated
                                        </p>

                                        <p className="mt-0.5 text-xs font-medium text-slate-600">
                                            {lastUpdated.toLocaleTimeString(
                                                "en-IN",
                                                {
                                                    hour: "numeric",
                                                    minute: "2-digit",
                                                    second: "2-digit",
                                                }
                                            )}
                                        </p>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={() =>
                                        loadMonitoring(
                                            true
                                        )
                                    }
                                    disabled={refreshing}
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <RefreshCw
                                        size={14}
                                        className={
                                            refreshing
                                                ? "animate-spin"
                                                : ""
                                        }
                                    />

                                    Refresh
                                </button>
                            </div>
                        </div>

                        {/* =================================================
                            ERROR
                        ================================================== */}

                        {error && (
                            <section className="mb-6 rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                                        <AlertTriangle
                                            size={17}
                                        />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <h2 className="text-sm font-semibold text-slate-900">
                                            Unable to load monitoring data
                                        </h2>

                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            {error}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            loadMonitoring(
                                                true
                                            )
                                        }
                                        className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                                    >
                                        Retry
                                    </button>
                                </div>
                            </section>
                        )}

                        {/* =================================================
                            OPERATIONAL STATUS
                        ================================================== */}

                        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <StatusCard
                                label="Critical"
                                value={failed}
                                description="Failed inspections"
                                icon={XCircle}
                                iconClass="bg-red-50 text-red-600"
                                valueClass="text-red-600"
                                borderClass="border-red-100"
                            />

                            <StatusCard
                                label="Warning"
                                value={warning}
                                description="Requires review"
                                icon={AlertTriangle}
                                iconClass="bg-amber-50 text-amber-600"
                                valueClass="text-amber-600"
                                borderClass="border-amber-100"
                            />

                            <StatusCard
                                label="Normal"
                                value={passed}
                                description="Passed inspections"
                                icon={CheckCircle2}
                                iconClass="bg-emerald-50 text-emerald-600"
                                valueClass="text-emerald-600"
                                borderClass="border-emerald-100"
                            />

                            <StatusCard
                                label="Pending"
                                value={pending}
                                description="Awaiting completion"
                                icon={Clock3}
                                iconClass="bg-slate-100 text-slate-500"
                                valueClass="text-slate-700"
                                borderClass="border-slate-200"
                            />
                        </section>

                        {/* =================================================
                            ATTENTION CENTER
                        ================================================== */}

                        <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
                            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="font-[family-name:var(--font-sora)] text-sm font-semibold tracking-[-0.02em] text-slate-900">
                                            Attention center
                                        </h2>

                                        {attention > 0 && (
                                            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[9px] font-semibold text-red-600">
                                                {attention} requiring attention
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-1 text-[11px] text-slate-400">
                                        Failed inspections are
                                        prioritized before warnings.
                                    </p>
                                </div>

                                <Link
                                    href="/inspections"
                                    className="group inline-flex w-fit items-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] font-semibold text-slate-500 transition-colors hover:bg-slate-50 hover:text-blue-600"
                                >
                                    View inspections

                                    <ArrowRight
                                        size={13}
                                        className="transition-transform group-hover:translate-x-0.5"
                                    />
                                </Link>
                            </div>

                            {loading ? (
                                <div className="divide-y divide-slate-100">
                                    {[1, 2, 3].map(
                                        (item) => (
                                            <div
                                                key={item}
                                                className="flex items-center gap-3 px-5 py-5 sm:px-6"
                                            >
                                                <div className="h-11 w-11 animate-pulse rounded-xl bg-slate-100" />

                                                <div className="min-w-0 flex-1">
                                                    <div className="h-3.5 w-48 animate-pulse rounded bg-slate-100" />

                                                    <div className="mt-2 h-3 w-36 animate-pulse rounded bg-slate-100" />

                                                    <div className="mt-2 h-2.5 w-28 animate-pulse rounded bg-slate-100" />
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : attentionInspections.length ===
                                0 ? (
                                <div className="flex min-h-[250px] flex-col items-center justify-center px-6 py-12 text-center">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                        <ShieldCheck
                                            size={23}
                                            strokeWidth={1.8}
                                        />
                                    </div>

                                    <h3 className="mt-4 text-sm font-semibold text-slate-900">
                                        No immediate issues
                                    </h3>

                                    <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
                                        No failed or warning
                                        inspections were found
                                        in the latest monitoring
                                        activity.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {attentionInspections
                                        .slice(0, 6)
                                        .map(
                                            (
                                                inspection
                                            ) => (
                                                <AttentionRow
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
                            )}
                        </section>

                        {/* =================================================
                            PERFORMANCE + RESULT DISTRIBUTION
                        ================================================== */}

                        <div className="mb-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
                            {/* =================================================
                                INSPECTION PERFORMANCE
                            ================================================== */}

                            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
                                <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                                    <h2 className="font-[family-name:var(--font-sora)] text-sm font-semibold tracking-[-0.02em] text-slate-900">
                                        Inspection performance
                                    </h2>

                                    <p className="mt-1 text-[11px] text-slate-400">
                                        Current passed-result ratio
                                    </p>
                                </div>

                                <div className="flex items-center gap-6 px-5 py-7 sm:px-6">
                                    <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-slate-50">
                                        <div
                                            className="absolute inset-0 rounded-full"
                                            style={{
                                                background: `conic-gradient(#10b981 ${passRate * 3.6
                                                    }deg, #e2e8f0 0deg)`,
                                            }}
                                        />

                                        <div className="relative flex h-[88px] w-[88px] items-center justify-center rounded-full bg-white">
                                            <div className="text-center">
                                                <p className="font-[family-name:var(--font-sora)] text-xl font-semibold text-slate-900">
                                                    {passRate}%
                                                </p>

                                                <p className="text-[8px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                                                    Pass rate
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="min-w-0">
                                        <p
                                            className={`text-sm font-semibold ${performanceColor}`}
                                        >
                                            {performanceLabel}
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-slate-400">
                                            {completed > 0
                                                ? `${passed} of ${completed} completed inspections received a passed result.`
                                                : "Complete an inspection to start calculating the pass rate."}
                                        </p>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
                                    <div className="grid grid-cols-2 gap-3">
                                        <MiniMetric
                                            label="Completed"
                                            value={
                                                completed
                                            }
                                        />

                                        <MiniMetric
                                            label="Attention"
                                            value={
                                                attention
                                            }
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* =================================================
                                RESULT DISTRIBUTION
                            ================================================== */}

                            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
                                <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="font-[family-name:var(--font-sora)] text-sm font-semibold tracking-[-0.02em] text-slate-900">
                                                Result distribution
                                            </h2>

                                            <p className="mt-1 text-[11px] text-slate-400">
                                                Automated inspection
                                                outcomes
                                            </p>
                                        </div>

                                        <div className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] font-semibold text-slate-500">
                                            {total} total
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 divide-x divide-slate-100">
                                    <ResultMetric
                                        label="Passed"
                                        value={passed}
                                        icon={
                                            CheckCircle2
                                        }
                                        valueClass="text-emerald-600"
                                    />

                                    <ResultMetric
                                        label="Warning"
                                        value={warning}
                                        icon={
                                            AlertTriangle
                                        }
                                        valueClass="text-amber-600"
                                    />

                                    <ResultMetric
                                        label="Failed"
                                        value={failed}
                                        icon={XCircle}
                                        valueClass="text-red-600"
                                    />
                                </div>

                                <div className="border-t border-slate-100 px-5 py-5 sm:px-6">
                                    <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
                                        {total > 0 && (
                                            <>
                                                {passed > 0 && (
                                                    <div
                                                        className="bg-emerald-500 transition-all"
                                                        style={{
                                                            width: `${Math.min(
                                                                (passed /
                                                                    total) *
                                                                100,
                                                                100
                                                            )}%`,
                                                        }}
                                                    />
                                                )}

                                                {warning > 0 && (
                                                    <div
                                                        className="bg-amber-400 transition-all"
                                                        style={{
                                                            width: `${Math.min(
                                                                (warning /
                                                                    total) *
                                                                100,
                                                                100
                                                            )}%`,
                                                        }}
                                                    />
                                                )}

                                                {failed > 0 && (
                                                    <div
                                                        className="bg-red-500 transition-all"
                                                        style={{
                                                            width: `${Math.min(
                                                                (failed /
                                                                    total) *
                                                                100,
                                                                100
                                                            )}%`,
                                                        }}
                                                    />
                                                )}
                                            </>
                                        )}
                                    </div>

                                    <div className="mt-2 flex justify-between text-[10px] text-slate-400">
                                        <span>
                                            Passed
                                        </span>

                                        <span>
                                            Warning
                                        </span>

                                        <span>
                                            Failed
                                        </span>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* =================================================
                            AUTOMATION ACTIVITY
                        ================================================== */}

                        <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
                            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="font-[family-name:var(--font-sora)] text-sm font-semibold tracking-[-0.02em] text-slate-900">
                                            Automation activity
                                        </h2>

                                        <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-2 py-1 text-[9px] font-semibold text-blue-700">
                                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />

                                            Automated
                                        </span>
                                    </div>

                                    <p className="mt-1 text-[11px] text-slate-400">
                                        System-generated inspection
                                        result activity
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                                    Monitoring active
                                </div>
                            </div>

                            {loading ? (
                                <div className="divide-y divide-slate-100">
                                    {[1, 2, 3, 4].map(
                                        (item) => (
                                            <div
                                                key={item}
                                                className="flex gap-3 px-5 py-4 sm:px-6"
                                            >
                                                <div className="h-8 w-8 animate-pulse rounded-full bg-slate-100" />

                                                <div className="min-w-0 flex-1">
                                                    <div className="h-3.5 w-48 animate-pulse rounded bg-slate-100" />

                                                    <div className="mt-2 h-3 w-72 max-w-full animate-pulse rounded bg-slate-100" />
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : automationActivity.length ===
                                0 ? (
                                <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                                        <Activity
                                            size={19}
                                        />
                                    </div>

                                    <h3 className="mt-3 text-sm font-semibold text-slate-900">
                                        No automation activity
                                    </h3>

                                    <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
                                        Automated inspection
                                        activity will appear
                                        here after inspections
                                        are completed.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {automationActivity.map(
                                        (activity) => (
                                            <AutomationRow
                                                key={
                                                    activity.id
                                                }
                                                activity={
                                                    activity
                                                }
                                            />
                                        )
                                    )}
                                </div>
                            )}
                        </section>

                        {/* =================================================
                            MONITORING FOOTER
                        ================================================== */}

                        <div className="flex flex-col gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                                <span className="text-[10px] font-medium text-slate-500">
                                    Monitoring service operational
                                </span>
                            </div>

                            <p className="text-[10px] text-slate-400">
                                Activity refreshes automatically
                                every 30 seconds
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

/* =============================================================
   STATUS CARD
============================================================= */

function StatusCard({
    label,
    value,
    description,
    icon: Icon,
    iconClass,
    valueClass,
    borderClass,
}) {
    return (
        <div
            className={`rounded-2xl border bg-white p-4 shadow-sm shadow-slate-200/30 ${borderClass}`}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                        {label}
                    </p>

                    <p
                        className={`mt-2 font-[family-name:var(--font-sora)] text-2xl font-semibold tracking-tight ${valueClass}`}
                    >
                        {value}
                    </p>

                    <p className="mt-1 text-[10px] text-slate-400">
                        {description}
                    </p>
                </div>

                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
                >
                    <Icon
                        size={18}
                        strokeWidth={1.9}
                    />
                </div>
            </div>
        </div>
    );
}

/* =============================================================
   ATTENTION ROW
============================================================= */

function AttentionRow({ inspection }) {
    const result = normalizeResult(
        inspection.result
    );

    const config =
        RESULT_CONFIG[result] ||
        RESULT_CONFIG.pending;

    const Icon = config.icon;

    const dateTime = formatDateTime(
        inspection.inspectedAt ||
        inspection.createdAt
    );

    const inspectionId =
        inspection.id ||
        inspection._id;

    return (
        <Link
            href={`/inspections/${inspectionId}`}
            className="group flex items-center gap-3 px-5 py-4 transition-colors hover:bg-slate-50 sm:px-6"
        >
            <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${config.iconBox}`}
            >
                <Icon
                    size={18}
                    strokeWidth={1.9}
                />
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span
                        className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
                    />

                    <span
                        className={`text-[9px] font-bold uppercase tracking-[0.12em] ${config.accent}`}
                    >
                        {result === "failed"
                            ? "Critical"
                            : "Review required"}
                    </span>
                </div>

                <h3 className="mt-1 truncate text-sm font-semibold text-slate-900 group-hover:text-blue-600">
                    {inspection.assetName ||
                        "Untitled inspection"}
                </h3>

                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-slate-400">
                    <span>
                        {inspection.inspectionType ||
                            "Inspection"}
                    </span>

                    <span className="text-slate-300">
                        •
                    </span>

                    <span>
                        {dateTime.date}
                    </span>

                    <span className="text-slate-300">
                        •
                    </span>

                    <span>
                        {dateTime.time}
                    </span>
                </div>
            </div>

            <div className="hidden shrink-0 items-center gap-2 sm:flex">
                <span
                    className={`rounded-full border px-2.5 py-1.5 text-[10px] font-semibold ${config.badge}`}
                >
                    {config.label}
                </span>

                <ArrowRight
                    size={14}
                    className="text-slate-300 transition-colors group-hover:text-blue-500"
                />
            </div>
        </Link>
    );
}

/* =============================================================
   RESULT METRIC
============================================================= */

function ResultMetric({
    label,
    value,
    icon: Icon,
    valueClass,
}) {
    return (
        <div className="px-4 py-5 text-center">
            <div className="flex justify-center">
                <Icon
                    size={16}
                    strokeWidth={1.9}
                    className={valueClass}
                />
            </div>

            <p
                className={`mt-2 font-[family-name:var(--font-sora)] text-xl font-semibold ${valueClass}`}
            >
                {value}
            </p>

            <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                {label}
            </p>
        </div>
    );
}

/* =============================================================
   MINI METRIC
============================================================= */

function MiniMetric({
    label,
    value,
}) {
    return (
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-3">
            <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                {label}
            </p>

            <p className="mt-1 font-[family-name:var(--font-sora)] text-lg font-semibold text-slate-900">
                {value}
            </p>
        </div>
    );
}

/* =============================================================
   AUTOMATION ROW
============================================================= */

function AutomationRow({ activity }) {
    const config =
        RESULT_CONFIG[activity.result] ||
        RESULT_CONFIG.pending;

    const Icon = config.icon;

    return (
        <Link
            href={`/inspections/${activity.id}`}
            className="group flex gap-3 px-5 py-4 transition-colors hover:bg-slate-50 sm:px-6"
        >
            <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${config.iconBox}`}
            >
                <Icon
                    size={16}
                    strokeWidth={1.9}
                />
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-600">
                        {activity.title}
                    </p>

                    <span className="shrink-0 text-[10px] text-slate-400">
                        {formatActivityTime(
                            activity.time
                        )}
                    </span>
                </div>

                <p className="mt-1 text-[11px] leading-5 text-slate-400">
                    {activity.description}
                </p>
            </div>
        </Link>
    );
}