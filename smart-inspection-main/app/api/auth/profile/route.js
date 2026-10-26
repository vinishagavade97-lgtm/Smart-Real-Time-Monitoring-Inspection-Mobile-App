import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { connectDB } from "../../../../lib/mongodb";
import { verifyToken } from "../../../../lib/auth";
import User from "../../../../models/User";

export async function PATCH(request) {
    try {
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

        if (!decoded?.userId) {
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

        const body = await request.json();

        const name =
            typeof body.name === "string"
                ? body.name.trim()
                : "";

        if (name.length < 2) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Full name must contain at least 2 characters.",
                },
                {
                    status: 400,
                }
            );
        }

        if (name.length > 100) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Full name cannot exceed 100 characters.",
                },
                {
                    status: 400,
                }
            );
        }

        await connectDB();

        const user = await User.findById(decoded.userId);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found",
                },
                {
                    status: 404,
                }
            );
        }

        user.name = name;

        await user.save();

        return NextResponse.json(
            {
                success: true,
                message: "Profile updated successfully",
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error(
            "❌ [Profile API] Profile update failed:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message: "Unable to update profile",
            },
            {
                status: 500,
            }
        );
    }
}