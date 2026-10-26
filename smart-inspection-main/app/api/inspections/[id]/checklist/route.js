import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";
import Inspection from "@/models/Inspection";

const ALLOWED_STATUSES = [
    "pass",
    "warning",
    "failed",
];

const MAX_CHECKLIST_ITEMS = 100;

export async function PATCH(request, { params }) {
    try {
        console.log(
            "📋 [CHECKLIST UPDATE] Request received"
        );

        // --------------------------------------------------
        // 1. Authentication token
        // --------------------------------------------------

        const cookieStore = await cookies();

        const token = cookieStore.get(
            "smart_inspection_token"
        )?.value;

        if (!token) {
            console.log(
                "❌ [CHECKLIST UPDATE] Authentication token missing"
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Authentication required",
                },
                { status: 401 }
            );
        }

        // --------------------------------------------------
        // 2. Verify JWT
        // --------------------------------------------------

        const decoded = verifyToken(token);

        if (!decoded) {
            console.log(
                "❌ [CHECKLIST UPDATE] Invalid or expired token"
            );

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid or expired authentication token",
                },
                { status: 401 }
            );
        }

        // --------------------------------------------------
        // 3. Get inspection ID
        // Next.js 16: params is a Promise
        // --------------------------------------------------

        const { id: inspectionId } = await params;

        // --------------------------------------------------
        // 4. Validate inspection ID
        // --------------------------------------------------

        if (
            !inspectionId ||
            !mongoose.Types.ObjectId.isValid(
                inspectionId
            )
        ) {
            console.log(
                `❌ [CHECKLIST UPDATE] Invalid inspection ID: ${inspectionId}`
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid inspection ID",
                },
                { status: 400 }
            );
        }

        // --------------------------------------------------
        // 5. Connect to database
        // --------------------------------------------------

        await connectDB();

        // --------------------------------------------------
        // 6. Verify authenticated user
        // --------------------------------------------------

        const user = await User.findById(
            decoded.userId
        ).select("_id name email role");

        if (!user) {
            console.log(
                "❌ [CHECKLIST UPDATE] User account not found"
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "User account not found",
                },
                { status: 401 }
            );
        }

        // --------------------------------------------------
        // 7. Verify inspector role
        // --------------------------------------------------

        if (user.role !== "inspector") {
            console.log(
                `🚫 [CHECKLIST UPDATE] Unauthorized role: ${user.role}`
            );

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Only inspectors can update checklists",
                },
                { status: 403 }
            );
        }

        // --------------------------------------------------
        // 8. Find inspection with ownership protection
        // --------------------------------------------------

        const inspection = await Inspection.findOne({
            _id: inspectionId,
            inspector: user._id,
        });

        if (!inspection) {
            console.log(
                `❌ [CHECKLIST UPDATE] Inspection not found or not owned: ${inspectionId}`
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Inspection not found",
                },
                { status: 404 }
            );
        }

        // --------------------------------------------------
        // 9. Prevent checklist modification after submit
        // --------------------------------------------------

        if (inspection.status !== "draft") {
            console.log(
                `🚫 [CHECKLIST UPDATE] Inspection already submitted: ${inspectionId}`
            );

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Submitted inspections cannot be modified",
                },
                { status: 409 }
            );
        }

        // --------------------------------------------------
        // 10. Parse request body
        // --------------------------------------------------

        let body;

        try {
            body = await request.json();
        } catch (error) {
            console.log(
                "❌ [CHECKLIST UPDATE] Invalid JSON body"
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid request body",
                },
                { status: 400 }
            );
        }

        // --------------------------------------------------
        // 11. Validate request structure
        // --------------------------------------------------

        if (
            !body ||
            typeof body !== "object" ||
            Array.isArray(body)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid request body",
                },
                { status: 400 }
            );
        }

        // Only "checklist" is allowed at root level.
        const rootFields = Object.keys(body);

        const invalidRootFields = rootFields.filter(
            (field) => field !== "checklist"
        );

        if (invalidRootFields.length > 0) {
            console.log(
                `❌ [CHECKLIST UPDATE] Unsupported fields: ${invalidRootFields.join(
                    ", "
                )}`
            );

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Request contains unsupported fields",
                    fields: invalidRootFields,
                },
                { status: 400 }
            );
        }

        // --------------------------------------------------
        // 12. Validate checklist
        // --------------------------------------------------

        const { checklist } = body;

        if (!Array.isArray(checklist)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Checklist must be an array",
                },
                { status: 400 }
            );
        }

        if (checklist.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Checklist must contain at least one item",
                },
                { status: 400 }
            );
        }

        if (checklist.length > MAX_CHECKLIST_ITEMS) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Checklist cannot contain more than ${MAX_CHECKLIST_ITEMS} items`,
                },
                { status: 400 }
            );
        }

        // --------------------------------------------------
        // 13. Validate every checklist item
        // --------------------------------------------------

        const validatedChecklist = [];

        for (
            let index = 0;
            index < checklist.length;
            index++
        ) {
            const item = checklist[index];

            if (
                !item ||
                typeof item !== "object" ||
                Array.isArray(item)
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message: `Invalid checklist item at index ${index}`,
                    },
                    { status: 400 }
                );
            }

            // Only these fields are accepted.
            const allowedItemFields = [
                "item",
                "status",
                "remarks",
            ];

            const itemFields = Object.keys(item);

            const invalidFields = itemFields.filter(
                (field) =>
                    !allowedItemFields.includes(field)
            );

            if (invalidFields.length > 0) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            `Unsupported fields in checklist item ${index}`,
                        fields: invalidFields,
                    },
                    { status: 400 }
                );
            }

            // --------------------------------------------------
            // Validate item name
            // --------------------------------------------------

            if (
                typeof item.item !== "string" ||
                item.item.trim().length < 2
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            `Checklist item ${index + 1} must have a valid name`,
                    },
                    { status: 400 }
                );
            }

            if (item.item.trim().length > 200) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            `Checklist item ${index + 1} cannot exceed 200 characters`,
                    },
                    { status: 400 }
                );
            }

            // --------------------------------------------------
            // Validate status
            // --------------------------------------------------

            if (
                typeof item.status !== "string" ||
                !ALLOWED_STATUSES.includes(
                    item.status
                )
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            `Invalid status for checklist item ${index + 1}`,
                        allowedStatuses:
                            ALLOWED_STATUSES,
                    },
                    { status: 400 }
                );
            }

            // --------------------------------------------------
            // Validate remarks
            // --------------------------------------------------

            const remarks =
                item.remarks === undefined
                    ? ""
                    : item.remarks;

            if (typeof remarks !== "string") {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            `Remarks for checklist item ${index + 1} must be text`,
                    },
                    { status: 400 }
                );
            }

            if (remarks.length > 500) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            `Remarks for checklist item ${index + 1} cannot exceed 500 characters`,
                    },
                    { status: 400 }
                );
            }

            // --------------------------------------------------
            // Build sanitized item
            // --------------------------------------------------

            validatedChecklist.push({
                item: item.item.trim(),

                status: item.status,

                remarks: remarks.trim(),
            });
        }

        // --------------------------------------------------
        // 14. Save checklist
        // --------------------------------------------------

        inspection.checklist =
            validatedChecklist;

        // IMPORTANT:
        // Result is controlled by submission automation.
        // Inspector cannot manually change it here.
        inspection.result = "pending";

        await inspection.save();

        // --------------------------------------------------
        // 15. Return response
        // --------------------------------------------------

        console.log(
            `✅ [CHECKLIST UPDATE] Checklist updated: ${inspectionId}`
        );

        return NextResponse.json(
            {
                success: true,
                message:
                    "Checklist updated successfully",

                inspection: {
                    id: inspection._id.toString(),

                    status:
                        inspection.status,

                    result:
                        inspection.result,

                    checklist:
                        inspection.checklist,

                    updatedAt:
                        inspection.updatedAt,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(
            "❌ [CHECKLIST UPDATE] Failed"
        );

        console.error(
            "   └─",
            error.message
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to update checklist",
            },
            { status: 500 }
        );
    }
}