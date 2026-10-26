import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import Inspection from "@/models/Inspection";

export async function GET() {
    try {
        console.log("📊 [INSPECTION STATS] Request received");

        // 1. Get authentication cookie
        const cookieStore = await cookies();

        const token = cookieStore.get(
            "smart_inspection_token"
        )?.value;

        if (!token) {
            console.log(
                "❌ [INSPECTION STATS] Authentication token missing"
            );

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
            console.log(
                "❌ [INSPECTION STATS] Invalid or expired token"
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid or expired token",
                },
                { status: 401 }
            );
        }

        console.log(
            `👤 [INSPECTION STATS] User: ${decoded.userId}`
        );

        // 3. Inspector-only statistics
        if (decoded.role !== "inspector") {
            console.log(
                `🚫 [INSPECTION STATS] Unauthorized role: ${decoded.role}`
            );

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Only inspectors can access inspector statistics",
                },
                { status: 403 }
            );
        }

        // 4. Validate user ID
        if (!mongoose.Types.ObjectId.isValid(decoded.userId)) {
            console.log(
                "❌ [INSPECTION STATS] Invalid user ID"
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid user ID",
                },
                { status: 400 }
            );
        }

        // 5. Convert JWT user ID to MongoDB ObjectId
        const inspectorId = new mongoose.Types.ObjectId(
            decoded.userId
        );

        // 6. Connect to database
        await connectDB();

        console.log(
            `🔎 [INSPECTION STATS] Calculating statistics for inspector: ${decoded.userId}`
        );

        // 7. Aggregate inspector statistics
        const stats = await Inspection.aggregate([
            {
                $match: {
                    inspector: inspectorId,
                },
            },
            {
                $group: {
                    _id: null,

                    // All inspections belonging to this inspector
                    total: {
                        $sum: 1,
                    },

                    // Submitted inspections
                    completed: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$status",
                                        "submitted",
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },

                    // Draft inspections
                    pending: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$status",
                                        "draft",
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },

                    // Passed results
                    passed: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$result",
                                        "passed",
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },

                    // Warning results
                    warning: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$result",
                                        "warning",
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },

                    // Failed results
                    failed: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$result",
                                        "failed",
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    total: 1,
                    completed: 1,
                    pending: 1,
                    passed: 1,
                    warning: 1,
                    failed: 1,
                },
            },
        ]);

        // 8. Default values if no inspections exist
        const result = stats[0] || {
            total: 0,
            completed: 0,
            pending: 0,
            passed: 0,
            warning: 0,
            failed: 0,
        };

        console.log(
            "✅ [INSPECTION STATS] Statistics calculated:",
            result
        );

        // 9. Return statistics
        return NextResponse.json(
            {
                success: true,
                data: result,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(
            "❌ [INSPECTION STATS] Failed"
        );
        console.error("   └─", error.message);

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to fetch inspection statistics",
            },
            { status: 500 }
        );
    }
}