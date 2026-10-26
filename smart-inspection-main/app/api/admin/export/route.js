import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import * as XLSX from "xlsx";

import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";

import User from "@/models/User";
import Inspection from "@/models/Inspection";

/* ================================================================
   GET — EXPORT ALL INSPECTIONS TO EXCEL

   ADMIN ONLY

   Security:
   - Requires authentication
   - Requires admin role
   - Verifies active admin account
   - Exports ALL inspections across all inspectors
   - Supports same filters as inspection list
================================================================ */

export async function GET(request) {
    try {
        console.log("📊 [ADMIN EXPORT] Request received");

        // --------------------------------------------------------
        // 1. Get authentication token
        // --------------------------------------------------------

        const cookieStore = await cookies();

        const token = cookieStore.get(
            "smart_inspection_token"
        )?.value;

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Authentication required",
                },
                {
                    status: 401,
                }
            );
        }

        // --------------------------------------------------------
        // 2. Verify JWT
        // --------------------------------------------------------

        const decoded = verifyToken(token);

        if (!decoded) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid or expired authentication token",
                },
                {
                    status: 401,
                }
            );
        }

        // --------------------------------------------------------
        // 3. Admin only
        // --------------------------------------------------------

        if (decoded.role !== "admin") {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Only admins can export all inspections",
                },
                {
                    status: 403,
                }
            );
        }

        // --------------------------------------------------------
        // 4. Connect database
        // --------------------------------------------------------

        await connectDB();

        // --------------------------------------------------------
        // 5. Look up admin user for summary sheet
        // --------------------------------------------------------

        let user = null;

        if (
            decoded.userId &&
            mongoose.Types.ObjectId.isValid(decoded.userId)
        ) {
            user = await User.findById(
                decoded.userId
            ).select("_id name email role isActive");
        }

        // --------------------------------------------------------
        // 7. Read filters
        // --------------------------------------------------------

        const { searchParams } =
            new URL(request.url);

        const search = searchParams
            .get("search")
            ?.trim();

        const status = searchParams.get("status");
        const result = searchParams.get("result");
        const from = searchParams.get("from");
        const to = searchParams.get("to");

        // --------------------------------------------------------
        // 8. Build query (no ownership filter — admin sees all)
        // --------------------------------------------------------

        const query = {};

        // --------------------------------------------------------
        // 9. Status filter
        // --------------------------------------------------------

        if (status) {
            const allowedStatuses = [
                "draft",
                "submitted",
            ];

            if (!allowedStatuses.includes(status)) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Invalid status filter",
                    },
                    {
                        status: 400,
                    }
                );
            }

            query.status = status;
        }

        // --------------------------------------------------------
        // 10. Result filter
        // --------------------------------------------------------

        if (result) {
            const allowedResults = [
                "pending",
                "passed",
                "warning",
                "failed",
            ];

            if (!allowedResults.includes(result)) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Invalid result filter",
                    },
                    {
                        status: 400,
                    }
                );
            }

            query.result = result;
        }

        // --------------------------------------------------------
        // 11. Search filter
        // --------------------------------------------------------

        if (search) {
            if (search.length > 100) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Search query is too long",
                    },
                    {
                        status: 400,
                    }
                );
            }

            const escapedSearch =
                search.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&"
                );

            query.assetName = {
                $regex: escapedSearch,
                $options: "i",
            };
        }

        // --------------------------------------------------------
        // 12. Date filter
        // --------------------------------------------------------

        if (from || to) {
            query.inspectedAt = {};

            if (from) {
                const fromDate = new Date(
                    `${from}T00:00:00.000Z`
                );

                if (
                    Number.isNaN(
                        fromDate.getTime()
                    )
                ) {
                    return NextResponse.json(
                        {
                            success: false,
                            message: "Invalid from date",
                        },
                        {
                            status: 400,
                        }
                    );
                }

                query.inspectedAt.$gte =
                    fromDate;
            }

            if (to) {
                const toDate = new Date(
                    `${to}T23:59:59.999Z`
                );

                if (
                    Number.isNaN(
                        toDate.getTime()
                    )
                ) {
                    return NextResponse.json(
                        {
                            success: false,
                            message: "Invalid to date",
                        },
                        {
                            status: 400,
                        }
                    );
                }

                query.inspectedAt.$lte =
                    toDate;
            }

            if (
                query.inspectedAt.$gte &&
                query.inspectedAt.$lte &&
                query.inspectedAt.$gte >
                query.inspectedAt.$lte
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "From date cannot be after to date",
                    },
                    {
                        status: 400,
                    }
                );
            }
        }

        // --------------------------------------------------------
        // 13. Get all inspections
        // --------------------------------------------------------

        const inspections =
            await Inspection.find(query)
                .populate(
                    "inspector",
                    "name email role"
                )
                .sort({
                    inspectedAt: -1,
                    createdAt: -1,
                })
                .lean();

        // --------------------------------------------------------
        // 14. Convert inspection data to Excel rows
        // --------------------------------------------------------

        const rows = inspections.map(
            (inspection, index) => {
                const checklist =
                    Array.isArray(
                        inspection.checklist
                    )
                        ? inspection.checklist
                        : [];

                const passedCount =
                    checklist.filter(
                        (item) =>
                            item.status === "pass"
                    ).length;

                const warningCount =
                    checklist.filter(
                        (item) =>
                            item.status === "warning"
                    ).length;

                const failedCount =
                    checklist.filter(
                        (item) =>
                            item.status === "failed"
                    ).length;

                const evidenceCount =
                    Array.isArray(
                        inspection.evidence
                    )
                        ? inspection.evidence.length
                        : 0;

                const checklistDetails =
                    checklist
                        .map((item) => {
                            const itemName =
                                item.item ||
                                item.name ||
                                "Checklist Item";

                            const itemStatus =
                                item.status || "pending";

                            const remarks =
                                item.remarks || "";

                            return `${itemName}: ${itemStatus}${remarks
                                ? ` (${remarks})`
                                : ""
                                }`;
                        })
                        .join(" | ");

                return {
                    "Sr. No.": index + 1,

                    "Inspection ID":
                        inspection._id?.toString() ||
                        "",

                    "Asset Name":
                        inspection.assetName || "",

                    "Location Latitude":
                        inspection.location
                            ?.latitude ?? "",

                    "Location Longitude":
                        inspection.location
                            ?.longitude ?? "",

                    "Inspection Type":
                        inspection.inspectionType ||
                        "",

                    Inspector:
                        inspection.inspector?.name ||
                        "",

                    "Inspector Email":
                        inspection.inspector?.email ||
                        "",

                    "Inspection Date":
                        inspection.inspectedAt
                            ? new Date(
                                inspection.inspectedAt
                            ).toLocaleString(
                                "en-IN"
                            )
                            : "",

                    "Submitted Date":
                        inspection.submittedAt
                            ? new Date(
                                inspection.submittedAt
                            ).toLocaleString(
                                "en-IN"
                            )
                            : "",

                    Status:
                        inspection.status || "",

                    "Overall Result":
                        inspection.result || "",

                    "Checklist Total":
                        checklist.length,

                    "Checklist Passed":
                        passedCount,

                    "Checklist Warning":
                        warningCount,

                    "Checklist Failed":
                        failedCount,

                    "Evidence Count":
                        evidenceCount,

                    "Remarks":
                        inspection.remarks || "",

                    "Checklist Details":
                        checklistDetails,

                    "Created At":
                        inspection.createdAt
                            ? new Date(
                                inspection.createdAt
                            ).toLocaleString(
                                "en-IN"
                            )
                            : "",
                };
            }
        );

        // --------------------------------------------------------
        // 15. Create worksheet
        // --------------------------------------------------------

        const worksheet =
            XLSX.utils.json_to_sheet(rows);

        // --------------------------------------------------------
        // 16. Set useful column widths
        // --------------------------------------------------------

        worksheet["!cols"] = [
            { wch: 8 },
            { wch: 26 },
            { wch: 24 },
            { wch: 18 },
            { wch: 18 },
            { wch: 22 },
            { wch: 22 },
            { wch: 32 },
            { wch: 22 },
            { wch: 22 },
            { wch: 14 },
            { wch: 18 },
            { wch: 16 },
            { wch: 18 },
            { wch: 18 },
            { wch: 18 },
            { wch: 16 },
            { wch: 30 },
            { wch: 60 },
            { wch: 22 },
        ];

        // --------------------------------------------------------
        // 17. Create workbook
        // --------------------------------------------------------

        const workbook =
            XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "All Inspections"
        );

        // --------------------------------------------------------
        // 18. Add summary sheet
        // --------------------------------------------------------

        const summaryRows = [
            {
                Field: "Exported By",
                Value: user?.name || "Admin",
            },
            {
                Field: "Email",
                Value: user?.email || "",
            },
            {
                Field: "Role",
                Value: "Admin",
            },
            {
                Field: "Exported At",
                Value: new Date().toLocaleString(
                    "en-IN"
                ),
            },
            {
                Field: "Total Inspections",
                Value: inspections.length,
            },
            {
                Field: "Passed",
                Value: inspections.filter(
                    (item) =>
                        item.result === "passed"
                ).length,
            },
            {
                Field: "Warning",
                Value: inspections.filter(
                    (item) =>
                        item.result === "warning"
                ).length,
            },
            {
                Field: "Failed",
                Value: inspections.filter(
                    (item) =>
                        item.result === "failed"
                ).length,
            },
            {
                Field: "Pending",
                Value: inspections.filter(
                    (item) =>
                        item.result === "pending"
                ).length,
            },
        ];

        const summaryWorksheet =
            XLSX.utils.json_to_sheet(
                summaryRows
            );

        summaryWorksheet["!cols"] = [
            { wch: 24 },
            { wch: 35 },
        ];

        XLSX.utils.book_append_sheet(
            workbook,
            summaryWorksheet,
            "Summary"
        );

        // --------------------------------------------------------
        // 19. Generate XLSX file
        // --------------------------------------------------------

        const buffer =
            XLSX.write(workbook, {
                bookType: "xlsx",
                type: "buffer",
            });

        // --------------------------------------------------------
        // 20. Response
        // --------------------------------------------------------

        console.log(
            `✅ [ADMIN EXPORT] Exported ${inspections.length} inspections`
        );

        return new NextResponse(buffer, {
            status: 200,

            headers: {
                "Content-Type":
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

                "Content-Disposition":
                    `attachment; filename="all-inspections-${new Date()
                        .toISOString()
                        .slice(0, 10)}.xlsx"`,

                "Cache-Control":
                    "no-store, max-age=0",
            },
        });
    } catch (error) {
        console.error(
            "❌ [ADMIN EXPORT] Failed"
        );

        console.error(
            "   └─",
            error.message
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to export inspections",
            },
            {
                status: 500,
            }
        );
    }
}
