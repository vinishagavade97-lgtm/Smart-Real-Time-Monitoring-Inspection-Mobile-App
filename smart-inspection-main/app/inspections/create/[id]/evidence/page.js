"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Camera,
    Check,
    CheckCircle2,
    ClipboardCheck,
    CloudUpload,
    FileImage,
    ImagePlus,
    Loader2,
    MapPin,
    RefreshCw,
    Trash2,
    Upload,
    X,
} from "lucide-react";

const MAX_FILES = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

function normalizeEvidence(items = []) {
    return Array.isArray(items)
        ? items.map((item) => ({
            id:
                item?._id ||
                item?.id ||
                crypto.randomUUID(),

            url: item?.url || "",

            publicId:
                item?.publicId || "",

            caption:
                item?.caption || "",

            createdAt:
                item?.createdAt || null,
        }))
        : [];
}

export default function InspectionEvidencePage() {
    const params = useParams();
    const router = useRouter();

    const inspectionId = params?.id;

    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    const [inspection, setInspection] =
        useState(null);

    const [evidence, setEvidence] =
        useState([]);

    const [selectedFiles, setSelectedFiles] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [uploading, setUploading] =
        useState(false);

    const [deletingId, setDeletingId] =
        useState("");

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    /* =====================================================
       LOAD INSPECTION
    ====================================================== */

    useEffect(() => {
        if (!inspectionId) {
            return;
        }

        async function fetchInspection() {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `/api/inspections/${inspectionId}`,
                    {
                        method: "GET",
                        credentials: "include",
                        cache: "no-store",
                    }
                );

                const data =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        data?.message ||
                        "Unable to load inspection"
                    );
                }

                const currentInspection =
                    data.inspection;

                setInspection(
                    currentInspection
                );

                setEvidence(
                    normalizeEvidence(
                        currentInspection?.evidence
                    )
                );
            } catch (error) {
                console.error(
                    "❌ [EVIDENCE] Failed to load inspection:",
                    error
                );

                setError(
                    error.message ||
                    "Unable to load inspection"
                );
            } finally {
                setLoading(false);
            }
        }

        fetchInspection();
    }, [inspectionId]);

    /* =====================================================
       FILE VALIDATION
    ====================================================== */

    function validateFile(file) {
        if (!ALLOWED_TYPES.includes(file.type)) {
            return `${file.name}: only JPG, PNG and WEBP images are allowed.`;
        }

        if (file.size > MAX_FILE_SIZE) {
            return `${file.name}: maximum file size is 10 MB.`;
        }

        return "";
    }

    /* =====================================================
       ADD FILES TO QUEUE
    ====================================================== */

    function handleFiles(fileList) {
        setError("");
        setSuccess("");

        const incomingFiles =
            Array.from(fileList || []);

        if (!incomingFiles.length) {
            return;
        }

        const remainingSlots =
            MAX_FILES -
            evidence.length -
            selectedFiles.length;

        if (remainingSlots <= 0) {
            setError(
                `You can attach a maximum of ${MAX_FILES} photos.`
            );

            return;
        }

        const filesToProcess =
            incomingFiles.slice(
                0,
                remainingSlots
            );

        const invalidFile =
            filesToProcess.find(
                (file) => validateFile(file)
            );

        if (invalidFile) {
            setError(
                validateFile(invalidFile)
            );

            return;
        }

        const queued = filesToProcess.map(
            (file) => ({
                id: crypto.randomUUID(),
                file,
                preview:
                    URL.createObjectURL(file),
                caption: "",
            })
        );

        setSelectedFiles((current) => [
            ...current,
            ...queued,
        ]);
    }

    /* =====================================================
       FILE INPUT
    ====================================================== */

    function handleFileInput(event) {
        handleFiles(event.target.files);

        event.target.value = "";
    }

    /* =====================================================
       REMOVE QUEUED FILE
    ====================================================== */

    function removeQueuedFile(id) {
        setSelectedFiles((current) => {
            const target = current.find(
                (item) => item.id === id
            );

            if (target?.preview) {
                URL.revokeObjectURL(
                    target.preview
                );
            }

            return current.filter(
                (item) => item.id !== id
            );
        });
    }

    /* =====================================================
       UPDATE CAPTION
    ====================================================== */

    function updateCaption(id, value) {
        setSelectedFiles((current) =>
            current.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        caption: value,
                    }
                    : item
            )
        );
    }

    /* =====================================================
       UPLOAD ONE FILE
    ====================================================== */

    async function uploadSingleFile(
        queuedFile
    ) {
        const signatureResponse =
            await fetch(
                "/api/uploads/signature",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        inspectionId,
                    }),
                }
            );

        const signatureData =
            await signatureResponse.json();

        if (!signatureResponse.ok) {
            throw new Error(
                signatureData?.message ||
                "Unable to authorize image upload"
            );
        }

        const {
            signature,
            timestamp,
            apiKey,
            cloudName,
            folder,
        } = signatureData;

        if (
            !signature ||
            !timestamp ||
            !apiKey ||
            !cloudName
        ) {
            throw new Error(
                "Invalid Cloudinary upload authorization."
            );
        }

        const uploadData =
            new FormData();

        uploadData.append(
            "file",
            queuedFile.file
        );

        uploadData.append(
            "api_key",
            apiKey
        );

        uploadData.append(
            "timestamp",
            String(timestamp)
        );

        uploadData.append(
            "signature",
            signature
        );

        if (folder) {
            uploadData.append(
                "folder",
                folder
            );
        }

        const cloudinaryResponse =
            await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                {
                    method: "POST",
                    body: uploadData,
                }
            );

        const cloudinaryData =
            await cloudinaryResponse.json();

        if (!cloudinaryResponse.ok) {
            throw new Error(
                cloudinaryData?.error?.message ||
                "Cloudinary upload failed"
            );
        }

        if (
            !cloudinaryData.secure_url ||
            !cloudinaryData.public_id
        ) {
            throw new Error(
                "Cloudinary returned an invalid upload response."
            );
        }

        const evidenceResponse =
            await fetch(
                `/api/inspections/${inspectionId}/evidence`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        url:
                            cloudinaryData.secure_url,

                        publicId:
                            cloudinaryData.public_id,

                        caption:
                            queuedFile.caption.trim(),
                    }),
                }
            );

        const evidenceData =
            await evidenceResponse.json();

        if (!evidenceResponse.ok) {
            throw new Error(
                evidenceData?.message ||
                "Unable to attach evidence to inspection"
            );
        }

        return (
            evidenceData?.inspection ||
            null
        );
    }

    /* =====================================================
       UPLOAD ALL FILES
    ====================================================== */

    async function uploadEvidence() {
        if (!selectedFiles.length) {
            setError(
                "Select at least one image first."
            );

            return;
        }

        if (
            evidence.length +
            selectedFiles.length >
            MAX_FILES
        ) {
            setError(
                `You can attach a maximum of ${MAX_FILES} photos.`
            );

            return;
        }

        try {
            setUploading(true);
            setError("");
            setSuccess("");

            let latestInspection =
                inspection;

            for (
                const queuedFile of selectedFiles
            ) {
                console.log(
                    "📷 [EVIDENCE] Uploading:",
                    queuedFile.file.name
                );

                latestInspection =
                    await uploadSingleFile(
                        queuedFile
                    );
            }

            if (latestInspection) {
                setInspection(
                    latestInspection
                );

                setEvidence(
                    normalizeEvidence(
                        latestInspection.evidence
                    )
                );
            } else {
                const refreshResponse =
                    await fetch(
                        `/api/inspections/${inspectionId}`,
                        {
                            credentials:
                                "include",
                            cache: "no-store",
                        }
                    );

                const refreshData =
                    await refreshResponse.json();

                if (refreshResponse.ok) {
                    setInspection(
                        refreshData.inspection
                    );

                    setEvidence(
                        normalizeEvidence(
                            refreshData
                                .inspection
                                ?.evidence
                        )
                    );
                }
            }

            selectedFiles.forEach(
                (item) => {
                    if (item.preview) {
                        URL.revokeObjectURL(
                            item.preview
                        );
                    }
                }
            );

            setSelectedFiles([]);

            setSuccess(
                "Evidence uploaded successfully."
            );
        } catch (error) {
            console.error(
                "❌ [EVIDENCE] Upload failed:",
                error
            );

            setError(
                error.message ||
                "Unable to upload evidence"
            );
        } finally {
            setUploading(false);
        }
    }

    /* =====================================================
       DELETE UPLOADED EVIDENCE
    ====================================================== */

    async function deleteEvidence(
        evidenceId
    ) {
        if (
            uploading ||
            deletingId
        ) {
            return;
        }

        try {
            setDeletingId(evidenceId);
            setError("");
            setSuccess("");

            const response =
                await fetch(
                    `/api/inspections/${inspectionId}/evidence/${evidenceId}`,
                    {
                        method: "DELETE",
                        credentials:
                            "include",
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    "Unable to remove evidence"
                );
            }

            const updatedInspection =
                data?.inspection;

            if (updatedInspection) {
                setInspection(
                    updatedInspection
                );

                setEvidence(
                    normalizeEvidence(
                        updatedInspection.evidence
                    )
                );
            } else {
                setEvidence(
                    (current) =>
                        current.filter(
                            (item) =>
                                item.id !==
                                evidenceId
                        )
                );
            }

            setSuccess(
                "Evidence removed successfully."
            );
        } catch (error) {
            console.error(
                "❌ [EVIDENCE] Delete failed:",
                error
            );

            setError(
                error.message ||
                "Unable to remove evidence"
            );
        } finally {
            setDeletingId("");
        }
    }

    /* =====================================================
       REFRESH
    ====================================================== */

    async function refreshEvidence() {
        try {
            setError("");
            setSuccess("");

            const response =
                await fetch(
                    `/api/inspections/${inspectionId}`,
                    {
                        credentials:
                            "include",
                        cache: "no-store",
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    "Unable to refresh inspection"
                );
            }

            setInspection(
                data.inspection
            );

            setEvidence(
                normalizeEvidence(
                    data.inspection?.evidence
                )
            );

            setSuccess(
                "Evidence refreshed."
            );
        } catch (error) {
            setError(
                error.message ||
                "Unable to refresh evidence"
            );
        }
    }

    /* =====================================================
       CONTINUE
    ====================================================== */

    function handleContinue() {
        if (evidence.length === 0) {
            setError(
                "Add at least one evidence photo before continuing."
            );

            return;
        }

        router.push(
            `/inspections/create/${inspectionId}/review`
        );
    }

    /* =====================================================
       COUNTS
    ====================================================== */

    const remainingSlots =
        MAX_FILES -
        evidence.length -
        selectedFiles.length;

    /* =====================================================
       LOADING
    ====================================================== */

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC]">
                <main className="px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-[980px]">
                        <div className="animate-pulse">
                            <div className="h-4 w-32 rounded bg-slate-200" />

                            <div className="mt-5 h-16 rounded-2xl bg-white ring-1 ring-slate-200" />

                            <div className="mt-4 h-[480px] rounded-2xl bg-white ring-1 ring-slate-200" />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    /* =====================================================
       ERROR
    ====================================================== */

    if (error && !inspection) {
        return (
            <div className="min-h-screen bg-[#F8FAFC]">
                <main className="px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-[980px]">
                        <div className="rounded-2xl border border-red-100 bg-white px-6 py-16 text-center shadow-sm">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600">
                                <AlertCircle
                                    size={20}
                                />
                            </div>

                            <h1 className="mt-4 text-sm font-semibold text-slate-900">
                                Unable to load inspection
                            </h1>

                            <p className="mx-auto mt-2 max-w-md text-xs text-slate-500">
                                {error}
                            </p>

                            <Link
                                href="/inspections"
                                className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-4 text-xs font-semibold text-slate-600"
                            >
                                <ArrowLeft
                                    size={14}
                                />
                                Back to inspections
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    /* =====================================================
       SUBMITTED PROTECTION
    ====================================================== */

    if (
        inspection?.status ===
        "submitted"
    ) {
        return (
            <div className="min-h-screen bg-[#F8FAFC]">
                <main className="px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-[980px]">
                        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                            <CheckCircle2
                                size={32}
                                className="mx-auto text-emerald-600"
                            />

                            <h1 className="mt-4 text-sm font-semibold text-slate-900">
                                Inspection already submitted
                            </h1>

                            <p className="mt-2 text-xs text-slate-500">
                                This inspection is locked.
                            </p>

                            <Link
                                href={`/inspections/${inspectionId}`}
                                className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white"
                            >
                                View inspection
                                <ArrowRight
                                    size={14}
                                />
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    /* =====================================================
       MAIN
    ====================================================== */

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <main className="px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-[980px]">

                    {/* BACK */}

                    <div className="mb-4">
                        <Link
                            href={`/inspections/create/${inspectionId}/checklist`}
                            className="group inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-800"
                        >
                            <ArrowLeft
                                size={15}
                                className="transition-transform group-hover:-translate-x-0.5"
                            />
                            Back to checklist
                        </Link>
                    </div>

                    {/* HEADER */}

                    <div className="mb-4 flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
                                <Camera
                                    size={18}
                                    strokeWidth={1.8}
                                />
                            </div>

                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-600">
                                    Step 3 of 4
                                </p>

                                <h1 className="mt-1 font-[Sora] text-xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-2xl">
                                    Evidence & photos
                                </h1>

                                <p className="mt-1 text-xs text-slate-400">
                                    Capture visual evidence for this inspection.
                                </p>
                            </div>
                        </div>

                        <span className="hidden rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-semibold text-blue-700 sm:inline-flex">
                            Draft
                        </span>
                    </div>

                    {/* STEPS */}

                    <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-5">
                        <div className="flex items-center">

                            <div className="flex items-center gap-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-700">
                                    <Check size={13} />
                                </span>

                                <span className="hidden text-[11px] font-semibold text-slate-700 sm:block">
                                    Basic information
                                </span>
                            </div>

                            <div className="mx-3 h-px flex-1 bg-blue-200" />

                            <div className="flex items-center gap-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-700">
                                    <Check size={13} />
                                </span>

                                <span className="hidden text-[11px] font-semibold text-slate-700 sm:block">
                                    Checklist
                                </span>
                            </div>

                            <div className="mx-3 h-px flex-1 bg-blue-200" />

                            <div className="flex items-center gap-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                                    3
                                </span>

                                <span className="text-[11px] font-semibold text-slate-800">
                                    Evidence
                                </span>
                            </div>

                            <div className="mx-3 h-px flex-1 bg-slate-200" />

                            <div className="flex items-center gap-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-400">
                                    4
                                </span>

                                <span className="hidden text-[11px] font-medium text-slate-400 sm:block">
                                    Review
                                </span>
                            </div>

                        </div>
                    </div>

                    {/* CONTEXT */}

                    <div className="mb-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                                Asset
                            </p>

                            <p className="mt-1 truncate text-xs font-semibold text-slate-800">
                                {inspection?.assetName}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                                Location
                            </p>

                            <div className="mt-1 flex items-center gap-1.5">
                                <MapPin
                                    size={12}
                                    className="text-emerald-600"
                                />

                                <span className="text-xs font-semibold text-slate-800">
                                    GPS captured
                                </span>
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                                Evidence
                            </p>

                            <p className="mt-1 text-xs font-semibold text-slate-800">
                                {evidence.length}/
                                {MAX_FILES} photos
                            </p>
                        </div>
                    </div>

                    {/* MAIN CARD */}

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/30">

                        {/* UPLOAD AREA */}

                        <div className="border-b border-slate-100 p-5 sm:p-6">

                            <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/30 px-5 py-8 text-center">

                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-blue-100 bg-white text-blue-600 shadow-sm">
                                    <CloudUpload
                                        size={21}
                                        strokeWidth={1.7}
                                    />
                                </div>

                                <h2 className="mt-4 text-sm font-semibold text-slate-900">
                                    Add inspection evidence
                                </h2>

                                <p className="mx-auto mt-1.5 max-w-md text-[10px] leading-5 text-slate-400">
                                    Upload clear photos showing the condition of the asset or inspection point.
                                </p>

                                <div className="mt-4 flex flex-col items-center justify-center gap-2 sm:flex-row">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        disabled={
                                            uploading ||
                                            remainingSlots <=
                                            0
                                        }
                                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-40"
                                    >
                                        <ImagePlus
                                            size={14}
                                        />

                                        Choose photos
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            cameraInputRef.current?.click()
                                        }
                                        disabled={
                                            uploading ||
                                            remainingSlots <=
                                            0
                                        }
                                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
                                    >
                                        <Camera
                                            size={14}
                                        />

                                        Take photo
                                    </button>
                                </div>

                                <p className="mt-3 text-[9px] font-medium text-slate-400">
                                    JPG, PNG or WEBP · Max 10 MB each · Up to 10 photos
                                </p>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                onChange={
                                    handleFileInput
                                }
                                className="hidden"
                            />

                            <input
                                ref={cameraInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={
                                    handleFileInput
                                }
                                className="hidden"
                            />
                        </div>

                        {/* QUEUED FILES */}

                        {selectedFiles.length >
                            0 && (
                                <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

                                    <div className="mb-3 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xs font-semibold text-slate-900">
                                                Ready to upload
                                            </h3>

                                            <p className="mt-0.5 text-[9px] text-slate-400">
                                                Add an optional caption to each photo.
                                            </p>
                                        </div>

                                        <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[9px] font-semibold text-blue-700">
                                            {
                                                selectedFiles.length
                                            }{" "}
                                            selected
                                        </span>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {selectedFiles.map(
                                            (
                                                item
                                            ) => (
                                                <div
                                                    key={
                                                        item.id
                                                    }
                                                    className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-2.5"
                                                >
                                                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                                                        <img
                                                            src={
                                                                item.preview
                                                            }
                                                            alt="Selected evidence"
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <p className="truncate text-[10px] font-semibold text-slate-700">
                                                                {
                                                                    item
                                                                        .file
                                                                        .name
                                                                }
                                                            </p>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeQueuedFile(
                                                                        item.id
                                                                    )
                                                                }
                                                                disabled={
                                                                    uploading
                                                                }
                                                                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600"
                                                            >
                                                                <X
                                                                    size={
                                                                        13
                                                                    }
                                                                />
                                                            </button>
                                                        </div>

                                                        <input
                                                            type="text"
                                                            value={
                                                                item.caption
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                updateCaption(
                                                                    item.id,
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Caption / observation..."
                                                            maxLength={
                                                                300
                                                            }
                                                            disabled={
                                                                uploading
                                                            }
                                                            className="mt-2 h-8 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-[10px] outline-none placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={
                                            uploadEvidence
                                        }
                                        disabled={
                                            uploading
                                        }
                                        className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-60"
                                    >
                                        {uploading ? (
                                            <>
                                                <Loader2
                                                    size={
                                                        14
                                                    }
                                                    className="animate-spin"
                                                />
                                                Uploading evidence...
                                            </>
                                        ) : (
                                            <>
                                                <Upload
                                                    size={
                                                        14
                                                    }
                                                />
                                                Upload{" "}
                                                {
                                                    selectedFiles.length
                                                }{" "}
                                                photo
                                                {selectedFiles.length >
                                                    1
                                                    ? "s"
                                                    : ""}
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                        {/* UPLOADED EVIDENCE */}

                        <div className="px-5 py-5 sm:px-6">

                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900">
                                        Uploaded evidence
                                    </h3>

                                    <p className="mt-1 text-[10px] text-slate-400">
                                        Evidence already attached to this inspection.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        refreshEvidence
                                    }
                                    disabled={
                                        uploading ||
                                        !!deletingId
                                    }
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                                    title="Refresh evidence"
                                >
                                    <RefreshCw
                                        size={13}
                                    />
                                </button>
                            </div>

                            {evidence.length ===
                                0 ? (
                                <div className="rounded-xl border border-slate-200 bg-slate-50/50 px-6 py-10 text-center">
                                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400">
                                        <FileImage
                                            size={18}
                                        />
                                    </div>

                                    <h4 className="mt-3 text-xs font-semibold text-slate-800">
                                        No evidence uploaded yet
                                    </h4>

                                    <p className="mt-1 text-[10px] text-slate-400">
                                        Add at least one photo to continue.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    {evidence.map(
                                        (
                                            item,
                                            index
                                        ) => (
                                            <div
                                                key={
                                                    item.id
                                                }
                                                className="group overflow-hidden rounded-xl border border-slate-200 bg-white"
                                            >
                                                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                                                    <img
                                                        src={
                                                            item.url
                                                        }
                                                        alt={
                                                            item.caption ||
                                                            `Evidence ${index + 1}`
                                                        }
                                                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                                                    />

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            deleteEvidence(
                                                                item.id
                                                            )
                                                        }
                                                        disabled={
                                                            uploading ||
                                                            !!deletingId
                                                        }
                                                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg border border-white/70 bg-white/90 text-slate-500 shadow-sm backdrop-blur-sm transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                                        title="Remove evidence"
                                                    >
                                                        {deletingId ===
                                                            item.id ? (
                                                            <Loader2
                                                                size={
                                                                    14
                                                                }
                                                                className="animate-spin"
                                                            />
                                                        ) : (
                                                            <Trash2
                                                                size={
                                                                    14
                                                                }
                                                            />
                                                        )}
                                                    </button>

                                                    <span className="absolute bottom-2 left-2 rounded-md border border-white/60 bg-white/90 px-2 py-1 text-[8px] font-bold text-slate-600 backdrop-blur-sm">
                                                        #{String(
                                                            index +
                                                            1
                                                        ).padStart(
                                                            2,
                                                            "0"
                                                        )}
                                                    </span>
                                                </div>

                                                <div className="p-3">
                                                    <p className="line-clamp-2 min-h-[28px] text-[10px] font-medium leading-4 text-slate-500">
                                                        {item.caption ||
                                                            "No caption added"}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>

                        {/* FEEDBACK */}

                        {(error ||
                            success) && (
                                <div className="border-t border-slate-100 px-5 py-3 sm:px-6">
                                    {error && (
                                        <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5">
                                            <AlertCircle
                                                size={14}
                                                className="mt-0.5 shrink-0 text-red-600"
                                            />

                                            <p className="text-[10px] font-semibold leading-4 text-red-700">
                                                {error}
                                            </p>
                                        </div>
                                    )}

                                    {success && (
                                        <div className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2.5">
                                            <CheckCircle2
                                                size={14}
                                                className="shrink-0 text-emerald-600"
                                            />

                                            <p className="text-[10px] font-semibold text-emerald-700">
                                                {success}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                        {/* FOOTER */}

                        <div className="flex flex-col-reverse gap-2.5 border-t border-slate-100 bg-white px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                            <Link
                                href={`/inspections/create/${inspectionId}/checklist`}
                                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                            >
                                <ArrowLeft
                                    size={13}
                                />
                                Back to checklist
                            </Link>

                            <button
                                type="button"
                                onClick={
                                    handleContinue
                                }
                                disabled={
                                    uploading ||
                                    evidence.length ===
                                    0
                                }
                                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-[11px] font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                            >
                                Continue to review
                                <ArrowRight
                                    size={14}
                                />
                            </button>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}