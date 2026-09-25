import React from "react";
import { prisma } from "@/lib/prisma";
import { Trophy, Plus } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Turnamen | Admin Dashboard",
};

export default async function AdminTurnamenPage() {
  const tournaments = await prisma.tournament.findMany({
    orderBy: { startDate: "desc" },
    include: {
      _count: {
        select: { teams: true, matches: true }
      }
    }
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Kelola Turnamen</h1>
          <p className="text-neutral-500 text-sm mt-1">Daftar semua turnamen Polar Catalyst.</p>
        </div>
        <Link href="/admin/turnamen/baru" className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> Buat Turnamen
        </Link>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-950/50 text-neutral-500 font-semibold border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="px-6 py-4">Turnamen</th>
                <th className="px-6 py-4">Game</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Tim</th>
                <th className="px-6 py-4 text-center">Match</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
              {tournaments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                    <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    Belum ada turnamen.
                  </td>
                </tr>
              ) : (
                tournaments.map((t) => (
                  <tr key={t.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-neutral-900 dark:text-white">{t.name}</p>
                      <p className="text-xs text-neutral-400">
                        {new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(t.startDate))}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-2 py-1 rounded-md text-xs font-medium">
                        {t.game}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                        t.status === "ONGOING" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                        t.status === "COMPLETED" ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400" :
                        "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-medium">{t._count.teams}</td>
                    <td className="px-6 py-4 text-center font-medium">{t._count.matches}</td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/turnamen/${t.id}`} className="text-brand-600 dark:text-brand-400 hover:underline text-sm font-medium">
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
