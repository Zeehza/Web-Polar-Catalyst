import React from "react";
import Link from "next/link";
import { ArrowRight, Trophy, Calendar, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-4 py-32 text-center md:py-48 bg-linear-to-b from-brand-50/50 to-white dark:from-brand-950/30 dark:to-neutral-950 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-size-[32px_32px]" />

        {/* Catalyst Logo Background */}
        <div
          className="absolute inset-0 z-0 opacity-10 dark:opacity-25 pointer-events-none"
          style={{
            backgroundImage: "url('/Catalyst.svg')",
            backgroundPosition: "center",
            backgroundSize: "80% auto",
            backgroundRepeat: "no-repeat",
          }}
        />

        <div className="relative z-10 flex max-w-200 flex-col items-center gap-6 pt-4">
          <h1 className="text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-6xl md:text-7xl">
            Pusat Komunitas <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-500 to-brand-300">
              Fanbase Vtuber Indonesia
            </span>
          </h1>

          <p className="max-w-150 text-lg text-neutral-600 dark:text-neutral-400 md:text-xl">
            Platform komunitas resmi untuk komunitas vtuber indonesia.
          </p>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/events"
              className="inline-flex h-12 items-center justify-center rounded-full bg-brand-500 px-8 text-sm font-medium text-white shadow-lg shadow-brand-500/20 transition-all hover:bg-brand-600 hover:scale-105 active:scale-95"
            >
              Lihat Jadwal
              <ArrowRight className="ml-2 h-4 w-4" suppressHydrationWarning />
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-full border border-neutral-200 bg-white px-8 text-sm font-medium text-neutral-900 transition-all hover:bg-neutral-50 hover:scale-105 active:scale-95 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50 dark:hover:bg-neutral-800"
            >
              Hubungi Kami
            </Link>
          </div>
        </div>
      </section>

      {/* Latar Belakang Section */}
      <section className="container mx-auto px-4 py-24 md:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-block rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 mb-4">
            Latar Belakang
          </div>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl text-neutral-900 dark:text-white">
            Mengapa <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-500 to-brand-400">Polar Catalyst</span> Hadir?
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Dunia Virtual YouTuber (VTuber) di Indonesia terus berkembang pesat. Namun, seringkali komunitas dan fandom tersebar di berbagai platform tanpa adanya pusat informasi yang terintegrasi. Polar Catalyst hadir dari semangat untuk menyatukan berbagai elemen ini, menciptakan ekosistem yang suportif, kompetitif, dan kolaboratif bagi seluruh penikmat budaya pop virtual di tanah air.
          </p>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="container mx-auto px-4 py-24 md:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-neutral-100 shadow-sm dark:bg-neutral-900/50 dark:border-neutral-800 transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="mb-4 rounded-full bg-brand-100 p-4 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400">
              <Trophy className="h-6 w-6" suppressHydrationWarning />
            </div>
            <h3 className="mb-2 text-xl font-bold dark:text-white">
              Live Leaderboard
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Pantau pergerakan bracket dan hasil turnamen terbaru secara akurat
              dan transparan.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-neutral-100 shadow-sm dark:bg-neutral-900/50 dark:border-neutral-800 transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="mb-4 rounded-full bg-brand-100 p-4 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400">
              <Calendar className="h-6 w-6" suppressHydrationWarning />
            </div>
            <h3 className="mb-2 text-xl font-bold dark:text-white">
              Jadwal Terpusat
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Tidak ada lagi kebingungan. Semua jadwal event dan match tersedia
              di satu tempat.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-neutral-100 shadow-sm dark:bg-neutral-900/50 dark:border-neutral-800 transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="mb-4 rounded-full bg-brand-100 p-4 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400">
              <Users className="h-6 w-6" suppressHydrationWarning />
            </div>
            <h3 className="mb-2 text-xl font-bold dark:text-white">
              Komunitas Solid
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Bergabung dengan ribuan fandom dan dukung vtuber favoritmu meraih
              juara.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="container mx-auto px-4 py-24 md:px-8">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2">
            <div className="aspect-video rounded-3xl bg-neutral-100 dark:bg-neutral-900 overflow-hidden relative border border-neutral-200 dark:border-neutral-800 shadow-sm">
              <div className="absolute inset-0 bg-brand-500/10 dark:bg-brand-500/20 mix-blend-overlay"></div>
              {/* Decorative elements */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-500/20 dark:text-brand-500/20">
                <Trophy className="w-32 h-32" suppressHydrationWarning />
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2 space-y-6">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Lebih dari sekadar{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-500 to-brand-400">
                Komunitas
              </span>
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              Polar Catalyst hadir sebagai wadah pemersatu bagi para penggemar
              dan kreator Vtuber di Indonesia. Kami menyelenggarakan berbagai
              turnamen kompetitif, event komunitas, dan aktivitas kolaboratif
              lainnya.
            </p>
            <ul className="space-y-4 text-neutral-700 dark:text-neutral-300">
              <li className="flex items-center gap-3">
                <div className="rounded-full bg-brand-100 p-1 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                  <ArrowRight className="h-4 w-4" suppressHydrationWarning />
                </div>
                <span>Turnamen E-Sports Profesional</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="rounded-full bg-brand-100 p-1 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                  <ArrowRight className="h-4 w-4" suppressHydrationWarning />
                </div>
                <span>Event Nobar (Watchalong) Skala Besar</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="rounded-full bg-brand-100 p-1 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                  <ArrowRight className="h-4 w-4" suppressHydrationWarning />
                </div>
                <span>Kolaborasi Antar Fandom & Agency</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-brand-950 py-24 text-center">
        <div className="absolute inset-0 z-0 bg-grid-white/[0.05] bg-size-[32px_32px]" />

        {/* Glow effect */}
        <div className="absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/20 blur-[120px] h-75 w-75" />

        <div className="relative z-10 container mx-auto px-4 md:px-8 flex flex-col items-center">
          <h2 className="mb-6 text-3xl font-bold tracking-tight text-white md:text-5xl">
            Siap untuk Meramaikan?
          </h2>
          <p className="mb-10 max-w-2xl text-lg text-brand-200">
            Jadilah bagian dari revolusi komunitas Vtuber Indonesia. Ikuti
            turnamen, dukung Oshi kamu, dan temukan teman baru!
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-medium text-brand-950 shadow-lg transition-all hover:bg-neutral-100 hover:scale-105 active:scale-95"
            >
              Gabung Sekarang
            </Link>
            <Link
              href="/discord"
              className="inline-flex h-12 items-center justify-center rounded-full border border-brand-800 bg-brand-900/50 px-8 text-sm font-medium text-white transition-all hover:bg-brand-800 hover:scale-105 active:scale-95"
            >
              Join Discord Server
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
