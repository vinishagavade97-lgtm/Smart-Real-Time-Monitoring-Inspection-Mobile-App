import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { connectDB } from "../../../../lib/mongodb";
import { verifyToken } from "../../../../lib/auth";
import User from "../../../../models/User";

export async function GET() {
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

        if (!decoded?.userId || !decoded?.role) {
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
        // FIXED ADMIN SESSION
        // =========================================================

        if (decoded.role === "admin") {
            return NextResponse.json(
                {
                    success: true,
                    user: {
                        id: "admin",
                        name:
                            process.env.ADMIN_NAME ||
                            "System Administrator",
                        email:
                            process.env.ADMIN_EMAIL ||
                            "",
                        role: "admin",
                    },
                },
                {
                    status: 200,
                }
            );
        }

        // =========================================================
        // INSPECTOR SESSION
        // =========================================================

        await connectDB();

        const user = await User.findById(
            decoded.userId
        ).select("-password");

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found",
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
                    message: "Account is inactive",
                },
                {
                    status: 403,
                }
            );
        }

        return NextResponse.json(
            {
                success: true,
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
            "❌ [Auth Me] Failed:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message: "Unable to verify session",
            },
            {
                status: 500,
            }
        );
    }
}