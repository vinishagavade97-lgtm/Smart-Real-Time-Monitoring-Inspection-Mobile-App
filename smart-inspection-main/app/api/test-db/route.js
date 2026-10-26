import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
    try {
        await connectDB();

        console.log("✅ [API] MongoDB health check passed");

        return NextResponse.json({
            success: true,
            message: "MongoDB connected successfully",
        });
    } catch (error) {
        console.error("❌ [API] MongoDB health check failed");

        return NextResponse.json(
            {
                success: false,
                message: "MongoDB connection failed",
            },
            {
                status: 500,
            }
        );
    }
}