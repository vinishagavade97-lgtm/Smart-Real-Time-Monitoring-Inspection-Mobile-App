import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request) {
    try {
        console.log("📝 [REGISTER] Registration request received");

        const body = await request.json();

        const { name, email, password, confirmPassword } = body;

        // Validate required fields
        if (!name || !email || !password || !confirmPassword) {
            console.log("❌ [REGISTER] Missing required fields");

            return NextResponse.json(
                {
                    success: false,
                    message: "All fields are required",
                },
                { status: 400 }
            );
        }

        // Check password confirmation
        if (password !== confirmPassword) {
            console.log("❌ [REGISTER] Passwords do not match");

            return NextResponse.json(
                {
                    success: false,
                    message: "Passwords do not match",
                },
                { status: 400 }
            );
        }

        // Basic password validation
        if (password.length < 6) {
            console.log("❌ [REGISTER] Password too short");

            return NextResponse.json(
                {
                    success: false,
                    message: "Password must be at least 6 characters",
                },
                { status: 400 }
            );
        }

        // Connect database
        await connectDB();

        // Normalize email
        const normalizedEmail = email.toLowerCase().trim();

        // Check existing user
        const existingUser = await User.findOne({
            email: normalizedEmail,
        });

        if (existingUser) {
            console.log(
                `⚠️ [REGISTER] User already exists: ${normalizedEmail}`
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "An account with this email already exists",
                },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: "inspector",
        });

        console.log(
            `✅ [REGISTER] User created successfully: ${user.email}`
        );

        return NextResponse.json(
            {
                success: true,
                message: "Account created successfully",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("❌ [REGISTER] Registration failed");
        console.error("   └─", error.message);

        return NextResponse.json(
            {
                success: false,
                message: "Registration failed",
            },
            { status: 500 }
        );
    }
}