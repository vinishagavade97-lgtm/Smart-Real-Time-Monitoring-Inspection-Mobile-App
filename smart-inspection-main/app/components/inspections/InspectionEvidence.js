"use client";

import {
    Camera,
    ExternalLink,
    Image as ImageIcon,
    Maximize2,
} from "lucide-react";

export default function InspectionEvidence({
    evidence = [],
}) {
    const hasEvidence = evidence.length > 0;

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/30">
            {/* =========================================
                HEADER
            ========================================== */}

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
                        <Camera
                            size={17}
                            strokeWidth={1.8}
                        />
                    </div>

                    <div>
                        <h2 className="font-[Sora] text-sm font-semibold tracking-[-0.02em] text-slate-900">
                            Evidence & photos
                        </h2>

                        <p className="mt-1 text-[11px] font-medium text-slate-400">
                            Visual evidence captured during the inspection.
                        </p>
                    </div>
                </div>

                {hasEvidence && (
                    <span className="hidden rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[9px] font-semibold text-slate-500 sm:inline-flex">
                        {evidence.length}{" "}
                        {evidence.length === 1
                            ? "photo"
                            : "photos"}
                    </span>
                )}
            </div>

            {/* =========================================
                EVIDENCE GRID
            ========================================== */}

            {hasEvidence ? (
                <div className="p-4 sm:p-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {evidence.map(
                            (item, index) => (
                                <article
                                    key={
                                        item?._id ||
                                        item?.publicId ||
                                        index
                                    }
                                    className="group overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                                >
                                    {/* Image */}

                                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                                        <img
                                            src={item?.url}
                                            alt={
                                                item?.caption ||
                                                `Inspection evidence ${index + 1
                                                }`
                                            }
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                                        />

                                        {/* Overlay */}

                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                                        {/* Open image */}

                                        {item?.url && (
                                            <a
                                                href={
                                                    item.url
                                                }
                                                target="_blank"
                                                rel="noreferrer"
                                                aria-label="Open evidence image"
                                                className="absolute right-3 top-3 flex h-8 w-8 translate-y-1 items-center justify-center rounded-lg border border-white/20 bg-slate-950/60 text-white opacity-0 backdrop-blur-md transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-slate-950/80"
                                            >
                                                <Maximize2
                                                    size={
                                                        14
                                                    }
                                                    strokeWidth={
                                                        1.8
                                                    }
                                                />
                                            </a>
                                        )}

                                        {/* Number */}

                                        <span className="absolute left-3 top-3 rounded-md border border-white/20 bg-slate-950/60 px-2 py-1 text-[9px] font-bold text-white backdrop-blur-md">
                                            {String(
                                                index + 1
                                            ).padStart(
                                                2,
                                                "0"
                                            )}
                                        </span>
                                    </div>

                                    {/* Caption */}

                                    <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3.5">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <ImageIcon
                                                size={14}
                                                strokeWidth={
                                                    1.7
                                                }
                                                className="shrink-0 text-slate-400"
                                            />

                                            <p className="truncate text-[11px] font-medium text-slate-600">
                                                {item?.caption ||
                                                    "Inspection evidence"}
                                            </p>
                                        </div>

                                        {item?.url && (
                                            <a
                                                href={
                                                    item.url
                                                }
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex shrink-0 items-center gap-1 text-[9px] font-semibold text-blue-600 transition-colors hover:text-blue-700"
                                            >
                                                Open
                                                <ExternalLink
                                                    size={
                                                        11
                                                    }
                                                    strokeWidth={
                                                        1.8
                                                    }
                                                />
                                            </a>
                                        )}
                                    </div>
                                </article>
                            )
                        )}
                    </div>
                </div>
            ) : (
                <div className="px-6 py-12 text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
                        <ImageIcon
                            size={19}
                            strokeWidth={1.7}
                        />
                    </div>

                    <h3 className="mt-3 text-xs font-semibold text-slate-800">
                        No evidence uploaded
                    </h3>

                    <p className="mx-auto mt-1 max-w-sm text-[10px] leading-5 text-slate-400">
                        No photos or visual evidence were attached to this inspection.
                    </p>
                </div>
            )}
        </section>
    );
}