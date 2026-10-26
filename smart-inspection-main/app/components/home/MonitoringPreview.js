import {
    Activity,
    CheckCircle2,
    Clock3,
    AlertTriangle,
    ArrowUpRight,
    MoreHorizontal,
    ClipboardCheck,
} from "lucide-react";

const inspections = [
    {
        asset: "Machine A-01",
        inspector: "Vivek Singh",
        time: "10:24 AM",
        status: "Passed",
        type: "success",
    },
    {
        asset: "Generator B-12",
        inspector: "Krishanth",
        time: "09:48 AM",
        status: "Warning",
        type: "warning",
    },
    {
        asset: "Panel C-07",
        inspector: "Vinish G.",
        time: "09:15 AM",
        status: "Failed",
        type: "danger",
    },
];

const stats = [
    {
        label: "Total inspections",
        value: "128",
        icon: ClipboardCheck,
    },
    {
        label: "Completed",
        value: "96",
        icon: CheckCircle2,
    },
    {
        label: "Pending",
        value: "21",
        icon: Clock3,
    },
    {
        label: "Attention",
        value: "11",
        icon: AlertTriangle,
    },
];

export default function MonitoringPreview() {
    return (
        <section
            id="monitoring"
            className="border-b border-slate-200 bg-white"
        >
            <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">

                {/* =====================================================
                    HEADER
                ===================================================== */}

                <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                    <div className="max-w-3xl">
                        <div className="mb-4 flex items-center gap-2">
                            <span className="h-px w-7 bg-blue-600" />

                            <span className="text-xs font-semibold tracking-[0.16em] text-blue-600">
                                REAL-TIME MONITORING
                            </span>
                        </div>

                        <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                            See every inspection{" "}
                            <span className="text-blue-600">
                                at a glance.
                            </span>
                        </h2>

                        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                            Keep track of inspection activity, completion,
                            pending work, and attention areas from one
                            organized dashboard.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        System operational
                    </div>
                </div>

                {/* =====================================================
                    DASHBOARD PREVIEW
                ===================================================== */}

                <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.22)]">

                    {/* Dashboard Header */}
                    <div className="flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                                Monitoring dashboard
                            </p>

                            <h3 className="mt-1 font-[family-name:var(--font-sora)] text-lg font-semibold tracking-tight text-slate-950">
                                Inspection overview
                            </h3>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500">
                                <Activity size={16} />
                            </span>

                            <span className="text-xs font-medium text-slate-500">
                                Live activity
                            </span>
                        </div>
                    </div>

                    <div className="p-4 sm:p-6">

                        {/* =================================================
                            STAT CARDS
                        ================================================= */}

                        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                            {stats.map((stat) => {
                                const Icon = stat.icon;

                                return (
                                    <div
                                        key={stat.label}
                                        className="rounded-xl border border-slate-200 bg-white p-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                                                <Icon
                                                    size={16}
                                                    strokeWidth={1.8}
                                                />
                                            </div>

                                            <ArrowUpRight
                                                size={14}
                                                className="text-slate-300"
                                            />
                                        </div>

                                        <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
                                            {stat.value}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            {stat.label}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* =================================================
                            LOWER DASHBOARD
                        ================================================= */}

                        <div className="mt-4 grid gap-4 lg:grid-cols-[1.45fr_0.75fr]">

                            {/* Recent Inspections */}
                            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-5">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">
                                            Recent inspections
                                        </p>

                                        <p className="mt-0.5 text-xs text-slate-400">
                                            Latest inspection activity
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
                                    >
                                        <MoreHorizontal size={17} />
                                    </button>
                                </div>

                                <div className="divide-y divide-slate-100">
                                    {inspections.map((inspection) => (
                                        <InspectionRow
                                            key={inspection.asset}
                                            inspection={inspection}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Status Overview */}
                            <div className="rounded-xl border border-slate-200 bg-white p-5">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                        Status overview
                                    </p>

                                    <p className="mt-0.5 text-xs text-slate-400">
                                        Current inspection distribution
                                    </p>
                                </div>

                                {/* Donut-style visual */}
                                <div className="mt-6 flex items-center justify-center">
                                    <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-[conic-gradient(#16a34a_0_75%,#f59e0b_75%_91%,#dc2626_91%_100%)]">
                                        <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white">
                                            <span className="text-2xl font-semibold tracking-tight text-slate-950">
                                                128
                                            </span>

                                            <span className="text-[10px] text-slate-400">
                                                inspections
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status labels */}
                                <div className="mt-6 space-y-3">
                                    <StatusLegend
                                        label="Passed"
                                        value="96"
                                        percentage="75%"
                                        color="bg-emerald-500"
                                    />

                                    <StatusLegend
                                        label="Warning"
                                        value="21"
                                        percentage="16%"
                                        color="bg-amber-500"
                                    />

                                    <StatusLegend
                                        label="Failed"
                                        value="11"
                                        percentage="9%"
                                        color="bg-red-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* =====================================================
                    BOTTOM NOTE
                ===================================================== */}

                <div className="mt-7 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-500">
                        Monitor inspection progress without switching between
                        multiple records.
                    </p>

                    <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                        View inspection history
                        <ArrowUpRight size={15} />
                    </div>
                </div>
            </div>
        </section>
    );
}

/* =====================================================
   INSPECTION ROW
===================================================== */

function InspectionRow({ inspection }) {
    const statusStyles = {
        success: {
            dot: "bg-emerald-500",
            badge: "bg-emerald-50 text-emerald-600",
        },
        warning: {
            dot: "bg-amber-500",
            badge: "bg-amber-50 text-amber-600",
        },
        danger: {
            dot: "bg-red-500",
            badge: "bg-red-50 text-red-600",
        },
    };

    const styles = statusStyles[inspection.type];

    return (
        <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
                <span
                    className={`h-2 w-2 shrink-0 rounded-full ${styles.dot}`}
                />

                <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                        {inspection.asset}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">
                        {inspection.inspector} · {inspection.time}
                    </p>
                </div>
            </div>

            <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${styles.badge}`}
            >
                {inspection.status}
            </span>
        </div>
    );
}

/* =====================================================
   STATUS LEGEND
===================================================== */

function StatusLegend({
    label,
    value,
    percentage,
    color,
}) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span
                    className={`h-2 w-2 rounded-full ${color}`}
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
                    {percentage}
                </span>
            </div>
        </div>
    );
}