import {
    ClipboardCheck,
    Activity,
    Camera,
    Zap,
} from "lucide-react";

const highlights = [
    {
        icon: ClipboardCheck,
        title: "Digital Inspections",
        description: "Replace manual inspection workflows.",
    },
    {
        icon: Activity,
        title: "Real-Time Monitoring",
        description: "Keep track of inspection activity and status.",
    },
    {
        icon: Camera,
        title: "Evidence Collection",
        description: "Capture photos and inspection evidence.",
    },
    {
        icon: Zap,
        title: "Smart Automation",
        description: "Automatically determine inspection status.",
    },
];

export default function TrustBar() {
    return (
        <section className="border-y border-slate-200 bg-white">
            <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">

                <div className="grid grid-cols-2 divide-x divide-y divide-slate-200 lg:grid-cols-4 lg:divide-y-0">

                    {highlights.map((item) => {
                        const Icon = item.icon;

                        return (
                            <div
                                key={item.title}
                                className="group px-4 py-7 sm:px-6 sm:py-8 lg:px-7"
                            >
                                <div className="flex items-start gap-3.5">

                                    {/* Icon */}
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition-colors duration-200 group-hover:border-blue-100 group-hover:bg-blue-50 group-hover:text-blue-600">
                                        <Icon
                                            size={17}
                                            strokeWidth={1.8}
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="min-w-0">

                                        <h3 className="text-sm font-semibold text-slate-900">
                                            {item.title}
                                        </h3>

                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            {item.description}
                                        </p>

                                    </div>

                                </div>
                            </div>
                        );
                    })}

                </div>

            </div>
        </section>
    );
}