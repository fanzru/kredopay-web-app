"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, ShieldCheck, KeyRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    // Simulate API call to send OTP
    setTimeout(() => {
      setStatus("idle");
      setStep("otp");
    }, 1000);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;

    setStatus("loading");
    setError(false);

    // Verify OTP logic
    // Hardcoded dev check or general 000000 for demo
    const isValidDev =
      email.toLowerCase() === "dev@kredopay.app" && otp === "000000";

    // For demo purposes, we can allow any OTP or just restrict to the dev one.
    // Based on request "email yang hardcoded OTP", let's prioritize the Dev flow.
    // We can also allow a generic "123456" for demo users if needed,
    // but sticking to instructions:

    if (isValidDev) {
      setTimeout(() => {
        // Mock JWT Token
        const mockJwt =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.kredo_mock_signature";
        localStorage.setItem("kredo_auth_token", mockJwt);

        setStatus("success");
        setTimeout(() => {
          router.push("/dashboard");
        }, 800);
      }, 1000);
    } else {
      setTimeout(() => {
        setStatus("idle");
        setError(true);
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm font-sans text-white">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[400px] p-6"
      >
        {/* Logo Section */}
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="relative mb-6 h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-800 to-black border border-zinc-700 shadow-2xl p-3">
            <Image
              src="/logo.png"
              alt="Kredo Logo"
              fill
              className="object-contain p-2"
            />
          </div>
          <h2 className="mb-2 text-2xl font-bold tracking-tight">
            {step === "email" ? "Welcome back" : "Enter Code"}
          </h2>
          <p className="text-zinc-400 text-sm">
            {step === "email"
              ? "Enter your email to sign in to your account."
              : `We sent a code to ${email}.`}
          </p>
        </div>

        {/* Form Section */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 flex flex-col items-center justify-center gap-4 backdrop-blur-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium text-white">Authenticated</p>
              </motion.div>
            ) : step === "email" ? (
              <motion.form
                key="email-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleEmailSubmit}
                className="space-y-4"
              >
                <div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-zinc-800 bg-black/50 px-4 py-3.5 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-zinc-600 focus:bg-black focus:ring-1 focus:ring-zinc-600"
                    disabled={status === "loading"}
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "loading" || !email}
                  className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-bold text-black transition-all hover:bg-zinc-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <span>Continue with Email</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="otp-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleOtpSubmit}
                className="space-y-4"
              >
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => {
                      // Only allow numbers and max 6 chars
                      const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setOtp(val);
                      setError(false);
                    }}
                    placeholder="000 000"
                    maxLength={6}
                    className={`w-full rounded-xl border bg-black/50 px-4 py-3.5 text-center text-lg tracking-[0.5em] font-mono text-white placeholder-zinc-700 outline-none transition-all focus:bg-black focus:ring-1 ${
                      error
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-zinc-800 focus:border-zinc-600 focus:ring-zinc-600"
                    }`}
                    disabled={status === "loading"}
                    autoFocus
                  />
                  {error && (
                    <p className="absolute -bottom-6 left-0 w-full text-center text-xs text-red-500">
                      Invalid code. Try 000000.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={status === "loading" || otp.length < 6}
                  className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-bold text-black transition-all hover:bg-zinc-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4" />
                      <span>Verify Access</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setOtp("");
                    setError(false);
                  }}
                  className="w-full text-center text-xs text-zinc-500 hover:text-zinc-300 transition-colors mt-4"
                >
                  Back to email
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-8 text-center text-xs text-zinc-600">
          Protected by{" "}
          <span className="text-zinc-400 font-medium">Kredo Auth</span>
        </p>
      </motion.div>

      {/* Footer Links */}
      <div className="absolute bottom-8 text-center text-xs text-zinc-600">
        <div className="space-x-4">
          <Link
            href="/terms"
            className="hover:text-zinc-400 underline decoration-zinc-800"
          >
            Terms of Service
          </Link>
          <Link
            href="/privacy"
            className="hover:text-zinc-400 underline decoration-zinc-800"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
