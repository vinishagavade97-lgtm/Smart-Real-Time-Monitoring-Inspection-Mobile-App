"use client";

import StatCard from "./StatCard";

export default function StatsGrid({
    stats,
    loading,
}) {
    if (loading) {
        return (
            <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                    <div
                        key={item}
                        className="h-[174px] animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
                    >
                        <div className="h-10 w-10 rounded-xl bg-slate-100" />

                        <div className="mt-5 h-3 w-24 rounded bg-slate-100" />

                        <div className="mt-2 h-8 w-16 rounded bg-slate-100" />

                        <div className="mt-2 h-3 w-32 rounded bg-slate-100" />
                    </div>
                ))}
            </section>
        );
    }

    const total = stats?.total || 0;
    const completed = stats?.completed || 0;
    const pending = stats?.pending || 0;

    const attention =
        (stats?.warning || 0) +
        (stats?.failed || 0);

    return (
        <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
                type="total"
                label="Total inspections"
                value={total}
                description="All inspections created"
            />

            <StatCard
                type="completed"
                label="Completed"
                value={completed}
                description="Successfully submitted"
            />

            <StatCard
                type="pending"
                label="Pending"
                value={pending}
                description="Draft inspections"
            />

            <StatCard
                type="attention"
                label="Attention"
                value={attention}
                description={`${stats?.failed || 0} failed · ${stats?.warning || 0} warnings`}
            />
        </section>
    );
}