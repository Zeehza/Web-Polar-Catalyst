import React from "react";
import { prisma } from "@/lib/prisma";
import { Trophy, Mail, CheckCircle2, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Admin Dashboard | Polar Catalyst",
};

export default async function AdminDashboardPage() {
  // Fetch quick stats
  const totalTournaments = await prisma.tournament.count();
  const activeTournaments = await prisma.tournament.count({
    where: { status: "ONGOING" },
  });
  const unreadMessagesCount = await prisma.contactSubmission.count({
    where: { isRead: false },
  });
  const totalTeams = await prisma.team.count();

  const recentMessages = await prisma.contactSubmission.findMany({
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
          Dashboard Overview
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
          Selamat datang di dashboard admin Polar Catalyst.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 font-medium">
              Total Turnamen
            </p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
              {totalTournaments}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 font-medium">
              Turnamen Aktif
            </p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
              {activeTournaments}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 flex items-center justify-center">
            <Mail className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 font-medium">
              Pesan Masuk (Unread)
            </p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
              {unreadMessagesCount}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 font-medium">
              Total Tim Terdaftar
            </p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
              {totalTeams}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Aksi Cepat</h2>
          <div className="flex flex-col gap-3">
            <Link
              href="/admin/turnamen"
              className="flex items-center justify-between p-4 rounded-xl border border-neutral-100 hover:border-brand-500 dark:border-neutral-800 dark:hover:border-brand-500 transition-colors group"
            >
              <span className="font-medium dark:text-neutral-200">
                Kelola Turnamen
              </span>
              <span className="text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity">
                →
              </span>
            </Link>
            <Link
              href="/admin/pesan"
              className="flex items-center justify-between p-4 rounded-xl border border-neutral-100 hover:border-brand-500 dark:border-neutral-800 dark:hover:border-brand-500 transition-colors group"
            >
              <span className="font-medium dark:text-neutral-200">
                Lihat Pesan Masuk
              </span>
              <span className="text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity">
                →
              </span>
            </Link>
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold dark:text-white">Pesan Terbaru</h2>
            <Link
              href="/admin/pesan"
              className="text-sm text-brand-500 hover:text-brand-600 flex items-center gap-1"
            >
              Lihat Semua <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex flex-col gap-4 flex-grow:1">
            {recentMessages.length === 0 ? (
              <div className="flex-grow:1 flex items-center justify-center text-sm text-neutral-500">
                Belum ada pesan.
              </div>
            ) : (
              recentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-4 rounded-xl border ${msg.isRead ? "border-neutral-100 dark:border-neutral-800" : "border-brand-100 bg-brand-50/50 dark:border-brand-900/30 dark:bg-brand-900/10"} flex flex-col gap-1`}
                >
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-sm dark:text-neutral-200">
                      {msg.name}
                    </p>
                    <span className="text-[10px] text-neutral-400">
                      {new Intl.DateTimeFormat("id-ID", {
                        day: "2-digit",
                        month: "short",
                      }).format(msg.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 line-clamp-2">
                    {msg.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
