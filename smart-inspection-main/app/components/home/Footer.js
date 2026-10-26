import {
    ClipboardCheck,
    ArrowUpRight,
    Mail,
    Phone,
    MapPin,
    ShieldCheck,
    CircleCheck,
    ArrowRight,
    Globe,
    ExternalLink,
} from "lucide-react";

const productLinks = [
    {
        label: "Features",
        href: "#features",
    },
    {
        label: "How It Works",
        href: "#how-it-works",
    },
    {
        label: "Monitoring",
        href: "#monitoring",
    },
    {
        label: "About",
        href: "#about",
    },
];

const platformLinks = [
    {
        label: "Dashboard",
        href: "#dashboard",
    },
    {
        label: "Inspections",
        href: "#inspections",
    },
    {
        label: "Inspection History",
        href: "#history",
    },
    {
        label: "Smart Automation",
        href: "#automation",
    },
];

export default function Footer() {
    return (
        <footer className="relative overflow-hidden bg-slate-950 text-white">
            {/* Decorative Background */}
            <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />

            <div className="pointer-events-none absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">

                {/* =====================================================
            CTA SECTION
        ===================================================== */}
                <div className="border-b border-white/10 py-16 sm:py-20">
                    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-10 sm:px-10 lg:px-14 lg:py-12">

                        {/* CTA Glow */}
                        <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-blue-600/20 blur-3xl" />

                        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

                            <div className="max-w-2xl">

                                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-300">
                                    <CircleCheck size={14} />
                                    Smart Automation
                                </div>

                                <h2 className="font-[family-name:var(--font-sora)] text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                    Make every inspection
                                    <span className="block text-blue-400">
                                        smarter.
                                    </span>
                                </h2>

                                <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                                    Bring inspections, monitoring and automated results
                                    together in one simple platform.
                                </p>

                            </div>

                            <a
                                href="#get-started"
                                className="group inline-flex w-fit shrink-0 items-center gap-3 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-600/30"
                            >
                                Get Started

                                <ArrowRight
                                    size={17}
                                    className="transition-transform duration-300 group-hover:translate-x-1"
                                />
                            </a>

                        </div>
                    </div>
                </div>

                {/* =====================================================
            MAIN FOOTER
        ===================================================== */}
                <div className="py-14 sm:py-16">

                    <div className="grid gap-12 lg:grid-cols-[1.7fr_1fr_1fr_1.2fr]">

                        {/* =================================================
                BRAND
            ================================================= */}
                        <div className="max-w-sm">

                            <a
                                href="#home"
                                className="group inline-flex items-center gap-3"
                            >

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 transition-all duration-300 group-hover:bg-blue-500 group-hover:shadow-blue-600/30">
                                    <ClipboardCheck
                                        size={22}
                                        strokeWidth={2.2}
                                    />
                                </div>

                                <div>
                                    <p className="font-[family-name:var(--font-sora)] text-base font-bold tracking-tight">
                                        Smart Inspection
                                    </p>

                                    <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
                                        Smart Automation
                                    </p>
                                </div>

                            </a>

                            <p className="mt-6 text-sm leading-6 text-slate-400">
                                A smarter way to manage inspections, monitor
                                activities and automate inspection results from
                                one centralized platform.
                            </p>

                            {/* Platform Status */}
                            <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-emerald-400/10 bg-emerald-400/5 px-3 py-2">

                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />

                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                                </span>

                                <span className="text-xs font-medium text-emerald-300">
                                    Platform ready
                                </span>

                            </div>

                            {/* Useful Links / Social Area */}
                            <div className="mt-7 flex items-center gap-2">

                                <a
                                    href="#"
                                    aria-label="Website"
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 transition-all duration-200 hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-blue-400"
                                >
                                    <Globe size={17} />
                                </a>

                                <a
                                    href="#features"
                                    aria-label="Explore Features"
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 transition-all duration-200 hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-blue-400"
                                >
                                    <ExternalLink size={17} />
                                </a>

                                <a
                                    href="mailto:omshinde0412@gmail.com"
                                    aria-label="Email"
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 transition-all duration-200 hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-blue-400"
                                >
                                    <Mail size={17} />
                                </a>

                            </div>

                        </div>

                        {/* =================================================
                PRODUCT
            ================================================= */}
                        <div>

                            <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                Product
                            </h3>

                            <ul className="space-y-3">

                                {productLinks.map((link) => (
                                    <li key={link.label}>

                                        <a
                                            href={link.href}
                                            className="group inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors duration-200 hover:text-white"
                                        >
                                            {link.label}

                                            <ArrowUpRight
                                                size={13}
                                                className="opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                                            />
                                        </a>

                                    </li>
                                ))}

                            </ul>

                        </div>

                        {/* =================================================
                PLATFORM
            ================================================= */}
                        <div>

                            <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                Platform
                            </h3>

                            <ul className="space-y-3">

                                {platformLinks.map((link) => (
                                    <li key={link.label}>

                                        <a
                                            href={link.href}
                                            className="group inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors duration-200 hover:text-white"
                                        >
                                            {link.label}

                                            <ArrowUpRight
                                                size={13}
                                                className="opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                                            />
                                        </a>

                                    </li>
                                ))}

                            </ul>

                        </div>

                        {/* =================================================
                CONTACT
            ================================================= */}
                        <div>

                            <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                Contact
                            </h3>

                            <div className="space-y-4">

                                {/* Email */}
                                <a
                                    href="mailto:omshinde0412@gmail.com"
                                    className="group flex items-start gap-3"
                                >

                                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-slate-400 transition group-hover:bg-blue-500/10 group-hover:text-blue-400">
                                        <Mail size={16} />
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Email
                                        </p>

                                        <p className="mt-1 text-sm text-slate-300 transition group-hover:text-white">
                                            omshinde0412@gmail.com
                                        </p>
                                    </div>

                                </a>

                                {/* Phone */}
                                <a
                                    href="tel:+919373545169"
                                    className="group flex items-start gap-3"
                                >

                                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-slate-400 transition group-hover:bg-blue-500/10 group-hover:text-blue-400">
                                        <Phone size={16} />
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Phone
                                        </p>

                                        <p className="mt-1 text-sm text-slate-300 transition group-hover:text-white">
                                            +91 93735 45169
                                        </p>
                                    </div>

                                </a>

                                {/* Location */}
                                <div className="flex items-start gap-3">

                                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-slate-400">
                                        <MapPin size={16} />
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Location
                                        </p>

                                        <p className="mt-1 text-sm text-slate-300">
                                            Maharashtra, India
                                        </p>
                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

                {/* =====================================================
            BOTTOM BAR
        ===================================================== */}
                <div className="border-t border-white/10 py-6">

                    <div className="flex flex-col gap-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">

                        <p>
                            © 2026 Smart Inspection. All rights reserved.
                        </p>

                        <div className="flex flex-wrap items-center gap-5">

                            <a
                                href="#privacy"
                                className="transition hover:text-slate-300"
                            >
                                Privacy
                            </a>

                            <a
                                href="#terms"
                                className="transition hover:text-slate-300"
                            >
                                Terms
                            </a>

                            <div className="flex items-center gap-1.5 text-slate-400">
                                <ShieldCheck size={14} />
                                <span>Secure platform</span>
                            </div>

                        </div>

                    </div>

                </div>

            </div>
        </footer>
    );
}