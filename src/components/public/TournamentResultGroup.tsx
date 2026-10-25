"use client";

import React, { useState } from "react";
import { Trophy, Medal, Swords, Gamepad2, GitCommit, ListOrdered } from "lucide-react";
import { getLeaderboard, getGroupLeaderboards } from "@/lib/tournament-utils";
import MatchHistoryToggle from "@/components/MatchHistoryToggle";
import TournamentBracket from "@/components/public/TournamentBracket";

export interface ResultMatch {
  id: string;
  roundNumber: number;
  matchOrder: number;
  status: string;
  scoreA: number | null;
  scoreB: number | null;
  winnerId: string | null;
  playedAt: string | Date | null;
  scheduledAt?: string | Date | null;
  teamA?: { id: string; name: string; logoUrl?: string | null } | null;
  teamB?: { id: string; name: string; logoUrl?: string | null } | null;
  winner?: { id: string; name: string } | null;
}

export interface ResultTeam {
  id: string;
  name: string;
  logoUrl?: string | null;
  group?: string | null;
}

export interface ResultSeason {
  id: string;
  name: string;
  season: string;
  game: string;
  type: string;
  status: string;
  startDate: string | Date;
  endDate?: string | Date | null;
  teams: ResultTeam[];
  matches: ResultMatch[];
}

export interface TournamentResultGroupProps {
  tournamentName: string;
  game: string;
  seasons: ResultSeason[];
}

export default function TournamentResultGroup({
  tournamentName,
  game,
  seasons,
}: TournamentResultGroupProps) {
  // Sort seasons: latest/ongoing first
  const sortedSeasons = [...seasons].sort((a, b) => {
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  const [activeSeasonId, setActiveSeasonId] = useState<string>(
    sortedSeasons[0]?.id ?? ""
  );
  const [playoffView, setPlayoffView] = useState<"bracket" | "details">("bracket");

  const activeSeason =
    sortedSeasons.find((s) => s.id === activeSeasonId) || sortedSeasons[0];

  if (!activeSeason) return null;

  // Compute leaderboard for active season
  const leaderboard = getLeaderboard(
    activeSeason.teams,
    activeSeason.matches,
    activeSeason.type
  );
  const groupLeaderboards =
    activeSeason.type === "GROUP_STAGE"
      ? getGroupLeaderboards(activeSeason.teams, activeSeason.matches)
      : [];

  const seasonDetailContent = (
    <div className="flex flex-col gap-6 w-full">
      {/* Switcher Tab View for PLAYOFF tournaments */}
      {activeSeason.type === "PLAYOFF" && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-200 dark:border-neutral-800">
          <div className="inline-flex p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-2xl border border-neutral-200/60 dark:border-neutral-700/60 gap-1 shadow-inner">
            <button
              type="button"
              onClick={() => setPlayoffView("bracket")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                playoffView === "bracket"
                  ? "bg-white dark:bg-neutral-900 text-brand-600 dark:text-brand-400 shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-700"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <GitCommit className="h-4 w-4" />
              Bagan Bracket
            </button>
            <button
              type="button"
              onClick={() => setPlayoffView("details")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                playoffView === "details"
                  ? "bg-white dark:bg-neutral-900 text-brand-600 dark:text-brand-400 shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-700"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <ListOrdered className="h-4 w-4" />
              Klasemen & Pertandingan
            </button>
          </div>
        </div>
      )}

      {/* Content depending on view mode and tournament type */}
      {activeSeason.type === "PLAYOFF" && playoffView === "bracket" ? (
        <div className="w-full">
          <TournamentBracket
            matches={activeSeason.matches}
            tournamentName={`${tournamentName} - ${activeSeason.season}`}
            championName={leaderboard[0]?.name}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
          {/* LEADERBOARD (Kiri) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {activeSeason.type === "GROUP_STAGE" ? (
              /* ---- GROUP STAGE: Leaderboard per grup ---- */
              <>
                {groupLeaderboards.map(
                  ([groupName, groupLeaderboard]: [
                    string,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    any[],
                  ]) => (
                    <div key={groupName} className="flex flex-col gap-4">
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
                            <thead className="bg-neutral-50 dark:bg-neutral-950/50 text-neutral-500 dark:text-neutral-400 font-semibold border-b border-neutral-200 dark:border-neutral-800 text-xs">
                              <tr>
                                <th className="px-5 py-3">Pos</th>
                                <th className="px-5 py-3">Nama Tim</th>
                                <th className="px-5 py-3 text-center">P</th>
                                <th className="px-5 py-3 text-center">W</th>
                                <th className="px-5 py-3 text-center">L</th>
                                <th className="px-5 py-3 text-right text-brand-600 dark:text-brand-400">WR</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50 text-neutral-700 dark:text-neutral-300">
                              {groupLeaderboard.length === 0 ? (
                                <tr>
                                  <td
                                    colSpan={6}
                                    className="px-5 py-6 text-center text-neutral-500 text-xs"
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
                                      <td
                                        className="px-5 py-3 text-right font-bold text-base text-brand-600 dark:text-brand-400"
                                        title={`${team.points} Pts (${team.wins}W - ${team.losses}L)`}
                                      >
                                        {Number.isInteger(team.winRate) ? `${team.winRate}%` : `${team.winRate.toFixed(1)}%`}
                                      </td>
                                    </tr>
                                  )
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </>
            ) : (
              /* ---- PLAYOFF: Leaderboard keseluruhan ---- */
              <>
                <div className="flex items-center gap-2 mb-2 text-xl font-bold text-neutral-900 dark:text-white">
                  <Medal className="h-5 w-5 text-brand-500" />
                  <h3>Peringkat Akhir (Final Standings)</h3>
                </div>

                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-neutral-50 dark:bg-neutral-950/50 text-neutral-500 dark:text-neutral-400 font-semibold border-b border-neutral-200 dark:border-neutral-800 text-xs">
                        <tr>
                          <th className="px-6 py-4">Pos</th>
                          <th className="px-6 py-4">Nama Tim</th>
                          <th className="px-6 py-4 text-center">P</th>
                          <th className="px-6 py-4 text-center">W</th>
                          <th className="px-6 py-4 text-center">L</th>
                          <th className="px-6 py-4 text-right text-brand-600 dark:text-brand-400">WR</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50 text-neutral-700 dark:text-neutral-300">
                        {leaderboard.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-6 py-8 text-center text-neutral-500 text-xs"
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
                                <td className="px-6 py-4">
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-neutral-900 dark:text-white">
                                      {team.name}
                                    </span>
                                    {team.stageTitle && (
                                      <span className="text-[11px] font-medium text-brand-600 dark:text-brand-400">
                                        {team.stageTitle}
                                      </span>
                                    )}
                                  </div>
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
                                <td
                                  className="px-6 py-4 text-right font-bold text-base text-brand-600 dark:text-brand-400"
                                  title={`${team.points} Pts (${team.wins}W - ${team.losses}L)`}
                                >
                                  {Number.isInteger(team.winRate) ? `${team.winRate}%` : `${team.winRate.toFixed(1)}%`}
                                </td>
                              </tr>
                            )
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
              {activeSeason.matches.length === 0 ? (
                <div className="text-center py-8 bg-white/50 dark:bg-neutral-900/50 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700">
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                    Belum ada hasil pertandingan yang selesai untuk season ini.
                  </p>
                </div>
              ) : (
                activeSeason.matches.map((match) => (
                  <div
                    key={match.id}
                    className="flex flex-col p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xs hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
                  >
                    <div className="text-xs text-neutral-400 mb-3 flex justify-between items-center">
                      <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                        M{match.matchOrder}-G{match.roundNumber}
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
                        className={`flex flex-col w-1/3 ${
                          match.winnerId === match.teamA?.id
                            ? "font-bold text-brand-600 dark:text-brand-400"
                            : "text-neutral-600 dark:text-neutral-400"
                        }`}
                      >
                        <span className="text-sm truncate" title={match.teamA?.name}>
                          {match.teamA?.name || "TBD"}
                        </span>
                      </div>

                      {/* Score */}
                      <div className="flex items-center gap-3 px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg font-bold">
                        <span
                          className={
                            match.winnerId === match.teamA?.id
                              ? "text-brand-600 dark:text-brand-400"
                              : "text-neutral-900 dark:text-white"
                          }
                        >
                          {match.scoreA !== null ? match.scoreA : "-"}
                        </span>
                        <span className="text-neutral-400 text-xs">vs</span>
                        <span
                          className={
                            match.winnerId === match.teamB?.id
                              ? "text-brand-600 dark:text-brand-400"
                              : "text-neutral-900 dark:text-white"
                          }
                        >
                          {match.scoreB !== null ? match.scoreB : "-"}
                        </span>
                      </div>

                      {/* Team B */}
                      <div
                        className={`flex flex-col w-1/3 text-right ${
                          match.winnerId === match.teamB?.id
                            ? "font-bold text-brand-600 dark:text-brand-400"
                            : "text-neutral-600 dark:text-neutral-400"
                        }`}
                      >
                        <span className="text-sm truncate" title={match.teamB?.name}>
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
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-8 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm p-6 md:p-8 transition-all">
      {/* Tournament Header with Season Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-500/10 px-3 py-0.5 rounded-full border border-brand-500/20 flex items-center gap-1.5">
              <Gamepad2 className="h-3 w-3" />
              {game}
            </span>
            <span
              className={`px-3 py-0.5 text-xs font-semibold rounded-full ${
                activeSeason.status === "ONGOING"
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400"
              }`}
            >
              {activeSeason.status === "ONGOING" ? "Live" : "Selesai"}
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            {tournamentName}
          </h2>
        </div>

        {/* Season Selector Tabs */}
        <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            Pilih Season
          </span>
          <div className="inline-flex flex-wrap p-1.5 bg-neutral-100 dark:bg-neutral-800/80 rounded-2xl border border-neutral-200/60 dark:border-neutral-700/60 gap-1.5 shadow-inner">
            {sortedSeasons.map((s) => {
              const isSelected = s.id === activeSeason.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveSeasonId(s.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-700"
                      : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50"
                  }`}
                >
                  <span>{s.season}</span>
                  {s.status === "ONGOING" ? (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500">
                      (Selesai)
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Season Body Content */}
      {activeSeason.status === "COMPLETED" ? (
        <div className="flex flex-col items-center py-4 w-full">
          {/* Podium for Completed Tournament */}
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
                <div className="text-center font-bold text-sm md:text-base text-neutral-800 dark:text-neutral-200 truncate w-full">
                  {leaderboard[1].name}
                </div>
                <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-2">
                  {Number.isInteger(leaderboard[1].winRate) ? `${leaderboard[1].winRate}%` : `${leaderboard[1].winRate.toFixed(1)}%`} WR ({leaderboard[1].wins}W - {leaderboard[1].losses}L)
                </span>
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
                <div className="text-center font-black text-lg md:text-xl text-brand-600 dark:text-brand-400 truncate w-full">
                  {leaderboard[0].name}
                </div>
                <span className="text-[11px] md:text-xs font-bold text-brand-700 dark:text-brand-300 mb-2 px-2 py-0.5 bg-brand-50 dark:bg-brand-950/60 rounded-full border border-brand-200 dark:border-brand-800">
                  {Number.isInteger(leaderboard[0].winRate) ? `${leaderboard[0].winRate}%` : `${leaderboard[0].winRate.toFixed(1)}%`} WR ({leaderboard[0].wins}W - {leaderboard[0].losses}L)
                </span>
                <div className="w-full h-24 md:h-32 bg-linear-to-t from-brand-600 to-brand-400 mt-auto flex justify-center items-start pt-2 rounded-t-xl shadow-2xl border-t border-brand-300">
                  <div className="flex flex-col items-center gap-1">
                    <Medal className="h-10 w-10 text-yellow-300 drop-shadow-md" />
                    <span className="font-black text-3xl text-white/50">1</span>
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
                <div className="text-center font-bold text-sm md:text-base text-neutral-800 dark:text-neutral-200 truncate w-full">
                  {leaderboard[2].name}
                </div>
                <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-2">
                  {Number.isInteger(leaderboard[2].winRate) ? `${leaderboard[2].winRate}%` : `${leaderboard[2].winRate.toFixed(1)}%`} WR ({leaderboard[2].wins}W - {leaderboard[2].losses}L)
                </span>
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

          {/* Toggle details: Leaderboard & Match History */}
          <MatchHistoryToggle>{seasonDetailContent}</MatchHistoryToggle>
        </div>
      ) : (
        seasonDetailContent
      )}
    </div>
  );
}
