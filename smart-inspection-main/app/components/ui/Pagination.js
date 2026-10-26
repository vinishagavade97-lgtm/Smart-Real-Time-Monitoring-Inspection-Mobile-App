"use client";

import {
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

export default function Pagination({
    page = 1,
    totalPages = 1,
    onPageChange,
}) {
    if (totalPages <= 1) {
        return null;
    }

    const pages = [];

    if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
    } else {
        pages.push(1);

        if (page > 3) {
            pages.push("ellipsis-start");
        }

        const start = Math.max(2, page - 1);
        const end = Math.min(
            totalPages - 1,
            page + 1
        );

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (page < totalPages - 2) {
            pages.push("ellipsis-end");
        }

        pages.push(totalPages);
    }

    return (
        <nav
            aria-label="Pagination"
            className="flex items-center gap-1"
        >
            {/* Previous */}
            <button
                type="button"
                disabled={page <= 1}
                onClick={() =>
                    onPageChange(page - 1)
                }
                className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 disabled:pointer-events-none disabled:opacity-40"
            >
                <ChevronLeft
                    size={13}
                    strokeWidth={1.8}
                />

                <span className="hidden sm:inline">
                    Previous
                </span>
            </button>

            {/* Pages */}
            <div className="flex items-center gap-0.5">
                {pages.map((item, index) => {
                    if (
                        typeof item === "string"
                    ) {
                        return (
                            <span
                                key={item}
                                className="flex h-8 w-6 items-center justify-center text-[11px] text-slate-400"
                            >
                                ···
                            </span>
                        );
                    }

                    const isActive =
                        item === page;

                    return (
                        <button
                            key={`${item}-${index}`}
                            type="button"
                            onClick={() =>
                                onPageChange(item)
                            }
                            aria-current={
                                isActive
                                    ? "page"
                                    : undefined
                            }
                            className={`
                                flex h-8 w-8 items-center justify-center
                                rounded-md
                                text-[11px] font-semibold
                                transition-all duration-150
                                ${isActive
                                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                                }
                            `}
                        >
                            {item}
                        </button>
                    );
                })}
            </div>

            {/* Next */}
            <button
                type="button"
                disabled={
                    page >= totalPages
                }
                onClick={() =>
                    onPageChange(page + 1)
                }
                className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 disabled:pointer-events-none disabled:opacity-40"
            >
                <span className="hidden sm:inline">
                    Next
                </span>

                <ChevronRight
                    size={13}
                    strokeWidth={1.8}
                />
            </button>
        </nav>
    );
}