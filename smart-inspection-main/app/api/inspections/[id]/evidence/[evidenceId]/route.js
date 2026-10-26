import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { cookies } from "next/headers";

import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import Inspection from "@/models/Inspection";

export async function DELETE(request, { params }) {
    try {
        // 1. Authentication
        const cookieStore = await cookies();
        const token = cookieStore.get("smart_inspection_token")?.value;

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Authentication required",
                },
                { status: 401 }
            );
        }

        // 2. Verify JWT
        const decoded = verifyToken(token);

        if (!decoded) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid or expired token",
                },
                { status: 401 }
            );
        }

        // 3. Inspector only
        if (decoded.role !== "inspector") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Only inspectors can delete evidence",
                },
                { status: 403 }
            );
        }

        // 4. Get route parameters
        const {
            id: inspectionId,
            evidenceId,
        } = await params;

        // 5. Validate IDs
        if (!mongoose.Types.ObjectId.isValid(inspectionId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid inspection ID",
                },
                { status: 400 }
            );
        }

        if (!mongoose.Types.ObjectId.isValid(evidenceId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid evidence ID",
                },
                { status: 400 }
            );
        }

        // 6. Connect database
        await connectDB();

        // 7. Find inspection owned by current inspector
        const inspection = await Inspection.findOne({
            _id: inspectionId,
            inspector: decoded.userId,
        });

        if (!inspection) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Inspection not found",
                },
                { status: 404 }
            );
        }

        // 8. Only drafts can be modified
        if (inspection.status !== "draft") {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Evidence can only be deleted from a draft inspection",
                },
                { status: 409 }
            );
        }

        // 9. Find evidence
        const evidence = inspection.evidence.id(evidenceId);

        if (!evidence) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Evidence not found",
                },
                { status: 404 }
            );
        }

        // Save publicId before removing MongoDB record
        const publicId = evidence.publicId;

        // 10. Delete image from Cloudinary
        try {
            const cloudinaryResult =
                await cloudinary.uploader.destroy(publicId, {
                    resource_type: "image",
                });

            if (
                cloudinaryResult.result !== "ok" &&
                cloudinaryResult.result !== "not found"
            ) {
                console.error(
                    "❌ [Cloudinary] Delete failed:",
                    cloudinaryResult
                );

                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Failed to delete evidence from Cloudinary",
                    },
                    { status: 500 }
                );
            }
        } catch (cloudinaryError) {
            console.error(
                "❌ [Cloudinary] Delete error:",
                cloudinaryError.message
            );

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Failed to delete evidence from Cloudinary",
                },
                { status: 500 }
            );
        }

        // 11. Remove evidence from MongoDB
        inspection.evidence.pull(evidenceId);

        await inspection.save();

        // 12. Success
        return NextResponse.json(
            {
                success: true,
                message: "Evidence deleted successfully",
                data: {
                    evidenceId,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("❌ [Delete Evidence] Error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete evidence",
            },
            { status: 500 }
        );
    }
}