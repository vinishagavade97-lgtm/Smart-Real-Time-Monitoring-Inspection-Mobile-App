import {
    ClipboardCheck,
    ListChecks,
    Camera,
    MapPin,
    Zap,
    History,
    ArrowUpRight,
} from "lucide-react";

const features = [
    {
        icon: ClipboardCheck,
        title: "Digital Inspections",
        description:
            "Create and manage inspections digitally with asset details, location, inspector, date, and inspection type.",
        featured: true,
    },
    {
        icon: ListChecks,
        title: "Smart Checklists",
        description:
            "Use predefined checks with Pass, Warning, or Failed results and add remarks when needed.",
    },
    {
        icon: Camera,
        title: "Photo & Evidence",
        description:
            "Capture or upload inspection photos and keep visual evidence connected to the inspection.",
    },
    {
        icon: MapPin,
        title: "GPS & Timestamp",
        description:
            "Record inspection location and time automatically whenever location access is available.",
    },
    {
        icon: Zap,
        title: "Smart Automation",
        description:
            "Automatically calculate the overall inspection status based on checklist results.",
    },
    {
        icon: History,
        title: "Inspection History",
        description:
            "Search previous inspections, filter by status or date, and quickly review inspection details.",
    },
];

export default function Features() {
    return (
        <section
            id="features"
            className="border-b border-slate-200 bg-white"
        >
            <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">

                {/* =====================================================
                    SECTION HEADER
                ===================================================== */}

                <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                    <div className="max-w-3xl">
                        <div className="mb-4 flex items-center gap-2">
                            <span className="h-px w-7 bg-blue-600" />

                            <span className="text-xs font-semibold tracking-[0.16em] text-blue-600">
                                PLATFORM FEATURES
                            </span>
                        </div>

                        <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                            Everything you need for{" "}
                            <span className="text-blue-600">
                                smarter inspections.
                            </span>
                        </h2>
                    </div>

                    <p className="max-w-md text-base leading-7 text-slate-600">
                        A focused inspection platform designed to make
                        recording, monitoring, and reviewing inspections
                        simpler.
                    </p>
                </div>

                {/* =====================================================
                    FEATURE GRID
                ===================================================== */}

                <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                    {features.map((feature) => {
                        const Icon = feature.icon;

                        return (
                            <article
                                key={feature.title}
                                className={`group relative overflow-hidden rounded-2xl border transition-all duration-200 ${feature.featured
                                    ? "border-blue-100 bg-blue-50/50"
                                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                                    }`}
                            >
                                {/* Top content */}
                                <div className="p-6 sm:p-7">

                                    {/* Icon + arrow */}
                                    <div className="flex items-start justify-between">
                                        <div
                                            className={`flex h-11 w-11 items-center justify-center rounded-xl border ${feature.featured
                                                ? "border-blue-100 bg-white text-blue-600"
                                                : "border-slate-200 bg-slate-50 text-slate-600 group-hover:border-blue-100 group-hover:bg-blue-50 group-hover:text-blue-600"
                                                } transition-colors duration-200`}
                                        >
                                            <Icon
                                                size={20}
                                                strokeWidth={1.8}
                                            />
                                        </div>

                                        <ArrowUpRight
                                            size={18}
                                            className={`text-slate-300 transition-all duration-200 ${feature.featured
                                                ? "text-blue-300"
                                                : "group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-500"
                                                }`}
                                        />
                                    </div>

                                    {/* Text */}
                                    <div className="mt-7">
                                        <h3 className="text-lg font-semibold tracking-tight text-slate-950">
                                            {feature.title}
                                        </h3>

                                        <p className="mt-2.5 text-sm leading-6 text-slate-500">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Bottom accent */}
                                <div
                                    className={`h-1 w-full ${feature.featured
                                        ? "bg-blue-600"
                                        : "bg-transparent transition-colors duration-200 group-hover:bg-blue-100"
                                        }`}
                                />
                            </article>
                        );
                    })}
                </div>

                {/* =====================================================
                    BOTTOM NOTE
                ===================================================== */}

                <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-500">
                        Built around a simple inspection workflow.
                    </p>

                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Simple. Structured. Automated.
                    </div>
                </div>
            </div>
        </section>
    );
}