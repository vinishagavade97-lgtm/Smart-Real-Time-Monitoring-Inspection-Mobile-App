import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";

import User from "@/models/User";
import Inspection from "@/models/Inspection";

/* ================================================================
   GET INSPECTION DETAILS

   ADMIN:
   - Can view ANY inspection
   - Does not exist in MongoDB
   - Uses fixed .env credentials
   - JWT userId is "admin"
   - Therefore NEVER call User.findById("admin")

   INSPECTOR:
   - Can view only their own inspections
================================================================ */

export async function GET(request, { params }) {
    try {
        console.log(
            "🔎 [INSPECTION DETAILS] Request received"
        );

        // --------------------------------------------------------
        // 1. Get authentication token
        // --------------------------------------------------------

        const cookieStore = await cookies();

        const token = cookieStore.get(
            "smart_inspection_token"
        )?.value;

        if (!token) {
            console.log(
                "❌ [INSPECTION DETAILS] Authentication token missing"
            );

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
            console.log(
                "❌ [INSPECTION DETAILS] Invalid or expired token"
            );

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
        // 3. Get dynamic route parameter
        // --------------------------------------------------------

        const { id: inspectionId } = await params;

        // --------------------------------------------------------
        // 4. Validate inspection ID
        // --------------------------------------------------------

        if (
            !inspectionId ||
            !mongoose.Types.ObjectId.isValid(
                inspectionId
            )
        ) {
            console.log(
                `❌ [INSPECTION DETAILS] Invalid inspection ID: ${inspectionId}`
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid inspection ID",
                },
                {
                    status: 400,
                }
            );
        }

        // --------------------------------------------------------
        // 5. Connect to database
        // --------------------------------------------------------

        await connectDB();

        // ========================================================
        // ADMIN ACCESS
        // ========================================================
        //
        // IMPORTANT:
        // Admin is stored in .env, NOT MongoDB.
        //
        // Admin JWT:
        //
        // {
        //     userId: "admin",
        //     role: "admin"
        // }
        //
        // Therefore we MUST NOT execute:
        //
        // User.findById("admin")
        //
        // because "admin" is not a MongoDB ObjectId.
        // ========================================================

        if (decoded.role === "admin") {
            console.log(
                "👑 [INSPECTION DETAILS] Admin access"
            );

            const inspection =
                await Inspection.findById(
                    inspectionId
                )
                    .populate(
                        "inspector",
                        "name email role"
                    )
                    .lean();

            if (!inspection) {
                console.log(
                    `❌ [INSPECTION DETAILS] Inspection not found: ${inspectionId}`
                );

                return NextResponse.json(
                    {
                        success: false,
                        message: "Inspection not found",
                    },
                    {
                        status: 404,
                    }
                );
            }

            console.log(
                `✅ [INSPECTION DETAILS] Admin viewing inspection: ${inspectionId}`
            );

            return NextResponse.json(
                {
                    success: true,

                    inspection: {
                        id: inspection._id.toString(),

                        assetName:
                            inspection.assetName,

                        location:
                            inspection.location,

                        inspectionType:
                            inspection.inspectionType,

                        inspectedAt:
                            inspection.inspectedAt,

                        submittedAt:
                            inspection.submittedAt,

                        status:
                            inspection.status,

                        result:
                            inspection.result,

                        inspector:
                            inspection.inspector
                                ? {
                                    id: inspection
                                        .inspector
                                        ._id
                                        ?.toString(),

                                    name: inspection
                                        .inspector
                                        .name,

                                    email: inspection
                                        .inspector
                                        .email,

                                    role: inspection
                                        .inspector
                                        .role,
                                }
                                : null,

                        checklist:
                            inspection.checklist ||
                            [],

                        evidence:
                            inspection.evidence ||
                            [],

                        remarks:
                            inspection.remarks ||
                            "",

                        createdAt:
                            inspection.createdAt,

                        updatedAt:
                            inspection.updatedAt,
                    },
                },
                {
                    status: 200,
                }
            );
        }

        // ========================================================
        // INSPECTOR ACCESS
        // ========================================================

        if (decoded.role !== "inspector") {
            console.log(
                `🚫 [INSPECTION DETAILS] Unauthorized role: ${decoded.role}`
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Access denied",
                },
                {
                    status: 403,
                }
            );
        }

        // --------------------------------------------------------
        // Validate inspector user ID
        // --------------------------------------------------------

        if (
            !decoded.userId ||
            !mongoose.Types.ObjectId.isValid(
                decoded.userId
            )
        ) {
            console.log(
                "❌ [INSPECTION DETAILS] Invalid inspector user ID"
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid user identity",
                },
                {
                    status: 401,
                }
            );
        }

        // --------------------------------------------------------
        // Find inspector
        // --------------------------------------------------------

        const user = await User.findById(
            decoded.userId
        ).select(
            "_id name email role isActive"
        );

        if (!user) {
            console.log(
                "❌ [INSPECTION DETAILS] User account not found"
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "User account not found",
                },
                {
                    status: 401,
                }
            );
        }

        // --------------------------------------------------------
        // Inactive inspector protection
        // --------------------------------------------------------

        if (user.isActive === false) {
            console.log(
                "🚫 [INSPECTION DETAILS] Inspector account inactive"
            );

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Inspector account is inactive",
                },
                {
                    status: 403,
                }
            );
        }

        // --------------------------------------------------------
        // Inspector ownership protection
        // --------------------------------------------------------

        const inspection =
            await Inspection.findOne({
                _id: inspectionId,
                inspector: user._id,
            })
                .populate(
                    "inspector",
                    "name email role"
                )
                .lean();

        if (!inspection) {
            console.log(
                `❌ [INSPECTION DETAILS] Inspection not found or not owned: ${inspectionId}`
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Inspection not found",
                },
                {
                    status: 404,
                }
            );
        }

        // --------------------------------------------------------
        // Return inspector inspection
        // --------------------------------------------------------

        console.log(
            `✅ [INSPECTION DETAILS] Inspector viewing inspection: ${inspectionId}`
        );

        return NextResponse.json(
            {
                success: true,

                inspection: {
                    id: inspection._id.toString(),

                    assetName:
                        inspection.assetName,

                    location:
                        inspection.location,

                    inspectionType:
                        inspection.inspectionType,

                    inspectedAt:
                        inspection.inspectedAt,

                    submittedAt:
                        inspection.submittedAt,

                    status:
                        inspection.status,

                    result:
                        inspection.result,

                    inspector:
                        inspection.inspector,

                    checklist:
                        inspection.checklist ||
                        [],

                    evidence:
                        inspection.evidence ||
                        [],

                    remarks:
                        inspection.remarks ||
                        "",

                    createdAt:
                        inspection.createdAt,

                    updatedAt:
                        inspection.updatedAt,
                },
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error(
            "❌ [INSPECTION DETAILS] Failed"
        );

        console.error(
            "   └─",
            error.message
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to fetch inspection details",
            },
            {
                status: 500,
            }
        );
    }
}

/* ================================================================
   PATCH INSPECTION

   ADMIN:
   - Read-only
   - Cannot modify inspector inspections

   INSPECTOR:
   - Can update own draft inspection
   - Cannot update submitted inspection
================================================================ */

export async function PATCH(request, { params }) {
    try {
        console.log(
            "✏️ [INSPECTION UPDATE] Request received"
        );

        // --------------------------------------------------------
        // 1. Authentication
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
        // 3. Admin is read-only
        // --------------------------------------------------------

        if (decoded.role === "admin") {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Administrators can view inspections but cannot modify them",
                },
                {
                    status: 403,
                }
            );
        }

        // --------------------------------------------------------
        // 4. Inspector only
        // --------------------------------------------------------

        if (decoded.role !== "inspector") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Access denied",
                },
                {
                    status: 403,
                }
            );
        }

        // --------------------------------------------------------
        // 5. Validate inspector ID
        // --------------------------------------------------------

        if (
            !decoded.userId ||
            !mongoose.Types.ObjectId.isValid(
                decoded.userId
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid user identity",
                },
                {
                    status: 401,
                }
            );
        }

        // --------------------------------------------------------
        // 6. Get inspection ID
        // --------------------------------------------------------

        const { id: inspectionId } = await params;

        if (
            !inspectionId ||
            !mongoose.Types.ObjectId.isValid(
                inspectionId
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid inspection ID",
                },
                {
                    status: 400,
                }
            );
        }

        // --------------------------------------------------------
        // 7. Connect DB
        // --------------------------------------------------------

        await connectDB();

        // --------------------------------------------------------
        // 8. Verify inspector
        // --------------------------------------------------------

        const user = await User.findById(
            decoded.userId
        ).select(
            "_id name email role isActive"
        );

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User account not found",
                },
                {
                    status: 401,
                }
            );
        }

        if (user.isActive === false) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Inspector account is inactive",
                },
                {
                    status: 403,
                }
            );
        }

        // --------------------------------------------------------
        // 9. Find own inspection
        // --------------------------------------------------------

        const inspection =
            await Inspection.findOne({
                _id: inspectionId,
                inspector: user._id,
            });

        if (!inspection) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Inspection not found",
                },
                {
                    status: 404,
                }
            );
        }

        // --------------------------------------------------------
        // 10. Submitted inspections are locked
        // --------------------------------------------------------

        if (
            inspection.status !== "draft"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Submitted inspections cannot be modified",
                },
                {
                    status: 409,
                }
            );
        }

        // --------------------------------------------------------
        // 11. Parse body
        // --------------------------------------------------------

        let body;

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid request body",
                },
                {
                    status: 400,
                }
            );
        }

        // --------------------------------------------------------
        // 12. Allowed fields
        // --------------------------------------------------------

        const allowedFields = [
            "assetName",
            "location",
            "inspectionType",
            "inspectedAt",
            "remarks",
        ];

        const receivedFields =
            Object.keys(body || {});

        const unknownFields =
            receivedFields.filter(
                (field) =>
                    !allowedFields.includes(
                        field
                    )
            );

        if (unknownFields.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Request contains unsupported fields",
                    fields: unknownFields,
                },
                {
                    status: 400,
                }
            );
        }

        if (
            receivedFields.length === 0
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "At least one field is required to update",
                },
                {
                    status: 400,
                }
            );
        }

        // --------------------------------------------------------
        // 13. Validate asset name
        // --------------------------------------------------------

        if (
            body.assetName !==
            undefined
        ) {
            if (
                typeof body.assetName !==
                "string" ||
                body.assetName.trim()
                    .length < 2
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Asset name must be at least 2 characters",
                    },
                    {
                        status: 400,
                    }
                );
            }

            if (
                body.assetName.trim()
                    .length > 150
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Asset name cannot exceed 150 characters",
                    },
                    {
                        status: 400,
                    }
                );
            }
        }

        // --------------------------------------------------------
        // 14. Validate inspection type
        // --------------------------------------------------------

        if (
            body.inspectionType !==
            undefined
        ) {
            if (
                typeof body.inspectionType !==
                "string" ||
                body.inspectionType.trim()
                    .length < 2
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Inspection type must be at least 2 characters",
                    },
                    {
                        status: 400,
                    }
                );
            }

            if (
                body.inspectionType.trim()
                    .length > 100
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Inspection type cannot exceed 100 characters",
                    },
                    {
                        status: 400,
                    }
                );
            }
        }

        // --------------------------------------------------------
        // 15. Validate remarks
        // --------------------------------------------------------

        if (
            body.remarks !==
            undefined
        ) {
            if (
                typeof body.remarks !==
                "string"
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Remarks must be text",
                    },
                    {
                        status: 400,
                    }
                );
            }

            if (
                body.remarks.length >
                1000
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Remarks cannot exceed 1000 characters",
                    },
                    {
                        status: 400,
                    }
                );
            }
        }

        // --------------------------------------------------------
        // 16. Validate location
        // --------------------------------------------------------

        if (
            body.location !==
            undefined
        ) {
            if (
                !body.location ||
                typeof body.location !==
                "object" ||
                Array.isArray(
                    body.location
                )
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Invalid location",
                    },
                    {
                        status: 400,
                    }
                );
            }

            const latitude = Number(
                body.location.latitude
            );

            const longitude = Number(
                body.location.longitude
            );

            if (
                !Number.isFinite(
                    latitude
                ) ||
                latitude < -90 ||
                latitude > 90
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Invalid latitude",
                    },
                    {
                        status: 400,
                    }
                );
            }

            if (
                !Number.isFinite(
                    longitude
                ) ||
                longitude < -180 ||
                longitude > 180
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Invalid longitude",
                    },
                    {
                        status: 400,
                    }
                );
            }
        }

        // --------------------------------------------------------
        // 17. Validate inspection time
        // --------------------------------------------------------

        if (
            body.inspectedAt !==
            undefined
        ) {
            const inspectionDate =
                new Date(
                    body.inspectedAt
                );

            if (
                Number.isNaN(
                    inspectionDate.getTime()
                )
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Invalid inspection date",
                    },
                    {
                        status: 400,
                    }
                );
            }

            const allowedFutureTime =
                5 * 60 * 1000;

            if (
                inspectionDate.getTime() >
                Date.now() +
                allowedFutureTime
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Inspection time cannot be more than 5 minutes in the future",
                    },
                    {
                        status: 400,
                    }
                );
            }
        }

        // --------------------------------------------------------
        // 18. Build safe update
        // --------------------------------------------------------

        const updateData = {};

        if (
            body.assetName !==
            undefined
        ) {
            updateData.assetName =
                body.assetName.trim();
        }

        if (
            body.inspectionType !==
            undefined
        ) {
            updateData.inspectionType =
                body.inspectionType.trim();
        }

        if (
            body.remarks !==
            undefined
        ) {
            updateData.remarks =
                body.remarks.trim();
        }

        if (
            body.location !==
            undefined
        ) {
            updateData.location = {
                latitude: Number(
                    body.location.latitude
                ),
                longitude: Number(
                    body.location.longitude
                ),
            };
        }

        if (
            body.inspectedAt !==
            undefined
        ) {
            updateData.inspectedAt =
                new Date(
                    body.inspectedAt
                );
        }

        // --------------------------------------------------------
        // 19. Apply update
        // --------------------------------------------------------

        Object.assign(
            inspection,
            updateData
        );

        await inspection.save();

        // --------------------------------------------------------
        // 20. Return updated inspection
        // --------------------------------------------------------

        console.log(
            `✅ [INSPECTION UPDATE] Inspection updated: ${inspectionId}`
        );

        return NextResponse.json(
            {
                success: true,

                message:
                    "Inspection updated successfully",

                inspection: {
                    id: inspection._id.toString(),

                    assetName:
                        inspection.assetName,

                    location:
                        inspection.location,

                    inspectionType:
                        inspection.inspectionType,

                    inspectedAt:
                        inspection.inspectedAt,

                    submittedAt:
                        inspection.submittedAt,

                    status:
                        inspection.status,

                    result:
                        inspection.result,

                    inspector: {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    },

                    checklist:
                        inspection.checklist ||
                        [],

                    evidence:
                        inspection.evidence ||
                        [],

                    remarks:
                        inspection.remarks ||
                        "",

                    createdAt:
                        inspection.createdAt,

                    updatedAt:
                        inspection.updatedAt,
                },
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error(
            "❌ [INSPECTION UPDATE] Failed"
        );

        console.error(
            "   └─",
            error.message
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to update inspection",
            },
            {
                status: 500,
            }
        );
    }
}