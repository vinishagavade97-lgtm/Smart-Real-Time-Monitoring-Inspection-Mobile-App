"use client";

import {
    FileText,
    MessageSquareText,
} from "lucide-react";

export default function InspectionRemarks({
    remarks = "",
}) {
    const hasRemarks =
        typeof remarks === "string" &&
        remarks.trim().length > 0;

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/30">
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500">
                    <FileText
                        size={16}
                        strokeWidth={1.8}
                    />
                </div>

                <div>
                    <h2 className="font-[Sora] text-sm font-semibold tracking-[-0.02em] text-slate-900">
                        Inspection remarks
                    </h2>

                    <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                        Additional notes recorded for this inspection.
                    </p>
                </div>
            </div>

            {hasRemarks ? (
                <div className="px-5 py-4 sm:px-6">
                    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3.5">
                        <MessageSquareText
                            size={15}
                            strokeWidth={1.7}
                            className="mt-0.5 shrink-0 text-slate-400"
                        />

                        <p className="text-xs leading-5 text-slate-600">
                            {remarks}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="px-5 py-7 sm:px-6">
                    <p className="text-xs font-medium text-slate-400">
                        No additional remarks were recorded.
                    </p>
                </div>
            )}
        </section>
    );
}