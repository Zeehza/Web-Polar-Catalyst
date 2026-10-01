"use client";

import React, { useActionState } from "react";
import { createTournament } from "@/app/actions/admin";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function BuatTurnamenPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createTournament, null);

  useEffect(() => {
    if (state?.success && state?.redirect) {
      router.push(state.redirect);
    }
  }, [state, router]);

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/turnamen" className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Buat Turnamen Baru</h1>
          <p className="text-neutral-500 text-sm mt-1">Tambahkan data turnamen baru ke dalam sistem.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm p-6 md:p-8">
        
        {state?.error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500 shrink-0 mt-0.5" />
            <p className="text-red-700 dark:text-red-400 text-sm">{state.error}</p>
          </div>
        )}

        <form action={formAction} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Nama Turnamen *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white"
              placeholder="Contoh: Polar Catalyst Valorant Cup 2026"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="game" className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Game *
            </label>
            <input
              type="text"
              id="game"
              name="game"
              required
              className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white"
              placeholder="Contoh: Valorant"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="type" className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Tipe Turnamen
            </label>
            <select
              id="type"
              name="type"
              defaultValue="PLAYOFF"
              className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white"
            >
              <option value="GROUP_STAGE">Group Stage</option>
              <option value="PLAYOFF">Playoff</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="startDate" className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Tanggal Mulai *
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              required
              className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md"
            >
              {isPending ? "Menyimpan..." : (
                <>
                  <Save className="h-4 w-4" /> Simpan Turnamen
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
