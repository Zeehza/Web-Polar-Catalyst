"use client";

import React, { useActionState, useEffect } from "react";
import {
  Mail,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Building2,
  User,
} from "lucide-react";
import { submitContactForm } from "@/app/actions/contact";

export default function KontakPage() {
  const [state, formAction, isPending] = useActionState(
    submitContactForm,
    null,
  );

  // Auto scroll ke pesan jika ada respon (success/error)
  useEffect(() => {
    if (state?.message || state?.error) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [state]);

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header Section */}
      <section className="relative px-4 py-20 text-center bg-brand-950 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-grid-white/[0.05] bg-size-[32px_32px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/20 rounded-full blur-[100px] z-0" />

        <div className="relative z-10 container mx-auto flex flex-col items-center">
          <div className="mb-4 rounded-full bg-brand-500/10 p-4 text-brand-400 border border-brand-500/20">
            <MessageSquare className="h-8 w-8" suppressHydrationWarning />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Contact
          </h1>
          <p className="max-w-2xl text-lg text-brand-200">
            Ada pertanyaan, saran, atau ingin menjalin kerja sama dengan Polar
            Catalyst? Isi formulir di bawah ini dan tim kami akan segera
            menghubungi Anda.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="container mx-auto px-4 py-16 md:px-8 max-w-3xl">
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
          <div className="p-8 md:p-12">
            {/* Status Messages */}
            {state?.success && (
              <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-green-900 dark:text-green-400">
                    Terkirim!
                  </h3>
                  <p className="text-green-700 dark:text-green-500/80 text-sm mt-1">
                    {state.message}
                  </p>
                </div>
              </div>
            )}

            {state?.error && (
              <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-red-900 dark:text-red-400">
                    Terjadi Kesalahan
                  </h3>
                  <p className="text-red-700 dark:text-red-500/80 text-sm mt-1">
                    {state.error}
                  </p>
                </div>
              </div>
            )}

            {!state?.success && (
              <form action={formAction} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nama */}
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="name"
                      className="text-sm font-semibold text-neutral-700 dark:text-neutral-300"
                    >
                      Nama Lengkap *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
                        <User className="h-5 w-5" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        placeholder="Nama Pengirim"
                        className="w-full pl-11 pr-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Perusahaan */}
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="company"
                      className="text-sm font-semibold text-neutral-700 dark:text-neutral-300"
                    >
                      Perusahaan / Organisasi
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        placeholder="Opsional"
                        className="w-full pl-11 pr-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-semibold text-neutral-700 dark:text-neutral-300"
                  >
                    Alamat Email *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      placeholder="Polar@Catalyst.com"
                      className="w-full pl-11 pr-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all dark:text-white"
                    />
                  </div>
                </div>

                {/* Pesan */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="message"
                    className="text-sm font-semibold text-neutral-700 dark:text-neutral-300"
                  >
                    Pesan / Penawaran *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    placeholder="Pesan yang ingin disampaikan"
                    className="w-full p-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all dark:text-white resize-y"
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isPending}
                  className="mt-4 flex items-center justify-center gap-2 w-full py-4 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all hover:shadow-lg active:scale-[0.98]"
                >
                  {isPending ? (
                    <span className="animate-pulse">Mengirim...</span>
                  ) : (
                    <>
                      Kirim Pesan
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-neutral-500 dark:text-neutral-500 mt-2">
                  Dengan mengirimkan form ini, Anda menyetujui bahwa data Anda
                  akan disimpan untuk keperluan komunikasi.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
