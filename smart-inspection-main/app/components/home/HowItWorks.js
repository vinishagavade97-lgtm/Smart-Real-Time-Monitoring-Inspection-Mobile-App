import {
    ClipboardPlus,
    ListChecks,
    Camera,
    Zap,
    ArrowRight,
} from "lucide-react";

const steps = [
    {
        number: "01",
        icon: ClipboardPlus,
        title: "Create an inspection",
        description:
            "Add the asset, location, inspector, date, time, and inspection type to start a new inspection.",
    },
    {
        number: "02",
        icon: ListChecks,
        title: "Complete the checklist",
        description:
            "Review predefined checks and mark each item as Passed, Warning, or Failed with remarks when needed.",
    },
    {
        number: "03",
        icon: Camera,
        title: "Capture evidence",
        description:
            "Attach inspection photos and automatically record available location and timestamp information.",
    },
    {
        number: "04",
        icon: Zap,
        title: "Get a smart result",
        description:
            "The system evaluates the inspection and automatically determines whether it is Passed, Warning, or Failed.",
    },
];

export default function HowItWorks() {
    return (
        <section
            id="how-it-works"
            className="border-b border-slate-200 bg-slate-50"
        >
            <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">

                {/* =====================================================
                    SECTION HEADER
                ===================================================== */}

                <div className="max-w-3xl">
                    <div className="mb-4 flex items-center gap-2">
                        <span className="h-px w-7 bg-blue-600" />

                        <span className="text-xs font-semibold tracking-[0.16em] text-blue-600">
                            HOW IT WORKS
                        </span>
                    </div>

                    <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                        A simpler workflow for{" "}
                        <span className="text-blue-600">
                            every inspection.
                        </span>
                    </h2>

                    <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                        From creating an inspection to receiving an
                        automated result, every step stays organized in
                        one workflow.
                    </p>
                </div>

                {/* =====================================================
                    WORKFLOW
                ===================================================== */}

                <div className="relative mt-10 lg:mt-12">

                    {/* Desktop connecting line */}
                    <div className="absolute left-[12.5%] right-[12.5%] top-[28px] hidden h-px bg-slate-200 lg:block" />

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
                        {steps.map((step, index) => {
                            const Icon = step.icon;

                            return (
                                <div
                                    key={step.number}
                                    className="relative lg:px-5"
                                >
                                    {/* Step */}
                                    <div className="relative z-10 flex items-start gap-4 lg:block">

                                        {/* Icon */}
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-blue-600 shadow-sm lg:mx-auto">
                                            <Icon
                                                size={22}
                                                strokeWidth={1.8}
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className="pt-0.5 lg:pt-5 lg:text-center">
                                            <div className="mb-2 flex items-center gap-2 lg:justify-center">
                                                <span className="text-[11px] font-bold tracking-[0.14em] text-blue-600">
                                                    {step.number}
                                                </span>

                                                {index < steps.length - 1 && (
                                                    <ArrowRight
                                                        size={14}
                                                        className="text-slate-300 lg:hidden"
                                                    />
                                                )}
                                            </div>

                                            <h3 className="text-base font-semibold tracking-tight text-slate-950 sm:text-lg">
                                                {step.title}
                                            </h3>

                                            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 lg:mx-auto">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* =====================================================
                    BOTTOM FLOW
                ===================================================== */}

                <div className="mt-10 rounded-2xl border border-slate-200 bg-white px-5 py-5 sm:px-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-slate-900">
                                Inspection complete
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                Results, evidence, and status remain available
                                in the inspection history.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                <Zap
                                    size={16}
                                    strokeWidth={2}
                                />
                            </span>

                            Automated result
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}