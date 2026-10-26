"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
    CheckCircle2,
    Loader2,
    LogOut,
    Mail,
    RefreshCw,
    Save,
    ShieldCheck,
    User,
    UserCog,
} from "lucide-react";

import DashboardSidebar from "../components/layout/DashboardSidebar";
import DashboardHeader from "../components/layout/DashboardHeader";
import MobileSidebar from "../components/layout/MobileSidebar";

export default function SettingsPage() {
    const router = useRouter();

    // =========================================================
    // USER
    // =========================================================

    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    // =========================================================
    // FORM
    // =========================================================

    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [saveSuccess, setSaveSuccess] = useState("");

    // =========================================================
    // LOGOUT
    // =========================================================

    const [loggingOut, setLoggingOut] = useState(false);

    // =========================================================
    // MOBILE SIDEBAR
    // =========================================================

    const [mobileSidebarOpen, setMobileSidebarOpen] =
        useState(false);

    // =========================================================
    // LOAD USER
    // =========================================================

    const loadUser = useCallback(async () => {
        try {
            setLoadingUser(true);

            const response = await fetch("/api/auth/me", {
                method: "GET",
                credentials: "include",
                cache: "no-store",
            });

            const data = await response.json();

            if (response.status === 401) {
                router.replace("/login");
                return;
            }

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to load account details."
                );
            }

            setUser(data.user);
            setName(data.user?.name || "");
        } catch (error) {
            console.error("Settings user load error:", error);
        } finally {
            setLoadingUser(false);
        }
    }, [router]);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    // =========================================================
    // SAVE PROFILE
    // =========================================================

    const handleSave = async (event) => {
        event.preventDefault();

        setSaveError("");
        setSaveSuccess("");

        const trimmedName = name.trim();

        if (trimmedName.length < 2) {
            setSaveError(
                "Full name must contain at least 2 characters."
            );
            return;
        }

        if (trimmedName.length > 100) {
            setSaveError(
                "Full name cannot exceed 100 characters."
            );
            return;
        }

        try {
            setSaving(true);

            const response = await fetch("/api/auth/profile", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    name: trimmedName,
                }),
            });

            const data = await response.json();

            if (response.status === 401) {
                router.replace("/login");
                return;
            }

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to update profile."
                );
            }

            setUser(data.user);
            setName(data.user?.name || trimmedName);
            setSaveSuccess(
                "Your account details have been updated."
            );
        } catch (error) {
            console.error("Profile update error:", error);

            setSaveError(
                error.message ||
                "Something went wrong while saving your changes."
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = async () => {
        try {
            setLoggingOut(true);

            await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            router.replace("/login");
        }
    };

    // =========================================================
    // HELPERS
    // =========================================================

    const userRole =
        user?.role === "admin"
            ? "Administrator"
            : "Inspector";

    const initials =
        user?.name
            ?.split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((word) =>
                word.charAt(0).toUpperCase()
            )
            .join("") || "I";

    // =========================================================
    // LOADING
    // =========================================================

    if (loadingUser) {
        return (
            <div className="min-h-screen bg-slate-50">
                <DashboardSidebar />

                <div className="lg:pl-[260px]">
                    <DashboardHeader
                        user={null}
                        title="Settings"
                        subtitle="Account settings"
                        onMenuClick={() =>
                            setMobileSidebarOpen(true)
                        }
                        onLogout={handleLogout}
                    />

                    <main className="px-4 py-6 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-5xl">
                            <div className="animate-pulse">
                                <div className="h-7 w-28 rounded-lg bg-slate-200" />

                                <div className="mt-2 h-4 w-72 rounded bg-slate-200" />

                                <div className="mt-8 h-[330px] rounded-2xl border border-slate-200 bg-white" />

                                <div className="mt-5 h-[190px] rounded-2xl border border-slate-200 bg-white" />
                            </div>
                        </div>
                    </main>
                </div>

                <MobileSidebar
                    open={mobileSidebarOpen}
                    onClose={() =>
                        setMobileSidebarOpen(false)
                    }
                />
            </div>
        );
    }

    // =========================================================
    // PAGE
    // =========================================================

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Desktop Sidebar */}
            <DashboardSidebar />

            {/* Main Application */}
            <div className="lg:pl-[260px]">
                {/* Header */}
                <DashboardHeader
                    user={user}
                    title="Settings"
                    subtitle="Account settings"
                    onMenuClick={() =>
                        setMobileSidebarOpen(true)
                    }
                    onLogout={handleLogout}
                />

                {/* Content */}
                <main className="px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-5xl">
                        {/* =================================================
                            PAGE HEADING
                        ================================================== */}

                        <div className="mb-7">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-600">
                                Account
                            </p>

                            <h2 className="mt-1.5 font-[Sora] text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                                Settings
                            </h2>

                            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                                Manage your account information and
                                application access.
                            </p>
                        </div>

                        {/* =================================================
                            ACCOUNT CARD
                        ================================================== */}

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            {/* Card Header */}
                            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                        <UserCog
                                            size={19}
                                            strokeWidth={1.9}
                                        />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-900">
                                            Account information
                                        </h3>

                                        <p className="mt-0.5 text-xs text-slate-400">
                                            Update your basic account details.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Form */}
                            <form
                                onSubmit={handleSave}
                                className="p-5 sm:p-6"
                            >
                                <div className="grid gap-5 md:grid-cols-2">
                                    {/* Full Name */}
                                    <div>
                                        <label
                                            htmlFor="settings-name"
                                            className="mb-2 block text-xs font-semibold text-slate-700"
                                        >
                                            Full name
                                        </label>

                                        <div className="relative">
                                            <User
                                                size={16}
                                                strokeWidth={1.8}
                                                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                            />

                                            <input
                                                id="settings-name"
                                                type="text"
                                                value={name}
                                                onChange={(event) => {
                                                    setName(
                                                        event.target
                                                            .value
                                                    );
                                                    setSaveError("");
                                                    setSaveSuccess("");
                                                }}
                                                disabled={saving}
                                                autoComplete="name"
                                                placeholder="Enter your full name"
                                                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label
                                            htmlFor="settings-email"
                                            className="mb-2 block text-xs font-semibold text-slate-700"
                                        >
                                            Email address
                                        </label>

                                        <div className="relative">
                                            <Mail
                                                size={16}
                                                strokeWidth={1.8}
                                                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                            />

                                            <input
                                                id="settings-email"
                                                type="email"
                                                value={
                                                    user?.email || ""
                                                }
                                                readOnly
                                                className="h-11 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-500 outline-none"
                                            />
                                        </div>

                                        <p className="mt-1.5 text-[10px] text-slate-400">
                                            Email address cannot be changed
                                            from settings.
                                        </p>
                                    </div>

                                    {/* Role */}
                                    <div>
                                        <label className="mb-2 block text-xs font-semibold text-slate-700">
                                            Account role
                                        </label>

                                        <div className="flex h-11 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5">
                                            <ShieldCheck
                                                size={16}
                                                strokeWidth={1.8}
                                                className="text-slate-400"
                                            />

                                            <span className="text-sm font-medium text-slate-700">
                                                {userRole}
                                            </span>

                                            <span className="ml-auto rounded-full border border-slate-200 bg-white px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                                                Assigned
                                            </span>
                                        </div>
                                    </div>

                                    {/* Account Status */}
                                    <div>
                                        <label className="mb-2 block text-xs font-semibold text-slate-700">
                                            Account status
                                        </label>

                                        <div className="flex h-11 items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3.5">
                                            <CheckCircle2
                                                size={16}
                                                strokeWidth={1.9}
                                                className="text-emerald-600"
                                            />

                                            <span className="text-sm font-medium text-emerald-700">
                                                Active
                                            </span>

                                            <span className="ml-auto text-[10px] font-medium text-emerald-600">
                                                Secure
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Feedback */}
                                {saveError && (
                                    <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                                        {saveError}
                                    </div>
                                )}

                                {saveSuccess && (
                                    <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700">
                                        <CheckCircle2
                                            size={15}
                                            strokeWidth={2}
                                        />

                                        <span>{saveSuccess}</span>
                                    </div>
                                )}

                                {/* Form Footer */}
                                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-[10px] leading-5 text-slate-400">
                                        Only your name can be changed from
                                        this page.
                                    </p>

                                    <button
                                        type="submit"
                                        disabled={
                                            saving ||
                                            !name.trim()
                                        }
                                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2
                                                    size={15}
                                                    className="animate-spin"
                                                />

                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save
                                                    size={15}
                                                    strokeWidth={2}
                                                />

                                                Save changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </section>

                        {/* =================================================
                            SESSION CARD
                        ================================================== */}

                        <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="p-5 sm:p-6">
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                            <ShieldCheck
                                                size={19}
                                                strokeWidth={1.9}
                                            />
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-900">
                                                Session
                                            </h3>

                                            <p className="mt-1 max-w-lg text-xs leading-5 text-slate-500">
                                                You are currently signed in as{" "}
                                                <span className="font-semibold text-slate-700">
                                                    {userRole}
                                                </span>
                                                . Your session is protected
                                                by secure authentication.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        disabled={loggingOut}
                                        className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-xs font-semibold text-red-600 transition hover:bg-red-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {loggingOut ? (
                                            <>
                                                <Loader2
                                                    size={15}
                                                    className="animate-spin"
                                                />

                                                Logging out...
                                            </>
                                        ) : (
                                            <>
                                                <LogOut
                                                    size={15}
                                                    strokeWidth={1.9}
                                                />

                                                Log out
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* =================================================
                            FOOTER NOTE
                        ================================================== */}

                        <div className="mt-5 flex items-center justify-center gap-2 pb-6 text-[10px] font-medium text-slate-400">
                            <ShieldCheck
                                size={13}
                                strokeWidth={1.8}
                            />

                            <span>
                                Smart Inspection account settings
                            </span>
                        </div>
                    </div>
                </main>
            </div>

            {/* Mobile Sidebar */}
            <MobileSidebar
                open={mobileSidebarOpen}
                onClose={() =>
                    setMobileSidebarOpen(false)
                }
            />
        </div>
    );
}