"use client";

import {
    ClipboardCheck,
    ArrowUpRight,
} from "lucide-react";

export default function DashboardWelcome({
    total = 0,
}) {
    return (
        <section className="mb-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                {/* Left */}
                <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-blue-600" />

                        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-700">
                            Inspector workspace
                        </span>
                    </div>

                    <h2 className="font-[Sora] text-2xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-3xl">
                        Good to see you.
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                        Monitor your inspection activity,
                        review recent findings, and keep
                        your inspection records up to date.
                    </p>
                </div>

                {/* Total summary */}
                <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-200/40">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <ClipboardCheck
                            size={17}
                            strokeWidth={1.9}
                        />
                    </div>

                    <div>
                        <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400">
                            Total inspections
                        </p>

                        <div className="mt-0.5 flex items-center gap-1.5">
                            <span className="font-[Sora] text-sm font-semibold text-slate-900">
                                {total}
                            </span>

                            <ArrowUpRight
                                size={13}
                                className="text-slate-400"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}