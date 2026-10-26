"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
    Activity,
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    ClipboardCheck,
    Clock3,
    RefreshCw,
    ShieldAlert,
    ShieldCheck,
    Users,
    XCircle,
} from "lucide-react";

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

import DashboardSidebar from "../../components/layout/DashboardSidebar";
import DashboardHeader from "../../components/layout/DashboardHeader";
import MobileSidebar from "../../components/layout/MobileSidebar";

// =============================================================
// RESULT CONFIG
// =============================================================

const RESULT_CONFIG = {
    passed: {
        label: "Passed",
        icon: CheckCircle2,
        badge:
            "border-emerald-200 bg-emerald-50 text-emerald-700",
        iconBox:
            "bg-emerald-50 text-emerald-600",
    },

    warning: {
        label: "Warning",
        icon: AlertTriangle,
        badge:
            "border-amber-200 bg-amber-50 text-amber-700",
        iconBox:
            "bg-amber-50 text-amber-600",
    },

    failed: {
        label: "Failed",
        icon: XCircle,
        badge:
            "border-red-200 bg-red-50 text-red-700",
        iconBox:
            "bg-red-50 text-red-600",
    },

    pending: {
        label: "Pending",
        icon: Clock3,
        badge:
            "border-slate-200 bg-slate-50 text-slate-600",
        iconBox:
            "bg-slate-100 text-slate-500",
    },
};

// =============================================================
// HELPERS
// =============================================================

function normalizeResult(result) {
    const value = String(
        result || "pending"
    ).toLowerCase();

    if (RESULT_CONFIG[value]) {
        return value;
    }

    return "pending";
}

function formatDate(value) {
    if (!value) {
        return "—";
    }

    try {
        return new Intl.DateTimeFormat(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        ).format(new Date(value));
    } catch {
        return "—";
    }
}

function formatTime(value) {
    if (!value) {
        return "—";
    }

    try {
        return new Intl.DateTimeFormat(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
            }
        ).format(new Date(value));
    } catch {
        return "—";
    }
}

// =============================================================
// PAGE
// =============================================================

export default function AdminDashboardPage() {
    const router = useRouter();

    const [user, setUser] = useState(null);

    const [loadingUser, setLoadingUser] =
        useState(true);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [dashboard, setDashboard] =
        useState(null);

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
    // LOAD DASHBOARD
    // =========================================================

    const loadDashboard = useCallback(
        async (showRefresh = false) => {
            try {
                if (showRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");

                const response = await fetch(
                    "/api/admin/dashboard",
                    {
                        method: "GET",
                        credentials: "include",
                        cache: "no-store",
                    }
                );

                const data =
                    await response.json();

                if (response.status === 401) {
                    router.replace("/login");
                    return;
                }

                if (response.status === 403) {
                    router.replace("/dashboard");
                    return;
                }

                if (
                    !response.ok ||
                    !data.success
                ) {
                    throw new Error(
                        data.message ||
                        "Unable to load admin dashboard."
                    );
                }

                setDashboard(
                    data.data || null
                );
            } catch (requestError) {
                console.error(
                    "❌ Admin dashboard error:",
                    requestError
                );

                setError(
                    requestError.message ||
                    "Unable to load admin dashboard."
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [router]
    );

    // =========================================================
    // AUTHENTICATION
    // =========================================================

    useEffect(() => {
        let mounted = true;

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
                    response.status ===
                    401
                ) {
                    router.replace(
                        "/login"
                    );
                    return;
                }

                if (
                    !response.ok ||
                    !data.success
                ) {
                    router.replace(
                        "/login"
                    );
                    return;
                }

                if (
                    data.user?.role !==
                    "admin"
                ) {
                    router.replace(
                        "/dashboard"
                    );
                    return;
                }

                if (mounted) {
                    setUser(
                        data.user
                    );
                }
            } catch (authError) {
                console.error(
                    "❌ Admin auth check failed:",
                    authError
                );

                router.replace(
                    "/login"
                );
            } finally {
                if (mounted) {
                    setLoadingUser(
                        false
                    );
                }
            }
        }

        loadUser();

        return () => {
            mounted = false;
        };
    }, [router]);

    // =========================================================
    // LOAD AFTER AUTH
    // =========================================================

    useEffect(() => {
        if (loadingUser || !user) {
            return;
        }

        loadDashboard();
    }, [
        loadingUser,
        user,
        loadDashboard,
    ]);

    // =========================================================
    // EXPORT INSPECTIONS
    // =========================================================

    async function handleExport() {
        try {
            setExporting(true);
            setExportError("");

            const response = await fetch(
                "/api/admin/export",
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

            link.download = `all-inspections-${new Date()
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

    const handleLogout = async () => {
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
                "Logout error:",
                logoutError
            );
        } finally {
            router.replace(
                "/login"
            );
        }
    };

    // =========================================================
    // DATA
    // =========================================================

    const stats =
        dashboard?.stats || {};

    const inspectors =
        dashboard?.inspectors || {};

    const recent =
        Array.isArray(
            dashboard?.recent
        )
            ? dashboard.recent
            : [];

    const inspectorActivity =
        Array.isArray(
            dashboard?.inspectorActivity
        )
            ? dashboard.inspectorActivity
            : [];

    const total = Number(
        stats.total || 0
    );

    const completed = Number(
        stats.completed || 0
    );

    const pending = Number(
        stats.pending || 0
    );

    const passed = Number(
        stats.passed || 0
    );

    const warning = Number(
        stats.warning || 0
    );

    const failed = Number(
        stats.failed || 0
    );

    const attention = Number(
        stats.attention ||
        warning + failed
    );

    // =========================================================
    // RESULT CHART
    // =========================================================

    const resultChartData =
        useMemo(
            () => [
                {
                    name: "Passed",
                    value: passed,
                },
                {
                    name: "Warning",
                    value: warning,
                },
                {
                    name: "Failed",
                    value: failed,
                },
            ],
            [
                passed,
                warning,
                failed,
            ]
        );

    const activityChartData =
        useMemo(
            () =>
                inspectorActivity
                    .slice(0, 6)
                    .map(
                        (item) => ({
                            name:
                                item.name
                                    ?.split(
                                        " "
                                    )[0] ||
                                "Inspector",
                            inspections:
                                Number(
                                    item.inspections ||
                                    0
                                ),
                            completed:
                                Number(
                                    item.completed ||
                                    0
                                ),
                        })
                    ),
            [inspectorActivity]
        );

    // =========================================================
    // ATTENTION
    // =========================================================

    const attentionInspections =
        recent.filter(
            (inspection) => {
                const result =
                    normalizeResult(
                        inspection.result
                    );

                return (
                    result ===
                    "failed" ||
                    result ===
                    "warning"
                );
            }
        );

    // =========================================================
    // LOADING SCREEN
    // =========================================================

    if (loadingUser) {
        return (
            <div className="min-h-screen bg-slate-50">
                <DashboardSidebar />

                <div className="lg:pl-[260px]">
                    <DashboardHeader
                        user={null}
                        title="Admin Dashboard"
                        subtitle="System administration"
                        onMenuClick={() =>
                            setMobileSidebarOpen(
                                true
                            )
                        }
                        onLogout={
                            handleLogout
                        }
                    />

                    <main className="px-4 py-6 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-7xl">
                            <div className="animate-pulse">
                                <div className="h-7 w-52 rounded-lg bg-slate-200" />

                                <div className="mt-2 h-4 w-80 rounded bg-slate-200" />

                                <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                    {Array.from({
                                        length: 4,
                                    }).map(
                                        (
                                            _,
                                            index
                                        ) => (
                                            <div
                                                key={
                                                    index
                                                }
                                                className="h-28 rounded-2xl border border-slate-200 bg-white"
                                            />
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </main>
                </div>

                <MobileSidebar
                    open={
                        mobileSidebarOpen
                    }
                    onClose={() =>
                        setMobileSidebarOpen(
                            false
                        )
                    }
                    user={user}
                />
            </div>
        );
    }

    // =========================================================
    // PAGE
    // =========================================================

    return (
        <div className="min-h-screen bg-slate-50">
            <DashboardSidebar
                user={user}
            />

            <div className="lg:pl-[260px]">
                <DashboardHeader
                    user={user}
                    title="Admin Dashboard"
                    subtitle="System administration"
                    onMenuClick={() =>
                        setMobileSidebarOpen(
                            true
                        )
                    }
                    onLogout={
                        handleLogout
                    }
                />

                <main className="px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        {/* =================================================
                            HEADER
                        ================================================== */}

                        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-blue-600">
                                        Administration
                                    </span>

                                    <span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-600">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        System operational
                                    </span>
                                </div>

                                <h2 className="mt-2 font-[Sora] text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                                    Admin Dashboard
                                </h2>

                                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                    Monitor inspection activity,
                                    system performance, and
                                    inspector operations.
                                </p>
                            </div>

                            <div className="flex items-center gap-3 self-start sm:self-auto">
                                <button
                                    type="button"
                                    onClick={handleExport}
                                    disabled={exporting}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-xs font-semibold text-emerald-700 shadow-sm transition-all hover:bg-emerald-100 hover:shadow-md active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
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

                                <button
                                    type="button"
                                    onClick={() =>
                                        loadDashboard(
                                            true
                                        )
                                    }
                                    disabled={
                                        refreshing
                                    }
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <RefreshCw
                                        size={14}
                                        className={
                                            refreshing
                                                ? "animate-spin"
                                                : ""
                                        }
                                    />

                                    {refreshing
                                        ? "Refreshing..."
                                        : "Refresh"}
                                </button>
                            </div>
                        </div>

                        {/* =================================================
                            ERROR
                        ================================================== */}

                        {error && (
                            <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-start gap-3">
                                    <ShieldAlert
                                        size={18}
                                        className="mt-0.5 shrink-0 text-red-600"
                                    />

                                    <div>
                                        <p className="text-sm font-semibold text-red-800">
                                            Unable to load
                                            dashboard
                                        </p>

                                        <p className="mt-1 text-xs text-red-600">
                                            {error}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        loadDashboard(
                                            true
                                        )
                                    }
                                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-xs font-semibold text-red-700"
                                >
                                    <RefreshCw
                                        size={13}
                                    />

                                    Retry
                                </button>
                            </div>
                        )}

                        {/* =========================================
                            EXPORT ERROR
                        ========================================== */}

                        {exportError && (
                            <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-start gap-3">
                                    <ShieldAlert
                                        size={18}
                                        className="mt-0.5 shrink-0 text-red-600"
                                    />

                                    <div>
                                        <p className="text-sm font-semibold text-red-800">
                                            Export failed
                                        </p>

                                        <p className="mt-1 text-xs text-red-600">
                                            {exportError}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setExportError("")
                                    }
                                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-xs font-semibold text-red-700"
                                >
                                    Dismiss
                                </button>
                            </div>
                        )}

                        {/* =================================================
                            OVERVIEW CARDS
                        ================================================== */}

                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <OverviewCard
                                label="Total inspections"
                                value={total}
                                icon={
                                    ClipboardCheck
                                }
                                iconClass="bg-blue-50 text-blue-600"
                                description="All inspection records"
                            />

                            <OverviewCard
                                label="Completed"
                                value={
                                    completed
                                }
                                icon={
                                    CheckCircle2
                                }
                                iconClass="bg-emerald-50 text-emerald-600"
                                description="Submitted inspections"
                            />

                            <OverviewCard
                                label="Pending"
                                value={
                                    pending
                                }
                                icon={
                                    Clock3
                                }
                                iconClass="bg-slate-100 text-slate-500"
                                description="Draft inspections"
                            />

                            <OverviewCard
                                label="Attention"
                                value={
                                    attention
                                }
                                icon={
                                    AlertTriangle
                                }
                                iconClass="bg-amber-50 text-amber-600"
                                description="Warning or failed"
                                danger={
                                    attention >
                                    0
                                }
                            />
                        </div>

                        {/* =================================================
                            CHARTS
                        ================================================== */}

                        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1.35fr]">
                            {/* Result Distribution */}
                            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-900">
                                            Inspection results
                                        </h3>

                                        <p className="mt-0.5 text-[11px] text-slate-400">
                                            Overall result
                                            distribution
                                        </p>
                                    </div>

                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                                        <Activity
                                            size={
                                                17
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="p-5 sm:p-6">
                                    {total ===
                                        0 ? (
                                        <EmptyChart />
                                    ) : (
                                        <div className="flex flex-col items-center gap-6 sm:flex-row">
                                            <div className="h-[210px] w-full sm:w-[220px]">
                                                <ResponsiveContainer
                                                    width="100%"
                                                    height="100%"
                                                >
                                                    <PieChart>
                                                        <Pie
                                                            data={
                                                                resultChartData
                                                            }
                                                            dataKey="value"
                                                            nameKey="name"
                                                            innerRadius={
                                                                62
                                                            }
                                                            outerRadius={
                                                                88
                                                            }
                                                            paddingAngle={
                                                                3
                                                            }
                                                            strokeWidth={
                                                                0
                                                            }
                                                        >
                                                            <Cell fill="#16a34a" />
                                                            <Cell fill="#f59e0b" />
                                                            <Cell fill="#dc2626" />
                                                        </Pie>

                                                        <Tooltip
                                                            contentStyle={{
                                                                borderRadius:
                                                                    "12px",
                                                                border: "1px solid #E2E8F0",
                                                                boxShadow:
                                                                    "0 10px 30px rgba(15,23,42,0.08)",
                                                                fontSize:
                                                                    "12px",
                                                            }}
                                                        />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>

                                            <div className="w-full space-y-3">
                                                <ResultLegend
                                                    label="Passed"
                                                    value={
                                                        passed
                                                    }
                                                    percentage={
                                                        total
                                                            ? Math.round(
                                                                (passed /
                                                                    total) *
                                                                100
                                                            )
                                                            : 0
                                                    }
                                                    dotClass="bg-emerald-500"
                                                />

                                                <ResultLegend
                                                    label="Warning"
                                                    value={
                                                        warning
                                                    }
                                                    percentage={
                                                        total
                                                            ? Math.round(
                                                                (warning /
                                                                    total) *
                                                                100
                                                            )
                                                            : 0
                                                    }
                                                    dotClass="bg-amber-500"
                                                />

                                                <ResultLegend
                                                    label="Failed"
                                                    value={
                                                        failed
                                                    }
                                                    percentage={
                                                        total
                                                            ? Math.round(
                                                                (failed /
                                                                    total) *
                                                                100
                                                            )
                                                            : 0
                                                    }
                                                    dotClass="bg-red-500"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Inspector Activity */}
                            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-900">
                                            Inspector activity
                                        </h3>

                                        <p className="mt-0.5 text-[11px] text-slate-400">
                                            Inspection workload
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">
                                        <Users
                                            size={
                                                12
                                            }
                                            className="text-slate-500"
                                        />

                                        <span className="text-[10px] font-semibold text-slate-600">
                                            {
                                                inspectors.active
                                            }{" "}
                                            active
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 sm:p-6">
                                    {activityChartData.length ===
                                        0 ? (
                                        <EmptyChart />
                                    ) : (
                                        <div className="h-[250px] w-full">
                                            <ResponsiveContainer
                                                width="100%"
                                                height="100%"
                                            >
                                                <BarChart
                                                    data={
                                                        activityChartData
                                                    }
                                                    margin={{
                                                        top: 8,
                                                        right: 8,
                                                        left: -20,
                                                        bottom: 0,
                                                    }}
                                                >
                                                    <CartesianGrid
                                                        strokeDasharray="3 3"
                                                        vertical={
                                                            false
                                                        }
                                                        stroke="#E2E8F0"
                                                    />

                                                    <XAxis
                                                        dataKey="name"
                                                        tick={{
                                                            fontSize: 10,
                                                            fill: "#64748B",
                                                        }}
                                                        axisLine={false}
                                                        tickLine={false}
                                                    />

                                                    <YAxis
                                                        allowDecimals={
                                                            false
                                                        }
                                                        tick={{
                                                            fontSize: 10,
                                                            fill: "#94A3B8",
                                                        }}
                                                        axisLine={false}
                                                        tickLine={false}
                                                    />

                                                    <Tooltip
                                                        cursor={{
                                                            fill: "#F8FAFC",
                                                        }}
                                                        contentStyle={{
                                                            borderRadius:
                                                                "12px",
                                                            border: "1px solid #E2E8F0",
                                                            boxShadow:
                                                                "0 10px 30px rgba(15,23,42,0.08)",
                                                            fontSize:
                                                                "12px",
                                                        }}
                                                    />

                                                    <Bar
                                                        dataKey="inspections"
                                                        name="Inspections"
                                                        fill="#2563EB"
                                                        radius={[
                                                            6,
                                                            6,
                                                            0,
                                                            0,
                                                        ]}
                                                        barSize={
                                                            28
                                                        }
                                                    />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* =================================================
                            ATTENTION + SYSTEM USERS
                        ================================================== */}

                        <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_1fr]">
                            {/* Attention */}
                            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-900">
                                            Attention required
                                        </h3>

                                        <p className="mt-0.5 text-[11px] text-slate-400">
                                            Inspections that need
                                            review
                                        </p>
                                    </div>

                                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                                        {attention}
                                    </span>
                                </div>

                                {attentionInspections.length ===
                                    0 ? (
                                    <div className="flex min-h-[180px] flex-col items-center justify-center px-6 text-center">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                                            <CheckCircle2
                                                size={
                                                    20
                                                }
                                            />
                                        </div>

                                        <p className="mt-3 text-sm font-semibold text-slate-800">
                                            No attention required
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            No recent warning or
                                            failed inspections.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {attentionInspections
                                            .slice(
                                                0,
                                                6
                                            )
                                            .map(
                                                (
                                                    inspection
                                                ) => (
                                                    <AttentionRow
                                                        key={
                                                            inspection.id
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

                            {/* Inspector Summary */}
                            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-900">
                                                Inspector accounts
                                            </h3>

                                            <p className="mt-0.5 text-[11px] text-slate-400">
                                                Current account status
                                            </p>
                                        </div>

                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                            <Users
                                                size={
                                                    17
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 divide-x divide-slate-100">
                                    <AccountMetric
                                        label="Total"
                                        value={
                                            inspectors.total ||
                                            0
                                        }
                                    />

                                    <AccountMetric
                                        label="Active"
                                        value={
                                            inspectors.active ||
                                            0
                                        }
                                        valueClass="text-emerald-600"
                                    />

                                    <AccountMetric
                                        label="Inactive"
                                        value={
                                            inspectors.inactive ||
                                            0
                                        }
                                        valueClass="text-slate-500"
                                    />
                                </div>

                                <div className="border-t border-slate-100 p-5 sm:p-6">
                                    <Link
                                        href="/admin/inspectors"
                                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-blue-200 hover:bg-blue-50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <ShieldCheck
                                                size={
                                                    16
                                                }
                                                className="text-blue-600"
                                            />

                                            <div>
                                                <p className="text-xs font-semibold text-slate-800">
                                                    Manage inspectors
                                                </p>

                                                <p className="mt-0.5 text-[10px] text-slate-400">
                                                    Activate or
                                                    deactivate accounts
                                                </p>
                                            </div>
                                        </div>

                                        <ArrowRight
                                            size={
                                                15
                                            }
                                            className="text-slate-400"
                                        />
                                    </Link>
                                </div>
                            </section>
                        </div>

                        {/* =================================================
                            RECENT INSPECTIONS
                        ================================================== */}

                        <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900">
                                        Recent inspections
                                    </h3>

                                    <p className="mt-0.5 text-[11px] text-slate-400">
                                        Latest activity across
                                        the system
                                    </p>
                                </div>

                                <Link
                                    href="/inspections"
                                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                                >
                                    View all
                                    <ArrowRight
                                        size={
                                            13
                                        }
                                    />
                                </Link>
                            </div>

                            {recent.length ===
                                0 ? (
                                <div className="flex min-h-[180px] items-center justify-center px-6 text-center">
                                    <div>
                                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                            <ClipboardCheck
                                                size={
                                                    19
                                                }
                                            />
                                        </div>

                                        <p className="mt-3 text-sm font-semibold text-slate-800">
                                            No inspections yet
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            Inspection activity
                                            will appear here.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Desktop */}
                                    <div className="hidden overflow-x-auto md:block">
                                        <table className="w-full min-w-[720px]">
                                            <thead>
                                                <tr className="border-b border-slate-100 bg-slate-50/70">
                                                    <th className="px-6 py-3 text-left text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                                        Asset
                                                    </th>

                                                    <th className="px-6 py-3 text-left text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                                        Inspector
                                                    </th>

                                                    <th className="px-6 py-3 text-left text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                                        Date
                                                    </th>

                                                    <th className="px-6 py-3 text-left text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                                        Result
                                                    </th>

                                                    <th className="px-6 py-3 text-right text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-slate-100">
                                                {recent.map(
                                                    (
                                                        inspection
                                                    ) => (
                                                        <RecentRow
                                                            key={
                                                                inspection.id
                                                            }
                                                            inspection={
                                                                inspection
                                                            }
                                                        />
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile */}
                                    <div className="divide-y divide-slate-100 md:hidden">
                                        {recent.map(
                                            (
                                                inspection
                                            ) => (
                                                <MobileRecentRow
                                                    key={
                                                        inspection.id
                                                    }
                                                    inspection={
                                                        inspection
                                                    }
                                                />
                                            )
                                        )}
                                    </div>
                                </>
                            )}
                        </section>

                        {/* =================================================
                            FOOTER
                        ================================================== */}

                        <div className="mt-5 flex flex-col gap-2 border-t border-slate-200 pt-4 pb-6 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                                <span className="text-[10px] font-medium text-slate-500">
                                    Admin monitoring service
                                    operational
                                </span>
                            </div>

                            <p className="text-[10px] text-slate-400">
                                Data is loaded from the
                                inspection database.
                            </p>
                        </div>
                    </div>
                </main>
            </div>

            <MobileSidebar
                open={mobileSidebarOpen}
                onClose={() =>
                    setMobileSidebarOpen(
                        false
                    )
                }
                user={user}
            />
        </div>
    );
}

// =============================================================
// OVERVIEW CARD
// =============================================================

function OverviewCard({
    label,
    value,
    icon: Icon,
    iconClass,
    description,
    danger = false,
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-[11px] font-medium text-slate-400">
                        {label}
                    </p>

                    <p
                        className={`mt-2 font-[Sora] text-2xl font-semibold tracking-tight ${danger
                            ? "text-red-600"
                            : "text-slate-950"
                            }`}
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

// =============================================================
// RESULT LEGEND
// =============================================================

function ResultLegend({
    label,
    value,
    percentage,
    dotClass,
}) {
    return (
        <div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span
                        className={`h-2 w-2 rounded-full ${dotClass}`}
                    />

                    <span className="text-xs font-medium text-slate-600">
                        {label}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-800">
                        {value}
                    </span>

                    <span className="text-[10px] text-slate-400">
                        {percentage}%
                    </span>
                </div>
            </div>
        </div>
    );
}

// =============================================================
// ATTENTION ROW
// =============================================================

function AttentionRow({
    inspection,
}) {
    const result =
        normalizeResult(
            inspection.result
        );

    const config =
        RESULT_CONFIG[result];

    const Icon = config.icon;

    return (
        <Link
            href={`/inspections/${inspection.id}`}
            className="flex items-center gap-3 px-5 py-4 transition hover:bg-slate-50 sm:px-6"
        >
            <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${config.iconBox}`}
            >
                <Icon
                    size={16}
                    strokeWidth={1.9}
                />
            </div>

            <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-800">
                    {inspection.assetName}
                </p>

                <p className="mt-0.5 truncate text-[10px] text-slate-400">
                    {inspection.inspector?.name ||
                        "Unknown inspector"}{" "}
                    ·{" "}
                    {formatDate(
                        inspection.inspectedAt
                    )}
                </p>
            </div>

            <span
                className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-bold ${config.badge}`}
            >
                {config.label}
            </span>

            <ArrowRight
                size={14}
                className="shrink-0 text-slate-300"
            />
        </Link>
    );
}

// =============================================================
// ACCOUNT METRIC
// =============================================================

function AccountMetric({
    label,
    value,
    valueClass = "text-slate-950",
}) {
    return (
        <div className="px-3 py-5 text-center">
            <p
                className={`font-[Sora] text-xl font-semibold ${valueClass}`}
            >
                {value}
            </p>

            <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.1em] text-slate-400">
                {label}
            </p>
        </div>
    );
}

// =============================================================
// RECENT ROW
// =============================================================

function RecentRow({
    inspection,
}) {
    const result =
        normalizeResult(
            inspection.result
        );

    const config =
        RESULT_CONFIG[result];

    return (
        <tr className="transition hover:bg-slate-50/70">
            <td className="px-6 py-4">
                <div>
                    <p className="max-w-[220px] truncate text-xs font-semibold text-slate-800">
                        {inspection.assetName}
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-400">
                        {inspection.inspectionType ||
                            "Inspection"}
                    </p>
                </div>
            </td>

            <td className="px-6 py-4">
                <p className="text-xs font-medium text-slate-700">
                    {inspection.inspector
                        ?.name ||
                        "Unknown"}
                </p>
            </td>

            <td className="px-6 py-4">
                <p className="text-xs text-slate-600">
                    {formatDate(
                        inspection.inspectedAt
                    )}
                </p>

                <p className="mt-0.5 text-[10px] text-slate-400">
                    {formatTime(
                        inspection.inspectedAt
                    )}
                </p>
            </td>

            <td className="px-6 py-4">
                <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[9px] font-bold ${config.badge}`}
                >
                    {config.label}
                </span>
            </td>

            <td className="px-6 py-4 text-right">
                <Link
                    href={`/inspections/${inspection.id}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                    aria-label={`View ${inspection.assetName}`}
                >
                    <ArrowRight
                        size={14}
                    />
                </Link>
            </td>
        </tr>
    );
}

// =============================================================
// MOBILE RECENT ROW
// =============================================================

function MobileRecentRow({
    inspection,
}) {
    const result =
        normalizeResult(
            inspection.result
        );

    const config =
        RESULT_CONFIG[result];

    return (
        <Link
            href={`/inspections/${inspection.id}`}
            className="flex items-center gap-3 px-5 py-4 transition hover:bg-slate-50"
        >
            <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${config.iconBox}`}
            >
                {(() => {
                    const Icon =
                        config.icon;

                    return (
                        <Icon
                            size={16}
                            strokeWidth={
                                1.9
                            }
                        />
                    );
                })()}
            </div>

            <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-800">
                    {inspection.assetName}
                </p>

                <p className="mt-0.5 truncate text-[10px] text-slate-400">
                    {inspection.inspector
                        ?.name ||
                        "Unknown"}{" "}
                    ·{" "}
                    {formatDate(
                        inspection.inspectedAt
                    )}
                </p>
            </div>

            <span
                className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-bold ${config.badge}`}
            >
                {config.label}
            </span>
        </Link>
    );
}

// =============================================================
// EMPTY CHART
// =============================================================

function EmptyChart() {
    return (
        <div className="flex h-[210px] flex-col items-center justify-center text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Activity
                    size={18}
                />
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-700">
                No data available
            </p>

            <p className="mt-1 text-xs text-slate-400">
                Inspection activity will
                appear here.
            </p>
        </div>
    );
}