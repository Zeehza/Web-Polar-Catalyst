import React from "react";
import { prisma } from "@/lib/prisma";
import { Trophy, Medal, Swords, Hash } from "lucide-react";
import { getLeaderboard, getGroupLeaderboards } from "@/lib/tournament-utils";
import MatchHistoryToggle from "@/components/MatchHistoryToggle";

export const metadata = {
  title: "Results & Leaderboard | Polar Catalyst",
  description:
    "Lihat hasil pertandingan terbaru dan klasemen tim di turnamen Polar Catalyst.",
};

export default async function HasilPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let tournaments: any[] = [];

  try {
    tournaments = await prisma.tournament.findMany({
      where: {
        status: {
          in: ["ONGOING", "COMPLETED"],
        },
      },
      orderBy: {
        startDate: "desc",
      },
      include: {
        teams: true,
        matches: {
          where: {
            status: "COMPLETED",
          },
          orderBy: [{ playedAt: "desc" }, { roundNumber: "desc" }],
          include: {
            teamA: true,
            teamB: true,
            winner: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Gagal mengambil hasil dari database:", error);
    tournaments = [];
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header Section */}
      <section className="relative px-4 py-20 text-center bg-brand-950 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-grid-white/[0.05] bg-size-[32px_32px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/20 rounded-full blur-[100px] z-0" />

        <div className="relative z-10 container mx-auto flex flex-col items-center">
          <div className="mb-4 rounded-full bg-brand-500/10 p-4 text-brand-400 border border-brand-500/20">
            <Trophy className="h-8 w-8" suppressHydrationWarning />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Results & Leaderboard
          </h1>
          <p className="max-w-2xl text-lg text-brand-200">
            Lihat rekam jejak kemenangan dan posisi klasemen tim-tim terbaik di
            turnamen komunitas Polar Catalyst.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="container mx-auto px-4 py-16 md:px-8 max-w-6xl">
        {tournaments.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <Medal
              className="mx-auto h-12 w-12 text-neutral-300 dark:text-neutral-700 mb-4"
              suppressHydrationWarning
            />
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
              Belum Ada Hasil Turnamen
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400">
              Belum ada pertandingan yang diselesaikan saat ini.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-16">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {tournaments.map((tournament: any) => {
              const leaderboard = getLeaderboard(
                tournament.teams,
                tournament.matches,
              );

              const tournamentContent = (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* LEADERBOARD (Kiri) */}
                  <div className="lg:col-span-7 flex flex-col gap-6">
                    {tournament.type === "GROUP_STAGE" ? (
                      /* ---- GROUP STAGE: Leaderboard per grup ---- */
                      <>
                        {getGroupLeaderboards(
                          tournament.teams,
                          tournament.matches,
                        ).map(
                          ([groupName, groupLeaderboard]: [
                            string,
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            any[],
                          ]) => (
                            <div
                              key={groupName}
                              className="flex flex-col gap-4"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <div className="h-5 w-1.5 bg-brand-500 rounded-full" />
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                                  {groupName === "Tidak Ada Grup"
                                    ? "Belum Masuk Grup"
                                    : `Grup ${groupName}`}
                                </h3>
                              </div>

                              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left text-sm">
                                    <thead className="bg-neutral-50 dark:bg-neutral-950/50 text-neutral-500 dark:text-neutral-400 font-semibold border-b border-neutral-200 dark:border-neutral-800">
                                      <tr>
                                        <th className="px-5 py-3">Pos</th>
                                        <th className="px-5 py-3">
                                          Nama Tim
                                        </th>
                                        <th className="px-5 py-3 text-center">
                                          P
                                        </th>
                                        <th className="px-5 py-3 text-center">
                                          W
                                        </th>
                                        <th className="px-5 py-3 text-center">
                                          L
                                        </th>
                                        <th className="px-5 py-3 text-right text-brand-600 dark:text-brand-400">
                                          Pts
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50 text-neutral-700 dark:text-neutral-300">
                                      {groupLeaderboard.length === 0 ? (
                                        <tr>
                                          <td
                                            colSpan={6}
                                            className="px-5 py-6 text-center text-neutral-500"
                                          >
                                            Belum ada tim di grup ini.
                                          </td>
                                        </tr>
                                      ) : (
                                        groupLeaderboard.map(
                                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                          (team: any, index: number) => (
                                            <tr
                                              key={team.id}
                                              className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                                            >
                                              <td className="px-5 py-3 font-bold text-neutral-900 dark:text-white">
                                                {index === 0 ? (
                                                  <Medal className="h-5 w-5 text-yellow-500" />
                                                ) : index === 1 ? (
                                                  <Medal className="h-5 w-5 text-neutral-400" />
                                                ) : index === 2 ? (
                                                  <Medal className="h-5 w-5 text-amber-600" />
                                                ) : (
                                                  index + 1
                                                )}
                                              </td>
                                              <td className="px-5 py-3 font-medium">
                                                {team.name}
                                              </td>
                                              <td className="px-5 py-3 text-center">
                                                {team.played}
                                              </td>
                                              <td className="px-5 py-3 text-center text-green-600 dark:text-green-400 font-medium">
                                                {team.wins}
                                              </td>
                                              <td className="px-5 py-3 text-center text-red-600 dark:text-red-400 font-medium">
                                                {team.losses}
                                              </td>
                                              <td className="px-5 py-3 text-right font-bold text-lg text-brand-600 dark:text-brand-400">
                                                {team.points}
                                              </td>
                                            </tr>
                                          ),
                                        )
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          ),
                        )}
                      </>
                    ) : (
                      /* ---- PLAYOFF: Leaderboard keseluruhan ---- */
                      <>
                        <div className="flex items-center gap-2 mb-2 text-xl font-bold text-neutral-900 dark:text-white">
                          <Hash className="h-5 w-5 text-brand-500" />
                          <h3>Leaderboard Tim</h3>
                        </div>

                        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                              <thead className="bg-neutral-50 dark:bg-neutral-950/50 text-neutral-500 dark:text-neutral-400 font-semibold border-b border-neutral-200 dark:border-neutral-800">
                                <tr>
                                  <th className="px-6 py-4">Pos</th>
                                  <th className="px-6 py-4">Nama Tim</th>
                                  <th className="px-6 py-4 text-center">
                                    P
                                  </th>
                                  <th className="px-6 py-4 text-center">
                                    W
                                  </th>
                                  <th className="px-6 py-4 text-center">
                                    L
                                  </th>
                                  <th className="px-6 py-4 text-right text-brand-600 dark:text-brand-400">
                                    Pts
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50 text-neutral-700 dark:text-neutral-300">
                                {leaderboard.length === 0 ? (
                                  <tr>
                                    <td
                                      colSpan={6}
                                      className="px-6 py-8 text-center text-neutral-500"
                                    >
                                      Belum ada tim terdaftar.
                                    </td>
                                  </tr>
                                ) : (
                                  leaderboard.map(
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    (team: any, index: number) => (
                                      <tr
                                        key={team.id}
                                        className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                                      >
                                        <td className="px-6 py-4 font-bold text-neutral-900 dark:text-white">
                                          {index === 0 ? (
                                            <Medal className="h-5 w-5 text-yellow-500" />
                                          ) : index === 1 ? (
                                            <Medal className="h-5 w-5 text-neutral-400" />
                                          ) : index === 2 ? (
                                            <Medal className="h-5 w-5 text-amber-600" />
                                          ) : (
                                            index + 1
                                          )}
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                          {team.name}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                          {team.played}
                                        </td>
                                        <td className="px-6 py-4 text-center text-green-600 dark:text-green-400 font-medium">
                                          {team.wins}
                                        </td>
                                        <td className="px-6 py-4 text-center text-red-600 dark:text-red-400 font-medium">
                                          {team.losses}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-lg text-brand-600 dark:text-brand-400">
                                          {team.points}
                                        </td>
                                      </tr>
                                    ),
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* MATCH HISTORY (Kanan) */}
                  <div className="lg:col-span-5 flex flex-col gap-4">
                    <div className="flex items-center gap-2 mb-2 text-xl font-bold text-neutral-900 dark:text-white">
                      <Swords className="h-5 w-5 text-brand-500" />
                      <h3>Hasil Pertandingan</h3>
                    </div>

                    <div className="flex flex-col gap-3">
                      {tournament.matches.length === 0 ? (
                        <div className="text-center py-8 bg-white/50 dark:bg-neutral-900/50 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700">
                          <p className="text-neutral-500 dark:text-neutral-400">
                            Belum ada hasil pertandingan.
                          </p>
                        </div>
                      ) : (
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        tournament.matches.map((match: any) => (
                          <div
                            key={match.id}
                            className="flex flex-col p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xs hover:border-brand-300 transition-colors"
                          >
                            <div className="text-xs text-neutral-400 mb-3 flex justify-between items-center">
                              <span>
                                R{match.roundNumber} - M{match.matchOrder}
                              </span>
                              {match.playedAt && (
                                <span>
                                  {new Intl.DateTimeFormat("id-ID", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }).format(new Date(match.playedAt))}
                                </span>
                              )}
                            </div>

                            <div className="flex justify-between items-center">
                              {/* Team A */}
                              <div
                                className={`flex flex-col w-1/3 ${match.winnerId === match.teamAId ? "font-bold text-brand-600 dark:text-brand-400" : "text-neutral-600 dark:text-neutral-400"}`}
                              >
                                <span
                                  className="text-sm truncate"
                                  title={match.teamA?.name}
                                >
                                  {match.teamA?.name || "TBD"}
                                </span>
                              </div>

                              {/* Score */}
                              <div className="flex items-center gap-3 px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg font-bold">
                                <span
                                  className={
                                    match.winnerId === match.teamAId
                                      ? "text-brand-600 dark:text-brand-400"
                                      : "text-neutral-900 dark:text-white"
                                  }
                                >
                                  {match.scoreA !== null
                                    ? match.scoreA
                                    : "-"}
                                </span>
                                <span className="text-neutral-400 text-xs">
                                  vs
                                </span>
                                <span
                                  className={
                                    match.winnerId === match.teamBId
                                      ? "text-brand-600 dark:text-brand-400"
                                      : "text-neutral-900 dark:text-white"
                                  }
                                >
                                  {match.scoreB !== null
                                    ? match.scoreB
                                    : "-"}
                                </span>
                              </div>

                              {/* Team B */}
                              <div
                                className={`flex flex-col w-1/3 text-right ${match.winnerId === match.teamBId ? "font-bold text-brand-600 dark:text-brand-400" : "text-neutral-600 dark:text-neutral-400"}`}
                              >
                                <span
                                  className="text-sm truncate"
                                  title={match.teamB?.name}
                                >
                                  {match.teamB?.name || "TBD"}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );

              return (
                <div key={tournament.id} className="flex flex-col gap-8">
                  {/* Tournament Title */}
                  <div className="flex items-center gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
                    <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">
                      {tournament.name}
                    </h2>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        tournament.status === "ONGOING"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400"
                      }`}
                    >
                      {tournament.status === "ONGOING" ? "Live" : "Selesai"}
                    </span>
                  </div>

                  {tournament.status === "COMPLETED" ? (
                    <div className="flex flex-col items-center py-4 w-full">
                      <div className="flex justify-center items-end gap-2 md:gap-6 pt-12 md:pt-16 w-full max-w-3xl border-b-2 border-neutral-200 dark:border-neutral-800 pb-0">
                        {/* 2nd Place */}
                        {leaderboard[1] && (
                          <div className="flex flex-col items-center w-1/4 max-w-30 pb-0">
                            {leaderboard[1].logoUrl ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={leaderboard[1].logoUrl}
                                alt={leaderboard[1].name}
                                className="w-16 h-16 md:w-20 md:h-20 object-contain mb-3 drop-shadow-md"
                              />
                            ) : (
                              <div className="w-16 h-16 md:w-20 md:h-20 bg-neutral-200 dark:bg-neutral-800 rounded flex items-center justify-center mb-3">
                                ?
                              </div>
                            )}
                            <div className="text-center font-bold text-sm md:text-base text-neutral-800 dark:text-neutral-200 truncate w-full mb-2">
                              {leaderboard[1].name}
                            </div>
                            <div className="w-full h-16 md:h-24 bg-neutral-300 dark:bg-neutral-700/80 mt-auto flex justify-center items-start pt-2 rounded-t-xl border border-b-0 border-neutral-400 dark:border-neutral-600">
                              <div className="flex flex-col items-center gap-1">
                                <Medal className="h-8 w-8 text-neutral-500 dark:text-neutral-400 drop-shadow-sm" />
                                <span className="font-black text-2xl text-neutral-500/50">
                                  2
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 1st Place */}
                        {leaderboard[0] && (
                          <div className="flex flex-col items-center w-1/3 max-w-40 z-10 pb-0">
                            <div className="relative">
                              <Trophy className="absolute -top-10 left-1/2 -translate-x-1/2 h-8 w-8 text-yellow-500" />
                              {leaderboard[0].logoUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={leaderboard[0].logoUrl}
                                  alt={leaderboard[0].name}
                                  className="w-24 h-24 md:w-32 md:h-32 object-contain mb-3 filter drop-shadow-xl"
                                />
                              ) : (
                                <div className="w-24 h-24 md:w-32 md:h-32 bg-neutral-200 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-3">
                                  ?
                                </div>
                              )}
                            </div>
                            <div className="text-center font-black text-lg md:text-xl text-brand-600 dark:text-brand-400 truncate w-full mb-2">
                              {leaderboard[0].name}
                            </div>
                            <div className="w-full h-24 md:h-32 bg-linear-to-t from-brand-600 to-brand-400 mt-auto flex justify-center items-start pt-2 rounded-t-xl shadow-2xl border-t border-brand-300">
                              <div className="flex flex-col items-center gap-1">
                                <Medal className="h-10 w-10 text-yellow-300 drop-shadow-md" />
                                <span className="font-black text-3xl text-white/50">
                                  1
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 3rd Place */}
                        {leaderboard[2] && (
                          <div className="flex flex-col items-center w-1/4 max-w-30 pb-0">
                            {leaderboard[2].logoUrl ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={leaderboard[2].logoUrl}
                                alt={leaderboard[2].name}
                                className="w-16 h-16 md:w-20 md:h-20 object-contain mb-3 drop-shadow-md"
                              />
                            ) : (
                              <div className="w-16 h-16 md:w-20 md:h-20 bg-neutral-200 dark:bg-neutral-800 rounded flex items-center justify-center mb-3">
                                ?
                              </div>
                            )}
                            <div className="text-center font-bold text-sm md:text-base text-neutral-800 dark:text-neutral-200 truncate w-full mb-2">
                              {leaderboard[2].name}
                            </div>
                            <div className="w-full h-16 md:h-20 bg-amber-700/60 dark:bg-amber-900/60 mt-auto flex justify-center items-start pt-2 rounded-t-xl border border-b-0 border-amber-600/50 dark:border-amber-700/50">
                              <div className="flex flex-col items-center gap-1">
                                <Medal className="h-8 w-8 text-amber-500 drop-shadow-sm" />
                                <span className="font-black text-2xl text-amber-900/30 dark:text-amber-950/50">
                                  3
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Detail Toggle */}
                      <MatchHistoryToggle>
                        {tournamentContent}
                      </MatchHistoryToggle>
                    </div>
                  ) : (
                    tournamentContent
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
