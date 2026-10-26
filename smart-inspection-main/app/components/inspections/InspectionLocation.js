"use client";

import {
    ExternalLink,
    MapPin,
    Navigation,
} from "lucide-react";

function formatCoordinate(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return null;
    }

    return number.toFixed(4);
}

export default function InspectionLocation({
    location,
}) {
    const latitude = formatCoordinate(
        location?.latitude
    );

    const longitude = formatCoordinate(
        location?.longitude
    );

    const hasLocation =
        latitude !== null &&
        longitude !== null;

    const mapsUrl = hasLocation
        ? `https://www.google.com/maps?q=${latitude},${longitude}`
        : null;

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/30">
            {/* =================================================
                HEADER
            ================================================== */}

            <div className="border-b border-slate-100 px-5 py-4.5 sm:px-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
                        <MapPin
                            size={16}
                            strokeWidth={1.8}
                        />
                    </div>

                    <div>
                        <h2 className="font-[Sora] text-sm font-semibold tracking-[-0.02em] text-slate-900">
                            Inspection location
                        </h2>

                        <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                            GPS position captured during inspection
                        </p>
                    </div>
                </div>
            </div>

            {/* =================================================
                LOCATION CONTENT
            ================================================== */}

            {hasLocation ? (
                <div className="p-5 sm:p-6">
                    {/* Coordinates */}

                    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2.5">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm ring-1 ring-slate-200">
                                    <Navigation
                                        size={14}
                                        strokeWidth={1.8}
                                    />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                                        GPS coordinates
                                    </p>

                                    <p className="mt-1 text-xs font-bold tracking-[-0.01em] text-slate-800">
                                        {latitude},{" "}
                                        {longitude}
                                    </p>
                                </div>
                            </div>

                            <span className="hidden shrink-0 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 text-[9px] font-semibold text-emerald-700 sm:inline-flex">
                                Captured
                            </span>
                        </div>
                    </div>

                    {/* Map action */}

                    {mapsUrl && (
                        <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 flex h-10 items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 transition-all duration-200 hover:border-blue-200 hover:bg-blue-50/40 hover:text-blue-700 active:scale-[0.99]"
                        >
                            <span className="flex items-center gap-2">
                                <MapPin
                                    size={14}
                                    strokeWidth={1.8}
                                />

                                View location on map
                            </span>

                            <ExternalLink
                                size={14}
                                strokeWidth={1.8}
                            />
                        </a>
                    )}

                    {/* Coordinates metadata */}

                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div>
                            <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                Latitude
                            </p>

                            <p className="mt-1 text-[10px] font-semibold text-slate-700">
                                {latitude}
                            </p>
                        </div>

                        <div>
                            <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                Longitude
                            </p>

                            <p className="mt-1 text-[10px] font-semibold text-slate-700">
                                {longitude}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="px-6 py-12 text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
                        <MapPin
                            size={19}
                            strokeWidth={1.7}
                        />
                    </div>

                    <h3 className="mt-3 text-xs font-semibold text-slate-800">
                        Location unavailable
                    </h3>

                    <p className="mx-auto mt-1 max-w-sm text-[10px] leading-5 text-slate-400">
                        GPS coordinates were not recorded for this inspection.
                    </p>
                </div>
            )}
        </section>
    );
}