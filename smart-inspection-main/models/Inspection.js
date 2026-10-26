import mongoose from "mongoose";

const checklistItemSchema = new mongoose.Schema(
    {
        item: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        status: {
            type: String,
            enum: ["pass", "warning", "failed"],
            default: "pass",
        },
        remarks: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
        },
    },
    {
        _id: true,
    }
);

const evidenceSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: true,
            trim: true,
        },
        publicId: {
            type: String,
            required: true,
            trim: true,
        },
        caption: {
            type: String,
            trim: true,
            maxlength: 300,
            default: "",
        },
    },
    {
        _id: true,
        timestamps: true,
    }
);

const inspectionSchema = new mongoose.Schema(
    {
        assetName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 150,
        },

        location: {
            latitude: {
                type: Number,
                required: true,
                min: -90,
                max: 90,
            },
            longitude: {
                type: Number,
                required: true,
                min: -180,
                max: 180,
            },
        },

        inspectionType: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100,
        },

        inspectedAt: {
            type: Date,
            required: true,
        },

        submittedAt: {
            type: Date,
            default: null,
        },

        inspector: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        status: {
            type: String,
            enum: ["draft", "submitted"],
            default: "draft",
            index: true,
        },

        result: {
            type: String,
            enum: ["pending", "passed", "warning", "failed"],
            default: "pending",
            index: true,
        },

        checklist: {
            type: [checklistItemSchema],
            default: [],
        },

        evidence: {
            type: [evidenceSchema],
            default: [],
        },

        remarks: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

const Inspection =
    mongoose.models.Inspection ||
    mongoose.model("Inspection", inspectionSchema);

export default Inspection;