import React from "react";
import { prisma } from "@/lib/prisma";
import { Trophy, Plus, Gamepad2, Calendar, Swords, Users, ExternalLink } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Kelola Turnamen & Season | Admin Dashboard",
};

interface TournamentWithCount {
  id: string;
  name: string;
  season: string;
  slug: string;
  game: string;
  type: string;
  status: string;
  startDate: Date;
  _count: {
    teams: number;
    matches: number;
  };
}

interface GroupedTournament {
  name: string;
  game: string;
  seasons: TournamentWithCount[];
}

export default async function AdminTurnamenPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tournamentsRaw = await (prisma.tournament as any).findMany({
    orderBy: { startDate: "desc" },
    include: {
      _count: {
        select: { teams: true, matches: true },
      },
    },
  });
  const tournaments = tournamentsRaw as unknown as TournamentWithCount[];

  // Group tournaments by name
  const groupedMap = new Map<string, GroupedTournament>();
  tournaments.forEach((t) => {
    if (!groupedMap.has(t.name)) {
      groupedMap.set(t.name, {
        name: t.name,
        game: t.game,
        seasons: [t],
      });
    } else {
      groupedMap.get(t.name)!.seasons.push(t);
    }
  });

  const groupedTournaments = Array.from(groupedMap.values());

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
            Kelola Turnamen & Season
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Daftar acara turnamen Polar Catalyst beserta season di dalamnya.
          </p>
        </div>
        <Link
          href="/admin/turnamen/baru"
          className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Buat Turnamen Baru
        </Link>
      </div>

      {groupedTournaments.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-12 text-center shadow-sm">
          <Trophy className="h-12 w-12 mx-auto mb-3 text-neutral-400 dark:text-neutral-600" />
          <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">
            Belum Ada Turnamen
          </h3>
          <p className="text-sm text-neutral-500 max-w-md mx-auto mt-1 mb-6">
            Mulai dengan membuat turnamen esports pertama dan definisikan season perdananya.
          </p>
          <Link
            href="/admin/turnamen/baru"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" /> Buat Turnamen
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {groupedTournaments.map((group) => (
            <div
              key={group.name}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm"
            >
              {/* Tournament Group Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 md:p-6 bg-neutral-50/70 dark:bg-neutral-950/40 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-start md:items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 border border-brand-500/20">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                        {group.name}
                      </h2>
                      <span className="inline-flex items-center gap-1 bg-neutral-200/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                        <Gamepad2 className="h-3 w-3" />
                        {group.game}
                      </span>
                      <span className="text-xs text-neutral-500 bg-white dark:bg-neutral-900 px-2 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-800">
                        {group.seasons.length} Season
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Acara tetap turnamen esports
                    </p>
                  </div>
                </div>

                <Link
                  href={`/admin/turnamen/baru?name=${encodeURIComponent(group.name)}&game=${encodeURIComponent(group.game)}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-white dark:bg-neutral-900 border border-brand-300 dark:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-950 text-brand-600 dark:text-brand-400 rounded-xl transition-all shadow-2xs self-start md:self-auto"
                >
                  <Plus className="h-3.5 w-3.5" /> Tambah Season Baru
                </Link>
              </div>

              {/* Seasons Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-50 dark:bg-neutral-950/30 text-neutral-500 font-semibold border-b border-neutral-100 dark:border-neutral-800 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">Season</th>
                      <th className="px-6 py-3.5">Tanggal</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Tipe</th>
                      <th className="px-6 py-3.5 text-center">Tim</th>
                      <th className="px-6 py-3.5 text-center">Match</th>
                      <th className="px-6 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
                    {group.seasons.map((season) => (
                      <tr
                        key={season.id}
                        className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-neutral-900 dark:text-white">
                              {season.season}
                            </span>
                            <span className="text-xs text-neutral-400 font-mono">
                              ({season.slug})
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400 text-xs">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                            {new Intl.DateTimeFormat("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }).format(new Date(season.startDate))}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 text-xs rounded-full font-semibold ${
                              season.status === "ONGOING"
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                : season.status === "COMPLETED"
                                  ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400"
                                  : season.status === "UPCOMING"
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                    : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                            }`}
                          >
                            {season.status === "ONGOING"
                              ? "Live"
                              : season.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-2 py-1 rounded-md text-xs font-medium">
                            {season.type === "GROUP_STAGE"
                              ? "Group Stage"
                              : "Playoff"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-neutral-800 dark:text-neutral-200">
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-neutral-400" />
                            {season._count.teams}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-neutral-800 dark:text-neutral-200">
                          <span className="inline-flex items-center gap-1">
                            <Swords className="h-3.5 w-3.5 text-neutral-400" />
                            {season._count.matches}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/admin/turnamen/${season.id}`}
                            className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-semibold text-sm hover:underline"
                          >
                            Kelola Season <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
