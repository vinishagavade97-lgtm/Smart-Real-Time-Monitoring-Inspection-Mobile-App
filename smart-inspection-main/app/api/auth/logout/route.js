import { NextResponse } from "next/server";

export async function POST() {
    try {
        console.log("🚪 [LOGOUT] Logout request received");

        const response = NextResponse.json(
            {
                success: true,
                message: "Logout successful",
            },
            { status: 200 }
        );

        // Clear JWT cookie
        response.cookies.set("smart_inspection_token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 0,
        });

        console.log("✅ [LOGOUT] User logged out successfully");

        return response;
    } catch (error) {
        console.error("❌ [LOGOUT] Logout failed");
        console.error("   └─", error.message);

        return NextResponse.json(
            {
                success: false,
                message: "Logout failed",
            },
            { status: 500 }
        );
    }
}