import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";

export async function GET(request) {
    try {
        console.log("👥 [ADMIN INSPECTORS] Request received");

        // --------------------------------------------------
        // 1. Authentication
        // --------------------------------------------------

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
                { status: 401 }
            );
        }

        const decoded = verifyToken(token);

        if (!decoded) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid or expired authentication token",
                },
                { status: 401 }
            );
        }

        // --------------------------------------------------
        // 2. Admin only
        // --------------------------------------------------

        if (decoded.role !== "admin") {
            console.log(
                `🚫 [ADMIN INSPECTORS] Unauthorized role: ${decoded.role}`
            );

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Only administrators can access inspector accounts",
                },
                { status: 403 }
            );
        }

        // --------------------------------------------------
        // 3. Pagination parameters
        // --------------------------------------------------

        const { searchParams } = new URL(
            request.url
        );

        const requestedPage = Number(
            searchParams.get("page") || 1
        );

        const requestedLimit = Number(
            searchParams.get("limit") || 10
        );

        const search =
            searchParams.get("search")?.trim() || "";

        const page =
            Number.isFinite(requestedPage) &&
                requestedPage > 0
                ? Math.floor(requestedPage)
                : 1;

        const limit =
            Number.isFinite(requestedLimit) &&
                requestedLimit > 0
                ? Math.min(
                    Math.floor(requestedLimit),
                    50
                )
                : 10;

        // --------------------------------------------------
        // 4. Connect database
        // --------------------------------------------------

        await connectDB();

        // --------------------------------------------------
        // 5. Build query
        // --------------------------------------------------

        const query = {
            role: "inspector",
        };

        if (search) {
            query.$or = [
                {
                    name: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    email: {
                        $regex: search,
                        $options: "i",
                    },
                },
            ];
        }

        // --------------------------------------------------
        // 6. Global account counts
        // --------------------------------------------------

        const totalInspectors =
            await User.countDocuments({
                role: "inspector",
            });

        const activeInspectors =
            await User.countDocuments({
                role: "inspector",
                isActive: {
                    $ne: false,
                },
            });

        const inactiveInspectors =
            await User.countDocuments({
                role: "inspector",
                isActive: false,
            });

        // --------------------------------------------------
        // 7. Search result count
        // --------------------------------------------------

        const totalFiltered =
            await User.countDocuments(query);

        const totalPages = Math.max(
            1,
            Math.ceil(totalFiltered / limit)
        );

        const safePage = Math.min(
            page,
            totalPages
        );

        const skip =
            (safePage - 1) * limit;

        // --------------------------------------------------
        // 8. Fetch current page
        // --------------------------------------------------

        const inspectors = await User.find(query)
            .select(
                "_id name email role isActive createdAt updatedAt"
            )
            .sort({
                createdAt: -1,
            })
            .skip(skip)
            .limit(limit)
            .lean();

        // --------------------------------------------------
        // 9. Format response
        // --------------------------------------------------

        const formattedInspectors =
            inspectors.map((inspector) => ({
                id: inspector._id.toString(),
                name: inspector.name,
                email: inspector.email,
                role: inspector.role,
                isActive:
                    inspector.isActive !== false,
                createdAt:
                    inspector.createdAt,
                updatedAt:
                    inspector.updatedAt,
            }));

        console.log(
            `✅ [ADMIN INSPECTORS] Page ${safePage}/${totalPages} — ${formattedInspectors.length} inspector(s)`
        );

        return NextResponse.json(
            {
                success: true,
                data: {
                    inspectors:
                        formattedInspectors,

                    summary: {
                        total:
                            totalInspectors,
                        active:
                            activeInspectors,
                        inactive:
                            inactiveInspectors,
                    },

                    pagination: {
                        page: safePage,
                        limit,
                        total:
                            totalFiltered,
                        totalPages,
                        hasPreviousPage:
                            safePage > 1,
                        hasNextPage:
                            safePage <
                            totalPages,
                    },
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(
            "❌ [ADMIN INSPECTORS] GET error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to load inspector accounts",
            },
            { status: 500 }
        );
    }
}