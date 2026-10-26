import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";

import User from "@/models/User";
import Inspection from "@/models/Inspection";

/* ================================================================
   POST — CREATE INSPECTION

   INSPECTOR ONLY
================================================================ */

export async function POST(request) {
    try {
        console.log(
            "📝 [INSPECTION CREATE] Request received"
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
                "❌ [INSPECTION CREATE] Authentication token missing"
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
                "❌ [INSPECTION CREATE] Invalid or expired token"
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
        // 3. Admin cannot create inspections
        // --------------------------------------------------------

        if (decoded.role === "admin") {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Administrators cannot create inspections",
                },
                {
                    status: 403,
                }
            );
        }

        // --------------------------------------------------------
        // 4. Inspector role required
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
        // 5. Connect to database
        // --------------------------------------------------------

        await connectDB();

        // --------------------------------------------------------
        // 6. Verify inspector account
        // --------------------------------------------------------

        const user = await User.findById(
            decoded.userId
        ).select(
            "_id name email role isActive"
        );

        if (!user) {
            console.log(
                "❌ [INSPECTION CREATE] Authenticated user not found"
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

        if (user.role !== "inspector") {
            console.log(
                `🚫 [INSPECTION CREATE] Unauthorized role: ${user.role}`
            );

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Only inspectors can create inspections",
                },
                {
                    status: 403,
                }
            );
        }

        // --------------------------------------------------------
        // 7. Read request body
        // --------------------------------------------------------

        let body;

        try {
            body = await request.json();
        } catch {
            console.log(
                "❌ [INSPECTION CREATE] Invalid JSON body"
            );

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

        const {
            assetName,
            location,
            inspectionType,
            inspectedAt,
        } = body;

        // --------------------------------------------------------
        // 8. Validate asset name
        // --------------------------------------------------------

        if (
            typeof assetName !== "string" ||
            assetName.trim().length < 2
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
            assetName.trim().length > 150
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

        // --------------------------------------------------------
        // 9. Validate inspection type
        // --------------------------------------------------------

        if (
            typeof inspectionType !==
            "string" ||
            inspectionType.trim().length < 2
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
            inspectionType.trim().length >
            100
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

        // --------------------------------------------------------
        // 10. Validate location
        // --------------------------------------------------------

        if (
            !location ||
            typeof location !== "object" ||
            Array.isArray(location)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Location is required",
                },
                {
                    status: 400,
                }
            );
        }

        const latitude = Number(
            location.latitude
        );

        const longitude = Number(
            location.longitude
        );

        if (
            !Number.isFinite(latitude) ||
            latitude < -90 ||
            latitude > 90
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid latitude",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            !Number.isFinite(longitude) ||
            longitude < -180 ||
            longitude > 180
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid longitude",
                },
                {
                    status: 400,
                }
            );
        }

        // --------------------------------------------------------
        // 11. Validate inspection time
        // --------------------------------------------------------

        let inspectionDate;

        if (
            inspectedAt === undefined ||
            inspectedAt === null
        ) {
            inspectionDate = new Date();
        } else {
            inspectionDate =
                new Date(inspectedAt);

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
                            "Inspection time cannot be in the future",
                    },
                    {
                        status: 400,
                    }
                );
            }
        }

        // --------------------------------------------------------
        // 12. Create inspection
        // --------------------------------------------------------

        const inspection =
            await Inspection.create({
                assetName:
                    assetName.trim(),

                location: {
                    latitude,
                    longitude,
                },

                inspectionType:
                    inspectionType.trim(),

                inspectedAt:
                    inspectionDate,

                inspector:
                    user._id,

                status: "draft",

                result: "pending",

                checklist: [],

                evidence: [],

                remarks: "",
            });

        console.log(
            `✅ [INSPECTION CREATE] Inspection created: ${inspection._id}`
        );

        // --------------------------------------------------------
        // 13. Response
        // --------------------------------------------------------

        return NextResponse.json(
            {
                success: true,

                message:
                    "Inspection created successfully",

                inspection: {
                    id: inspection._id,

                    assetName:
                        inspection.assetName,

                    location:
                        inspection.location,

                    inspectionType:
                        inspection.inspectionType,

                    inspectedAt:
                        inspection.inspectedAt,

                    status:
                        inspection.status,

                    result:
                        inspection.result,

                    inspector: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                    },

                    createdAt:
                        inspection.createdAt,
                },
            },
            {
                status: 201,
            }
        );
    } catch (error) {
        console.error(
            "❌ [INSPECTION CREATE] Failed"
        );

        console.error(
            "   └─",
            error.message
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to create inspection",
            },
            {
                status: 500,
            }
        );
    }
}

/* ================================================================
   GET — LIST INSPECTIONS

   ADMIN:
   - Can see ALL inspections
   - Can see inspections from ALL inspectors
   - Supports pagination
   - Supports search
   - Supports status
   - Supports result
   - Supports date filters

   INSPECTOR:
   - Can see ONLY their own inspections
   - Same filters/pagination
================================================================ */

export async function GET(request) {
    try {
        console.log(
            "📋 [INSPECTION LIST] Request received"
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
                "❌ [INSPECTION LIST] Authentication token missing"
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
                "❌ [INSPECTION LIST] Invalid or expired token"
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
        // 3. Connect database
        // --------------------------------------------------------

        await connectDB();

        // --------------------------------------------------------
        // 4. Read query parameters
        // --------------------------------------------------------

        const { searchParams } =
            new URL(request.url);

        const pageParam =
            searchParams.get("page");

        const limitParam =
            searchParams.get("limit");

        const search =
            searchParams
                .get("search")
                ?.trim();

        const status =
            searchParams.get("status");

        const result =
            searchParams.get("result");

        const from =
            searchParams.get("from");

        const to =
            searchParams.get("to");

        // --------------------------------------------------------
        // 5. Pagination validation
        // --------------------------------------------------------

        let page = Number.parseInt(
            pageParam || "1",
            10
        );

        let limit = Number.parseInt(
            limitParam || "10",
            10
        );

        if (
            !Number.isInteger(page) ||
            page < 1
        ) {
            page = 1;
        }

        if (
            !Number.isInteger(limit) ||
            limit < 1
        ) {
            limit = 10;
        }

        // Production safety limit
        if (limit > 50) {
            limit = 50;
        }

        const skip =
            (page - 1) * limit;

        // --------------------------------------------------------
        // 6. Build query
        // --------------------------------------------------------
        //
        // IMPORTANT:
        //
        // ADMIN:
        // Do NOT use decoded.userId as inspector.
        //
        // decoded.userId = "admin"
        //
        // ADMIN QUERY:
        // {}
        //
        // INSPECTOR QUERY:
        // { inspector: ObjectId(...) }
        // --------------------------------------------------------

        const query = {};

        // ========================================================
        // ADMIN
        // ========================================================

        if (decoded.role === "admin") {
            console.log(
                "👑 [INSPECTION LIST] Admin access — showing all inspections"
            );
        }

        // ========================================================
        // INSPECTOR
        // ========================================================

        else if (
            decoded.role === "inspector"
        ) {
            // Validate MongoDB user ID
            const mongoose =
                await import("mongoose");

            if (
                !decoded.userId ||
                !mongoose.default.Types.ObjectId.isValid(
                    decoded.userId
                )
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Invalid user identity",
                    },
                    {
                        status: 401,
                    }
                );
            }

            const user =
                await User.findById(
                    decoded.userId
                ).select(
                    "_id name email role isActive"
                );

            if (!user) {
                console.log(
                    "❌ [INSPECTION LIST] User not found"
                );

                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "User account not found",
                    },
                    {
                        status: 401,
                    }
                );
            }

            if (
                user.isActive === false
            ) {
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

            if (
                user.role !== "inspector"
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Access denied",
                    },
                    {
                        status: 403,
                    }
                );
            }

            // Inspector ownership protection
            query.inspector = user._id;
        }

        // ========================================================
        // UNKNOWN ROLE
        // ========================================================

        else {
            console.log(
                `🚫 [INSPECTION LIST] Unauthorized role: ${decoded.role}`
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
        // 7. Status filter
        // --------------------------------------------------------

        if (status) {
            const allowedStatuses = [
                "draft",
                "submitted",
            ];

            if (
                !allowedStatuses.includes(
                    status
                )
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Invalid status filter",
                    },
                    {
                        status: 400,
                    }
                );
            }

            query.status = status;
        }

        // --------------------------------------------------------
        // 8. Result filter
        // --------------------------------------------------------

        if (result) {
            const allowedResults = [
                "pending",
                "passed",
                "warning",
                "failed",
            ];

            if (
                !allowedResults.includes(
                    result
                )
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Invalid result filter",
                    },
                    {
                        status: 400,
                    }
                );
            }

            query.result = result;
        }

        // --------------------------------------------------------
        // 9. Search filter
        // --------------------------------------------------------

        if (search) {
            if (
                search.length > 100
            ) {
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

            // Escape regex special characters
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
        // 10. Date filter
        // --------------------------------------------------------

        if (from || to) {
            query.inspectedAt = {};

            if (from) {
                const fromDate =
                    new Date(
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
                            message:
                                "Invalid from date",
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
                const toDate =
                    new Date(
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
                            message:
                                "Invalid to date",
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
        // 11. Get total + paginated inspections
        // --------------------------------------------------------

        const [
            total,
            inspections,
        ] = await Promise.all([
            Inspection.countDocuments(
                query
            ),

            Inspection.find(query)
                .populate(
                    "inspector",
                    "name email role"
                )
                .select(
                    "assetName location inspectionType inspectedAt submittedAt status result evidence inspector createdAt updatedAt"
                )
                .sort({
                    inspectedAt: -1,
                    createdAt: -1,
                })
                .skip(skip)
                .limit(limit)
                .lean(),
        ]);

        // --------------------------------------------------------
        // 12. Pagination calculations
        // --------------------------------------------------------

        const totalPages =
            total === 0
                ? 0
                : Math.ceil(
                    total / limit
                );

        // --------------------------------------------------------
        // 13. Response
        // --------------------------------------------------------

        console.log(
            `✅ [INSPECTION LIST] Returned ${inspections.length} inspections`
        );

        return NextResponse.json(
            {
                success: true,

                inspections,

                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,

                    hasNextPage:
                        totalPages > 0 &&
                        page < totalPages,

                    hasPreviousPage:
                        page > 1 &&
                        totalPages > 0,
                },
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error(
            "❌ [INSPECTION LIST] Failed"
        );

        console.error(
            "   └─",
            error.message
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to fetch inspections",
            },
            {
                status: 500,
            }
        );
    }
}