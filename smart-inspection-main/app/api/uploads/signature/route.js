import crypto from "crypto";
import { cookies } from "next/headers";

import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";
import Inspection from "@/models/Inspection";

export async function POST(request) {
    console.log(
        "🔐 [CLOUDINARY SIGNATURE] Request received"
    );

    try {
        /* =====================================================
           AUTHENTICATION
        ====================================================== */

        const cookieStore = await cookies();

        const token =
            cookieStore.get(
                "smart_inspection_token"
            )?.value;

        if (!token) {
            console.error(
                "❌ [CLOUDINARY SIGNATURE] No auth token"
            );

            return Response.json(
                {
                    success: false,
                    message:
                        "Authentication required",
                },
                { status: 401 }
            );
        }

        const payload =
            verifyToken(token);

        if (!payload) {
            console.error(
                "❌ [CLOUDINARY SIGNATURE] Invalid JWT"
            );

            return Response.json(
                {
                    success: false,
                    message:
                        "Invalid or expired session",
                },
                { status: 401 }
            );
        }

        /* =====================================================
           REQUEST BODY
        ====================================================== */

        const body =
            await request.json();

        const inspectionId =
            body?.inspectionId;

        if (!inspectionId) {
            return Response.json(
                {
                    success: false,
                    message:
                        "inspectionId is required",
                },
                { status: 400 }
            );
        }

        console.log(
            "🔐 [CLOUDINARY SIGNATURE] Inspection:",
            inspectionId
        );

        /* =====================================================
           DATABASE
        ====================================================== */

        await connectDB();

        const user =
            await User.findById(
                payload.userId
            ).select(
                "_id name email role"
            );

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message:
                        "User not found",
                },
                { status: 401 }
            );
        }

        if (
            user.role !==
            "inspector"
        ) {
            return Response.json(
                {
                    success: false,
                    message:
                        "Only inspectors can upload evidence",
                },
                { status: 403 }
            );
        }

        /* =====================================================
           INSPECTION OWNERSHIP
        ====================================================== */

        const inspection =
            await Inspection.findOne({
                _id: inspectionId,
                inspector: user._id,
            }).select(
                "_id status"
            );

        if (!inspection) {
            return Response.json(
                {
                    success: false,
                    message:
                        "Inspection not found or access denied",
                },
                { status: 404 }
            );
        }

        if (
            inspection.status ===
            "submitted"
        ) {
            return Response.json(
                {
                    success: false,
                    message:
                        "Submitted inspections are locked",
                },
                { status: 409 }
            );
        }

        /* =====================================================
           CLOUDINARY CONFIG
        ====================================================== */

        const cloudName =
            process.env
                .CLOUDINARY_CLOUD_NAME;

        const apiKey =
            process.env
                .CLOUDINARY_API_KEY;

        const apiSecret =
            process.env
                .CLOUDINARY_API_SECRET;

        if (!cloudName) {
            console.error(
                "❌ CLOUDINARY_CLOUD_NAME missing"
            );
        }

        if (!apiKey) {
            console.error(
                "❌ CLOUDINARY_API_KEY missing"
            );
        }

        if (!apiSecret) {
            console.error(
                "❌ CLOUDINARY_API_SECRET missing"
            );
        }

        if (
            !cloudName ||
            !apiKey ||
            !apiSecret
        ) {
            return Response.json(
                {
                    success: false,
                    message:
                        "Cloudinary configuration is incomplete",
                },
                { status: 500 }
            );
        }

        /* =====================================================
           SIGNED UPLOAD PARAMETERS
        ====================================================== */

        const timestamp =
            Math.floor(
                Date.now() / 1000
            );

        const folder =
            `smart-inspection/evidence/${inspectionId}`;

        /*
         * Cloudinary signed upload signature.
         *
         * IMPORTANT:
         * Do not include api_key in the signature.
         * Do not include file in the signature.
         * Do not expose apiSecret to the browser.
         */

        const paramsToSign = {
            folder,
            timestamp,
        };

        const signatureBase =
            Object.keys(
                paramsToSign
            )
                .sort()
                .map(
                    (key) =>
                        `${key}=${paramsToSign[key]}`
                )
                .join("&");

        const signature =
            crypto
                .createHash("sha1")
                .update(
                    signatureBase +
                    apiSecret
                )
                .digest("hex");

        console.log(
            "✅ [CLOUDINARY SIGNATURE] Generated successfully"
        );

        console.log(
            "   ├─ Cloud:",
            cloudName
        );

        console.log(
            "   ├─ Folder:",
            folder
        );

        console.log(
            "   ├─ Timestamp:",
            timestamp
        );

        console.log(
            "   └─ Signature:",
            `${signature.slice(
                0,
                10
            )}...`
        );

        /* =====================================================
           IMPORTANT:
           RETURN EXACT FIELD NAMES EXPECTED BY FRONTEND
        ====================================================== */

        return Response.json(
            {
                success: true,

                signature,

                timestamp,

                apiKey,

                cloudName,

                folder,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(
            "❌ [CLOUDINARY SIGNATURE] Failed"
        );

        console.error(
            error
        );

        return Response.json(
            {
                success: false,
                message:
                    "Unable to authorize Cloudinary upload",
            },
            { status: 500 }
        );
    }
}