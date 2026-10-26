import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { cookies } from "next/headers";

import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import Inspection from "@/models/Inspection";

export async function POST(request, { params }) {
    try {
        // 1. Authentication
        const cookieStore = await cookies();
        const token = cookieStore.get("smart_inspection_token")?.value;

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Authentication required",
                },
                { status: 401 }
            );
        }

        // 2. Verify JWT
        const decoded = verifyToken(token);

        if (!decoded) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid or expired token",
                },
                { status: 401 }
            );
        }

        // 3. Inspector only
        if (decoded.role !== "inspector") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Only inspectors can submit inspections",
                },
                { status: 403 }
            );
        }

        // 4. Get inspection ID
        const { id: inspectionId } = await params;

        if (!mongoose.Types.ObjectId.isValid(inspectionId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid inspection ID",
                },
                { status: 400 }
            );
        }

        // 5. Connect database
        await connectDB();

        // 6. Find inspection owned by current inspector
        const inspection = await Inspection.findOne({
            _id: inspectionId,
            inspector: decoded.userId,
        });

        if (!inspection) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Inspection not found",
                },
                { status: 404 }
            );
        }

        // 7. Prevent duplicate submission
        if (inspection.status === "submitted") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Inspection has already been submitted",
                },
                { status: 409 }
            );
        }

        // 8. Validate basic inspection information
        if (!inspection.assetName) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Asset name is required",
                },
                { status: 400 }
            );
        }

        if (!inspection.inspectionType) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Inspection type is required",
                },
                { status: 400 }
            );
        }

        if (
            !inspection.location ||
            typeof inspection.location.latitude !== "number" ||
            typeof inspection.location.longitude !== "number"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Inspection location is required",
                },
                { status: 400 }
            );
        }

        // 9. Checklist is mandatory
        if (
            !Array.isArray(inspection.checklist) ||
            inspection.checklist.length === 0
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "At least one checklist item is required",
                },
                { status: 400 }
            );
        }

        // 10. Validate checklist items
        const hasInvalidChecklistItem =
            inspection.checklist.some(
                (item) =>
                    !item.item ||
                    !["pass", "warning", "failed"].includes(item.status)
            );

        if (hasInvalidChecklistItem) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Checklist contains invalid items",
                },
                { status: 400 }
            );
        }

        // 11. Calculate overall result
        const hasFailed = inspection.checklist.some(
            (item) => item.status === "failed"
        );

        const hasWarning = inspection.checklist.some(
            (item) => item.status === "warning"
        );

        let result;

        if (hasFailed) {
            result = "failed";
        } else if (hasWarning) {
            result = "warning";
        } else {
            result = "passed";
        }

        // 12. Lock inspection
        inspection.result = result;
        inspection.status = "submitted";
        inspection.submittedAt = new Date();

        await inspection.save();

        // 13. Return final inspection status
        return NextResponse.json(
            {
                success: true,
                message: "Inspection submitted successfully",
                data: {
                    inspectionId: inspection._id,
                    status: inspection.status,
                    result: inspection.result,
                    submittedAt: inspection.submittedAt,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("❌ [Submit Inspection] Error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to submit inspection",
            },
            { status: 500 }
        );
    }
}