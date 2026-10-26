import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";

async function authenticateAdmin() {
    const cookieStore = await cookies();

    const token = cookieStore.get(
        "smart_inspection_token"
    )?.value;

    if (!token) {
        return {
            success: false,
            response: NextResponse.json(
                {
                    success: false,
                    message: "Authentication required",
                },
                { status: 401 }
            ),
        };
    }

    const decoded = verifyToken(token);

    if (!decoded) {
        return {
            success: false,
            response: NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid or expired authentication token",
                },
                { status: 401 }
            ),
        };
    }

    if (decoded.role !== "admin") {
        return {
            success: false,
            response: NextResponse.json(
                {
                    success: false,
                    message:
                        "Only administrators can manage inspector accounts",
                },
                { status: 403 }
            ),
        };
    }

    return {
        success: true,
        decoded,
    };
}

// ======================================================
// PATCH — Activate / Deactivate Inspector
// ======================================================

export async function PATCH(request, { params }) {
    try {
        console.log(
            "👤 [ADMIN INSPECTORS] Status update request"
        );

        const auth = await authenticateAdmin();

        if (!auth.success) {
            return auth.response;
        }

        const { id } = await params;

        // --------------------------------------------------
        // Validate ID
        // --------------------------------------------------

        if (
            !id ||
            !mongoose.Types.ObjectId.isValid(id)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid inspector ID",
                },
                { status: 400 }
            );
        }

        // --------------------------------------------------
        // Parse body
        // --------------------------------------------------

        let body;

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid request body",
                },
                { status: 400 }
            );
        }

        if (
            typeof body.isActive !== "boolean"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "isActive must be a boolean",
                },
                { status: 400 }
            );
        }

        // --------------------------------------------------
        // Connect DB
        // --------------------------------------------------

        await connectDB();

        // --------------------------------------------------
        // Find inspector
        // --------------------------------------------------

        const inspector = await User.findOne({
            _id: id,
            role: "inspector",
        });

        if (!inspector) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Inspector account not found",
                },
                { status: 404 }
            );
        }

        // --------------------------------------------------
        // Update status
        // --------------------------------------------------

        inspector.isActive = body.isActive;

        await inspector.save();

        console.log(
            `✅ [ADMIN INSPECTORS] Inspector ${inspector.email
            } ${body.isActive
                ? "activated"
                : "deactivated"
            }`
        );

        return NextResponse.json(
            {
                success: true,
                message: body.isActive
                    ? "Inspector activated successfully"
                    : "Inspector deactivated successfully",
                data: {
                    inspector: {
                        id: inspector._id.toString(),
                        name: inspector.name,
                        email: inspector.email,
                        role: inspector.role,
                        isActive:
                            inspector.isActive,
                    },
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(
            "❌ [ADMIN INSPECTORS] PATCH error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to update inspector account",
            },
            { status: 500 }
        );
    }
}

// ======================================================
// DELETE — Delete Inspector Account
// ======================================================

export async function DELETE(request, { params }) {
    try {
        console.log(
            "🗑️ [ADMIN INSPECTORS] Delete request"
        );

        const auth = await authenticateAdmin();

        if (!auth.success) {
            return auth.response;
        }

        const { id } = await params;

        // --------------------------------------------------
        // Validate ID
        // --------------------------------------------------

        if (
            !id ||
            !mongoose.Types.ObjectId.isValid(id)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid inspector ID",
                },
                { status: 400 }
            );
        }

        // --------------------------------------------------
        // Connect DB
        // --------------------------------------------------

        await connectDB();

        // --------------------------------------------------
        // Delete only inspector accounts
        // --------------------------------------------------

        const inspector =
            await User.findOneAndDelete({
                _id: id,
                role: "inspector",
            });

        if (!inspector) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Inspector account not found",
                },
                { status: 404 }
            );
        }

        console.log(
            `✅ [ADMIN INSPECTORS] Deleted inspector: ${inspector.email}`
        );

        return NextResponse.json(
            {
                success: true,
                message:
                    "Inspector account deleted successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(
            "❌ [ADMIN INSPECTORS] DELETE error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to delete inspector account",
            },
            { status: 500 }
        );
    }
}