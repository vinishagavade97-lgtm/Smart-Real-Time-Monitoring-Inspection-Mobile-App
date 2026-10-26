import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { connectDB } from "../../../../lib/mongodb";
import User from "../../../../models/User";

const JWT_SECRET = process.env.JWT_SECRET;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME =
    process.env.ADMIN_NAME || "System Administrator";

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in .env.local");
}

export async function POST(request) {
    try {
        const body = await request.json();

        const email =
            typeof body.email === "string"
                ? body.email.trim().toLowerCase()
                : "";

        const password =
            typeof body.password === "string"
                ? body.password
                : "";

        if (!email || !password) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Email and password are required",
                },
                {
                    status: 400,
                }
            );
        }

        // =========================================================
        // FIXED ADMIN LOGIN
        // =========================================================

        if (
            ADMIN_EMAIL &&
            ADMIN_PASSWORD &&
            email === ADMIN_EMAIL.trim().toLowerCase() &&
            password === ADMIN_PASSWORD
        ) {
            const token = jwt.sign(
                {
                    userId: "admin",
                    role: "admin",
                },
                JWT_SECRET,
                {
                    expiresIn: "7d",
                }
            );

            const cookieStore = await cookies();

            cookieStore.set(
                "smart_inspection_token",
                token,
                {
                    httpOnly: true,
                    secure:
                        process.env.NODE_ENV ===
                        "production",
                    sameSite: "lax",
                    path: "/",
                    maxAge: 60 * 60 * 24 * 7,
                }
            );

            return NextResponse.json(
                {
                    success: true,
                    message: "Admin login successful",
                    user: {
                        id: "admin",
                        name: ADMIN_NAME,
                        email: ADMIN_EMAIL,
                        role: "admin",
                    },
                },
                {
                    status: 200,
                }
            );
        }

        // =========================================================
        // INSPECTOR LOGIN
        // =========================================================

        await connectDB();

        const user = await User.findOne({
            email,
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid email or password",
                },
                {
                    status: 401,
                }
            );
        }

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordMatch) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid email or password",
                },
                {
                    status: 401,
                }
            );
        }

        // =========================================================
        // ACCOUNT STATUS
        // =========================================================

        if (
            user.isActive === false
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Your account has been deactivated. Please contact the administrator.",
                },
                {
                    status: 403,
                }
            );
        }

        const token = jwt.sign(
            {
                userId: user._id.toString(),
                role: user.role,
            },
            JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        const cookieStore = await cookies();

        cookieStore.set(
            "smart_inspection_token",
            token,
            {
                httpOnly: true,
                secure:
                    process.env.NODE_ENV ===
                    "production",
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60 * 24 * 7,
            }
        );

        return NextResponse.json(
            {
                success: true,
                message: "Login successful",
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
            "❌ [Login API] Login failed:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message: "Unable to login",
            },
            {
                status: 500,
            }
        );
    }
}