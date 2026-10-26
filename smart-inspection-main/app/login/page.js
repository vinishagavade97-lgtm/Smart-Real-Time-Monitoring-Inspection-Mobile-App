"use client";

import { useState } from "react";
import Link from "next/link";

import {
    ClipboardCheck,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    CheckCircle2,
    ShieldCheck,
} from "lucide-react";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");
        setLoading(true);

        const formData = new FormData(e.currentTarget);

        const email = formData.get("email");
        const password = formData.get("password");

        try {
            console.log("🔐 [UI] Sending login request...");

            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error(
                    "❌ [UI] Login failed:",
                    data.message
                );

                setError(
                    data.message ||
                    "Invalid email or password."
                );

                return;
            }

            console.log("✅ [UI] Login successful");

            setSuccess("Login successful. Redirecting...");

            /*
             * Admin → Admin Dashboard
             * Inspector → Inspector Dashboard
             */
            setTimeout(() => {
                window.location.href =
                    data.user?.role === "admin"
                        ? "/admin/dashboard"
                        : "/dashboard";
            }, 700);
        } catch (error) {
            console.error(
                "❌ [UI] Login request failed:",
                error
            );

            setError(
                "Unable to connect to the server. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50">
            <div className="grid min-h-screen lg:grid-cols-2">

                {/* =====================================================
                    LEFT — BRAND / PRODUCT SIDE
                ===================================================== */}

                <section className="relative hidden overflow-hidden bg-slate-950 lg:flex">

                    {/* Subtle Background */}

                    <div className="absolute inset-0">

                        <div className="absolute left-[-120px] top-[-120px] h-[420px] w-[420px] rounded-full bg-blue-600/[0.08] blur-[120px]" />

                        <div className="absolute bottom-[-150px] right-[-100px] h-[420px] w-[420px] rounded-full bg-blue-500/[0.06] blur-[120px]" />

                        <div
                            className="absolute inset-0 opacity-[0.025]"
                            style={{
                                backgroundImage:
                                    "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
                                backgroundSize: "48px 48px",
                            }}
                        />

                    </div>

                    <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">

                        {/* Logo */}

                        <Link
                            href="/"
                            className="inline-flex w-fit items-center gap-3"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                                <ClipboardCheck
                                    size={20}
                                    strokeWidth={2.2}
                                />
                            </div>

                            <div>
                                <p className="font-[family-name:var(--font-sora)] text-sm font-semibold text-white">
                                    Smart Inspection
                                </p>

                                <p className="text-[10px] text-slate-400">
                                    Inspection management
                                </p>
                            </div>
                        </Link>

                        {/* Main Message */}

                        <div className="max-w-xl">

                            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-blue-400">
                                Inspection Management
                            </p>

                            <h1 className="font-[family-name:var(--font-sora)] text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">
                                Manage every inspection

                                <span className="block text-blue-500">
                                    with confidence.
                                </span>
                            </h1>

                            <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
                                Record inspections, capture evidence, monitor
                                activity, and get automated results from one
                                organized platform.
                            </p>

                            <div className="mt-8 space-y-3">

                                <LoginHighlight>
                                    Digital inspection workflows
                                </LoginHighlight>

                                <LoginHighlight>
                                    Real-time monitoring
                                </LoginHighlight>

                                <LoginHighlight>
                                    Automated inspection results
                                </LoginHighlight>

                            </div>

                        </div>

                        {/* Bottom */}

                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <ShieldCheck size={14} />
                            Secure inspection management
                        </div>

                    </div>
                </section>

                {/* =====================================================
                    RIGHT — LOGIN AREA
                ===================================================== */}

                <section className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-6 sm:px-6 sm:py-10 lg:px-12">

                    <div className="w-full max-w-md">

                        {/* PREMIUM AUTH CARD */}

                        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.07)] sm:p-8">

                            {/* Mobile Logo */}

                            <Link
                                href="/"
                                className="mb-8 flex items-center gap-3 lg:hidden"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20">
                                    <ClipboardCheck
                                        size={20}
                                        strokeWidth={2.2}
                                    />
                                </div>

                                <div>
                                    <p className="font-[family-name:var(--font-sora)] text-sm font-bold tracking-tight text-slate-950">
                                        Smart Inspection
                                    </p>

                                    <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-slate-400">
                                        Smart Automation
                                    </p>
                                </div>
                            </Link>

                            {/* Header */}

                            <div>

                                <p className="text-sm font-semibold text-blue-600">
                                    Welcome back
                                </p>

                                <h2 className="mt-2 font-[family-name:var(--font-sora)] text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                                    Sign in to your account
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-slate-500">
                                    Enter your credentials to access the
                                    inspection dashboard.
                                </p>

                            </div>

                            {/* Error */}

                            {error && (
                                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-600">
                                    {error}
                                </div>
                            )}

                            {/* Success */}

                            {success && (
                                <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-5 text-green-600">
                                    {success}
                                </div>
                            )}

                            {/* Login Form */}

                            <form
                                onSubmit={handleSubmit}
                                className="mt-8"
                            >

                                {/* Email */}

                                <div>

                                    <label
                                        htmlFor="email"
                                        className="mb-2 block text-sm font-medium text-slate-700"
                                    >
                                        Email address
                                    </label>

                                    <div className="relative">

                                        <Mail
                                            size={17}
                                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                        />

                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            placeholder="you@example.com"
                                            required
                                            disabled={loading}
                                            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                                        />

                                    </div>

                                </div>

                                {/* Password */}

                                <div className="mt-5">

                                    <div className="mb-2 flex items-center justify-between">

                                        <label
                                            htmlFor="password"
                                            className="text-sm font-medium text-slate-700"
                                        >
                                            Password
                                        </label>

                                        <Link
                                            href="/forgot-password"
                                            className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
                                        >
                                            Forgot password?
                                        </Link>

                                    </div>

                                    <div className="relative">

                                        <Lock
                                            size={17}
                                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                        />

                                        <input
                                            id="password"
                                            name="password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            autoComplete="current-password"
                                            placeholder="Enter your password"
                                            required
                                            disabled={loading}
                                            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-11 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                                        />

                                        <button
                                            type="button"
                                            disabled={loading}
                                            onClick={() =>
                                                setShowPassword(
                                                    !showPassword
                                                )
                                            }
                                            aria-label={
                                                showPassword
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600 disabled:cursor-not-allowed"
                                        >
                                            {showPassword ? (
                                                <EyeOff size={17} />
                                            ) : (
                                                <Eye size={17} />
                                            )}
                                        </button>

                                    </div>

                                </div>

                                {/* Remember Me */}

                                <div className="mt-5">

                                    <label className="flex cursor-pointer items-center gap-2.5">

                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) =>
                                                setRememberMe(
                                                    e.target.checked
                                                )
                                            }
                                            disabled={loading}
                                            className="h-4 w-4 rounded border-slate-300 accent-blue-600 focus:ring-blue-500"
                                        />

                                        <span className="text-sm text-slate-600">
                                            Remember me
                                        </span>

                                    </label>

                                </div>

                                {/* Sign In */}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(37,99,235,0.16)] transition-all duration-200 hover:bg-blue-700 hover:shadow-[0_10px_28px_rgba(37,99,235,0.22)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                                >

                                    {loading
                                        ? "Signing in..."
                                        : "Sign In"}

                                    {!loading && (
                                        <ArrowRight
                                            size={16}
                                            className="transition-transform duration-200 group-hover:translate-x-1"
                                        />
                                    )}

                                </button>

                            </form>

                            {/* Divider */}

                            <div className="my-7 flex items-center gap-3">

                                <div className="h-px flex-1 bg-slate-200" />

                                <span className="whitespace-nowrap text-[11px] font-medium text-slate-400">
                                    New to Smart Inspection?
                                </span>

                                <div className="h-px flex-1 bg-slate-200" />

                            </div>

                            {/* Create Account */}

                            <Link
                                href="/register"
                                className="flex h-12 w-full items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50"
                            >
                                Create an account
                            </Link>

                            {/* Footer */}

                            <p className="mt-7 text-center text-[11px] text-slate-400">
                                © {new Date().getFullYear()} Smart Inspection.
                                All rights reserved.
                            </p>

                        </div>

                    </div>

                </section>

            </div>
        </main>
    );
}

/* =====================================================
   LOGIN HIGHLIGHT
===================================================== */

function LoginHighlight({ children }) {
    return (
        <div className="flex items-center gap-2.5 text-sm text-slate-400">

            <CheckCircle2
                size={16}
                className="shrink-0 text-blue-500"
            />

            {children}

        </div>
    );
}