import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import Inspection from "@/models/Inspection";

export async function GET(request) {
    try {
        // =====================================================
        // 1. AUTHENTICATION
        // =====================================================

        const cookieStore = await cookies();

        const token =
            cookieStore.get(
                "smart_inspection_token"
            )?.value;

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Authentication required",
                },
                { status: 401 }
            );
        }

        // =====================================================
        // 2. VERIFY JWT
        // =====================================================

        const decoded = verifyToken(token);

        if (!decoded) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid or expired token",
                },
                { status: 401 }
            );
        }

        // =====================================================
        // 3. INSPECTOR ONLY
        // =====================================================

        if (decoded.role !== "inspector") {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Only inspectors can access recent inspections",
                },
                { status: 403 }
            );
        }

        // =====================================================
        // 4. PAGINATION
        // =====================================================

        const { searchParams } =
            new URL(request.url);

        const requestedPage = Number(
            searchParams.get("page") || 1
        );

        const requestedLimit = Number(
            searchParams.get("limit") || 5
        );

        const page = Math.max(
            Number.isInteger(requestedPage)
                ? requestedPage
                : 1,
            1
        );

        const limit = Math.min(
            Math.max(
                Number.isInteger(
                    requestedLimit
                )
                    ? requestedLimit
                    : 5,
                1
            ),
            20
        );

        const skip = (page - 1) * limit;

        // =====================================================
        // 5. CONNECT DATABASE
        // =====================================================

        await connectDB();

        // =====================================================
        // 6. BASE QUERY
        // =====================================================

        const filter = {
            inspector: decoded.userId,
        };

        // =====================================================
        // 7. TOTAL COUNT
        // =====================================================

        const total =
            await Inspection.countDocuments(
                filter
            );

        const totalPages =
            Math.max(
                Math.ceil(
                    total / limit
                ),
                1
            );

        // Prevent invalid pages

        const safePage = Math.min(
            page,
            totalPages
        );

        const safeSkip =
            (safePage - 1) * limit;

        // =====================================================
        // 8. FETCH INSPECTIONS
        // =====================================================

        const inspections =
            await Inspection.find(filter)
                .sort({
                    inspectedAt: -1,
                })
                .skip(safeSkip)
                .limit(limit)
                .select(
                    "assetName inspectionType status result inspectedAt submittedAt createdAt"
                )
                .lean();

        // =====================================================
        // 9. FORMAT RESPONSE
        // =====================================================

        const formattedInspections =
            inspections.map(
                (inspection) => ({
                    id: inspection._id,
                    assetName:
                        inspection.assetName,
                    inspectionType:
                        inspection.inspectionType,
                    status:
                        inspection.status,
                    result:
                        inspection.result,
                    inspectedAt:
                        inspection.inspectedAt,
                    submittedAt:
                        inspection.submittedAt,
                    createdAt:
                        inspection.createdAt,
                })
            );

        // =====================================================
        // 10. RESPONSE
        // =====================================================

        return NextResponse.json(
            {
                success: true,

                data:
                    formattedInspections,

                pagination: {
                    page: safePage,
                    limit,
                    total,
                    totalPages,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(
            "❌ [Recent Inspections] Error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to fetch recent inspections",
            },
            { status: 500 }
        );
    }
}