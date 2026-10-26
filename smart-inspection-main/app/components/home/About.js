import {
    ClipboardCheck,
    Database,
    Zap,
    Activity,
    ArrowRight,
    CheckCircle2,
} from "lucide-react";

const improvements = [
    {
        icon: ClipboardCheck,
        title: "Manual records",
        solution: "Digital inspections",
        description:
            "Replace paper-based and scattered inspection processes.",
    },
    {
        icon: Database,
        title: "Scattered evidence",
        solution: "Centralized records",
        description:
            "Keep inspection results, remarks, and photos together.",
    },
    {
        icon: Zap,
        title: "Manual status updates",
        solution: "Automated results",
        description:
            "Let inspection results determine the overall status automatically.",
    },
    {
        icon: Activity,
        title: "Delayed visibility",
        solution: "Real-time monitoring",
        description:
            "Track inspection activity and identify attention areas faster.",
    },
];

export default function About() {
    return (
        <section
            id="about"
            className="border-b border-slate-200 bg-slate-50"
        >
            <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">

                {/* =====================================================
                    SECTION HEADER
                ===================================================== */}

                <div className="max-w-3xl">
                    <div className="mb-4 flex items-center gap-2">
                        <span className="h-px w-7 bg-blue-600" />

                        <span className="text-xs font-semibold tracking-[0.16em] text-blue-600">
                            ABOUT SMART INSPECTION
                        </span>
                    </div>

                    <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                        From manual inspection to{" "}
                        <span className="text-blue-600">
                            smarter operations.
                        </span>
                    </h2>

                    <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                        Smart Inspection brings inspection workflows,
                        evidence, location data, and automated status
                        tracking into one organized platform.
                    </p>
                </div>

                {/* =====================================================
                    MAIN CONTENT
                ===================================================== */}

                <div className="mt-9 grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-12">

                    {/* =================================================
                        LEFT — INTRODUCTION
                    ================================================= */}

                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                            Why Smart Inspection?
                        </p>

                        <h3 className="mt-2.5 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                            A clearer way to manage every inspection.
                        </h3>

                        <p className="mt-4 text-base leading-7 text-slate-600">
                            Traditional inspection workflows can involve
                            paper records, separate photographs, manual
                            status updates, and delayed reporting.
                            Smart Inspection brings these steps together
                            into one streamlined workflow.
                        </p>

                        <p className="mt-3 text-base leading-7 text-slate-600">
                            Inspectors can record findings, capture
                            evidence, verify location and time, and
                            submit results while the system automatically
                            determines the inspection status.
                        </p>

                        {/* Bottom highlight */}
                        <div className="mt-6 flex items-start gap-3 border-t border-slate-200 pt-5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                <CheckCircle2
                                    size={18}
                                    strokeWidth={2}
                                />
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-slate-900">
                                    Built for efficient inspection workflows
                                </p>

                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                    Simple enough for everyday use,
                                    structured enough for reliable
                                    inspection records.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* =================================================
                        RIGHT — IMPROVEMENT CARDS
                    ================================================= */}

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                        {/* Card Header */}
                        <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
                            <p className="text-sm font-semibold text-slate-900">
                                Improving the inspection workflow
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                Turning common inspection challenges into
                                a structured digital process.
                            </p>
                        </div>

                        {/* Improvements */}
                        <div className="divide-y divide-slate-200">
                            {improvements.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <div
                                        key={item.title}
                                        className="group px-5 py-4 transition-colors duration-200 hover:bg-slate-50 sm:px-6"
                                    >
                                        <div className="flex gap-4">

                                            {/* Icon */}
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition-colors duration-200 group-hover:border-blue-100 group-hover:bg-blue-50 group-hover:text-blue-600">
                                                <Icon
                                                    size={18}
                                                    strokeWidth={1.8}
                                                />
                                            </div>

                                            {/* Content */}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-sm font-medium text-slate-500">
                                                        {item.title}
                                                    </span>

                                                    <ArrowRight
                                                        size={14}
                                                        className="text-slate-400"
                                                    />

                                                    <span className="text-sm font-semibold text-slate-900">
                                                        {item.solution}
                                                    </span>
                                                </div>

                                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}