import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { connectDB } from "../../../../lib/mongodb";
import { verifyToken } from "../../../../lib/auth";
import Inspection from "../../../../models/Inspection";
import User from "../../../../models/User";

export async function GET() {
    try {
        // =========================================================
        // AUTHENTICATION
        // =========================================================

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

        const decoded = verifyToken(token);

        if (!decoded) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid or expired session",
                },
                {
                    status: 401,
                }
            );
        }

        // =========================================================
        // ADMIN AUTHORIZATION
        // =========================================================

        if (decoded.role !== "admin") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Admin access required",
                },
                {
                    status: 403,
                }
            );
        }

        // =========================================================
        // DATABASE
        // =========================================================

        await connectDB();

        // =========================================================
        // BASIC INSPECTION STATS
        // =========================================================

        const [
            total,
            completed,
            pending,
            passed,
            warning,
            failed,
            inspectorCount,
            activeInspectorCount,
            recentInspections,
            inspectorActivity,
        ] = await Promise.all([
            Inspection.countDocuments({}),

            Inspection.countDocuments({
                status: "submitted",
            }),

            Inspection.countDocuments({
                status: "draft",
            }),

            Inspection.countDocuments({
                result: "passed",
            }),

            Inspection.countDocuments({
                result: "warning",
            }),

            Inspection.countDocuments({
                result: "failed",
            }),

            User.countDocuments({
                role: "inspector",
            }),

            User.countDocuments({
                role: "inspector",
                isActive: {
                    $ne: false,
                },
            }),

            // =====================================================
            // RECENT INSPECTIONS
            // =====================================================

            Inspection.find({})
                .populate(
                    "inspector",
                    "name email role"
                )
                .sort({
                    createdAt: -1,
                })
                .limit(8)
                .lean(),

            // =====================================================
            // INSPECTOR ACTIVITY
            // =====================================================

            Inspection.aggregate([
                {
                    $group: {
                        _id: "$inspector",
                        inspections: {
                            $sum: 1,
                        },
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
                    $lookup: {
                        from: "users",
                        localField: "_id",
                        foreignField: "_id",
                        as: "inspector",
                    },
                },

                {
                    $unwind: {
                        path: "$inspector",
                        preserveNullAndEmptyArrays: false,
                    },
                },

                {
                    $match: {
                        "inspector.role":
                            "inspector",
                    },
                },

                {
                    $sort: {
                        inspections: -1,
                    },
                },

                {
                    $limit: 6,
                },

                {
                    $project: {
                        _id: 0,
                        id: "$inspector._id",
                        name: "$inspector.name",
                        email: "$inspector.email",
                        isActive: {
                            $ne: [
                                "$inspector.isActive",
                                false,
                            ],
                        },
                        inspections: 1,
                        completed: 1,
                        failed: 1,
                    },
                },
            ]),
        ]);

        // =========================================================
        // NORMALIZE RECENT INSPECTIONS
        // =========================================================

        const recent = recentInspections.map(
            (inspection) => ({
                id: inspection._id.toString(),

                assetName:
                    inspection.assetName || "Unnamed asset",

                location:
                    inspection.location || null,

                inspectionType:
                    inspection.inspectionType || "",

                inspectedAt:
                    inspection.inspectedAt ||
                    inspection.createdAt,

                submittedAt:
                    inspection.submittedAt || null,

                status:
                    inspection.status || "draft",

                result:
                    inspection.result || "pending",

                inspector:
                    inspection.inspector
                        ? {
                            id:
                                inspection.inspector._id.toString(),
                            name:
                                inspection.inspector.name,
                            email:
                                inspection.inspector.email,
                            role:
                                inspection.inspector.role,
                        }
                        : null,
            })
        );

        return NextResponse.json(
            {
                success: true,

                data: {
                    stats: {
                        total,
                        completed,
                        pending,
                        passed,
                        warning,
                        failed,
                        attention:
                            warning + failed,
                    },

                    inspectors: {
                        total: inspectorCount,
                        active: activeInspectorCount,
                        inactive:
                            Math.max(
                                inspectorCount -
                                activeInspectorCount,
                                0
                            ),
                    },

                    recent: recent,

                    inspectorActivity,
                },
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error(
            "❌ [Admin Dashboard] Failed:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Unable to load admin dashboard",
            },
            {
                status: 500,
            }
        );
    }
}