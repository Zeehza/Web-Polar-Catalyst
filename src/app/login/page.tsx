"use client";

import { useActionState } from "react";
import { authenticate } from "@/app/actions/auth";
import { Lock, User, KeyRound, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-950 px-4">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-8">
        
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="h-16 w-16 bg-brand-500/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-brand-500" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Admin Portal</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
            Masuk untuk mengelola turnamen dan konten web.
          </p>
        </div>

        <form action={formAction} className="flex flex-col gap-5">
          <input type="hidden" name="redirectTo" value="/admin" />
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
                <User className="h-5 w-5" />
              </div>
              <input
                type="text"
                name="username"
                required
                className="w-full pl-11 pr-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white"
                placeholder="Masukkan username"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
                <KeyRound className="h-5 w-5" />
              </div>
              <input
                type="password"
                name="password"
                required
                className="w-full pl-11 pr-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-100 dark:border-red-900">
              <AlertCircle className="h-4 w-4" />
              <p>{errorMessage}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 mt-2 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center"
          >
            {isPending ? "Authenticating..." : "Sign In"}
          </button>
        </form>

      </div>
    </div>
  );
}
