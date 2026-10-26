"use client";

import {
    ClipboardList,
    CheckCircle2,
    Clock3,
    AlertTriangle,
} from "lucide-react";

const iconMap = {
    total: ClipboardList,
    completed: CheckCircle2,
    pending: Clock3,
    attention: AlertTriangle,
};

const styleMap = {
    total: {
        icon: "bg-blue-50 text-blue-600",
        accent: "bg-blue-600",
    },
    completed: {
        icon: "bg-emerald-50 text-emerald-600",
        accent: "bg-emerald-500",
    },
    pending: {
        icon: "bg-amber-50 text-amber-600",
        accent: "bg-amber-500",
    },
    attention: {
        icon: "bg-red-50 text-red-600",
        accent: "bg-red-500",
    },
};

export default function StatCard({
    type,
    label,
    value = 0,
    description,
}) {
    const Icon = iconMap[type] || ClipboardList;
    const styles = styleMap[type] || styleMap.total;

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md hover:shadow-slate-200/50">
            {/* Top accent */}
            <div
                className={`absolute inset-x-0 top-0 h-[2px] ${styles.accent} opacity-0 transition-opacity duration-200 group-hover:opacity-100`}
            />

            <div className="flex items-start justify-between">
                {/* Icon */}
                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles.icon}`}
                >
                    <Icon
                        size={19}
                        strokeWidth={1.9}
                    />
                </div>

                {/* Small indicator */}
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-200 transition-colors group-hover:bg-slate-300" />
            </div>

            <div className="mt-5">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
                    {label}
                </p>

                <p className="mt-1 font-[Sora] text-2xl font-semibold tracking-[-0.035em] text-slate-950">
                    {value}
                </p>

                <p className="mt-1.5 text-xs text-slate-400">
                    {description}
                </p>
            </div>
        </div>
    );
}