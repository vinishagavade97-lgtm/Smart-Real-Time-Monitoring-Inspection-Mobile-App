import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import Inspection from "@/models/Inspection";

export async function POST(request, { params }) {
    try {
        // 1. Read authentication cookie
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

        // 3. Only inspectors can add evidence
        if (decoded.role !== "inspector") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Only inspectors can add evidence",
                },
                { status: 403 }
            );
        }

        // 4. Get inspection ID
        const { id: inspectionId } = await params;

        if (!mongoose.Types.ObjectId.isValid(inspectionId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid inspection ID",
                },
                { status: 400 }
            );
        }

        // 5. Read request body
        const body = await request.json();

        const { url, publicId, caption = "" } = body;

        // 6. Validate required fields
        if (!url || typeof url !== "string") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Cloudinary URL is required",
                },
                { status: 400 }
            );
        }

        if (!publicId || typeof publicId !== "string") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Cloudinary publicId is required",
                },
                { status: 400 }
            );
        }

        // 7. Validate caption
        if (typeof caption !== "string") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Caption must be a string",
                },
                { status: 400 }
            );
        }

        if (caption.trim().length > 300) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Caption cannot exceed 300 characters",
                },
                { status: 400 }
            );
        }

        // 8. Validate Cloudinary URL
        let parsedUrl;

        try {
            parsedUrl = new URL(url);
        } catch {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid Cloudinary URL",
                },
                { status: 400 }
            );
        }

        const expectedCloudName =
            process.env.CLOUDINARY_CLOUD_NAME;

        if (
            parsedUrl.protocol !== "https:" ||
            parsedUrl.hostname !== "res.cloudinary.com" ||
            !parsedUrl.pathname.startsWith(
                `/${expectedCloudName}/`
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid Cloudinary URL",
                },
                { status: 400 }
            );
        }

        // 9. Connect database
        await connectDB();

        // 10. Find inspection owned by current inspector
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

        // 11. Evidence can only be added to drafts
        if (inspection.status !== "draft") {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Evidence can only be added to a draft inspection",
                },
                { status: 409 }
            );
        }

        // 12. Verify publicId belongs to this inspection
        const expectedFolder =
            `smart-inspection/evidence/${inspectionId}/`;

        if (!publicId.startsWith(expectedFolder)) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Evidence does not belong to this inspection",
                },
                { status: 400 }
            );
        }

        // 13. Prevent path traversal
        if (
            publicId.includes("..") ||
            publicId.includes("\\")
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid publicId",
                },
                { status: 400 }
            );
        }

        // 14. Add evidence
        inspection.evidence.push({
            url: url.trim(),
            publicId: publicId.trim(),
            caption: caption.trim(),
        });

        await inspection.save();

        // 15. Return newly added evidence
        const addedEvidence =
            inspection.evidence[inspection.evidence.length - 1];

        return NextResponse.json(
            {
                success: true,
                message: "Evidence added successfully",
                data: {
                    evidence: addedEvidence,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("❌ [Add Evidence] Error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to add evidence",
            },
            { status: 500 }
        );
    }
}