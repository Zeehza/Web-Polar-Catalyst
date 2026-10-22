"use client";

import React, { useState } from "react";
import { Clock, MapPin, Trophy, ArrowRight, GitCommit } from "lucide-react";
import Link from "next/link";
import { getGroupLeaderboards } from "@/lib/tournament-utils";
import TournamentBracket from "@/components/public/TournamentBracket";

export interface EventMatch {
  id: string;
  roundNumber: number;
  matchOrder: number;
  status: string;
  scoreA: number | null;
  scoreB: number | null;
  winnerId: string | null;
  teamAId?: string | null;
  teamBId?: string | null;
  scheduledAt: string | Date | null;
  teamA?: { id: string; name: string; logoUrl?: string | null } | null;
  teamB?: { id: string; name: string; logoUrl?: string | null } | null;
  winner?: { id: string; name: string } | null;
}

export interface EventTeam {
  id: string;
  name: string;
  logoUrl?: string | null;
  group?: string | null;
}

export interface EventSeason {
  id: string;
  name: string;
  season: string;
  game: string;
  type: string;
  status: string;
  description?: string | null;
  startDate: string | Date;
  endDate?: string | Date | null;
  teams: EventTeam[];
  matches: EventMatch[];
}

export interface TournamentEventGroupProps {
  tournamentName: string;
  game: string;
  seasons: EventSeason[];
}

export default function TournamentEventGroup({
  tournamentName,
  game,
  seasons,
}: TournamentEventGroupProps) {
  // Sort seasons: ONGOING first, then UPCOMING, then COMPLETED, or by startDate desc
  const sortedSeasons = [...seasons].sort((a, b) => {
    const statusWeight: Record<string, number> = {
      ONGOING: 3,
      UPCOMING: 2,
      COMPLETED: 1,
      DRAFT: 0,
    };
    const diff = (statusWeight[b.status] ?? 0) - (statusWeight[a.status] ?? 0);
    if (diff !== 0) return diff;
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  const [activeSeasonId, setActiveSeasonId] = useState<string>(
    sortedSeasons[0]?.id ?? ""
  );
  const [eventView, setEventView] = useState<"schedule" | "bracket">("schedule");

  const activeSeason =
    sortedSeasons.find((s) => s.id === activeSeasonId) || sortedSeasons[0];

  if (!activeSeason) return null;

  // Filter display teams (Top 2 per group for GROUP_STAGE, or all for PLAYOFF)
  let displayTeams: EventTeam[] = [];
  if (activeSeason.type === "PLAYOFF") {
    displayTeams = activeSeason.teams || [];
  } else {
    const groupLeaderboards = getGroupLeaderboards(
      activeSeason.teams,
      activeSeason.matches
    );
    const qualifiedIds = new Set<string>();
    for (const [, lb] of groupLeaderboards) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (lb as any[]).slice(0, 2).forEach((t: any) => qualifiedIds.add(t.id));
    }
    displayTeams = (activeSeason.teams || []).filter((t) =>
      qualifiedIds.has(t.id)
    );
  }

  // Filter matches: upcoming / ongoing matches (hide completed on events page)
  const upcomingMatches = activeSeason.matches.filter(
    (m) => m.status !== "COMPLETED"
  );

  return (
    <div className="flex flex-col gap-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm overflow-hidden transition-all">
      {/* Tournament Parent Header */}
      <div className="p-6 md:p-8 bg-linear-to-r from-neutral-50 via-white to-neutral-50/50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20 flex items-center gap-1.5">
                <MapPin className="h-3 w-3" />
                {game}
              </span>
              <span className="text-xs text-neutral-500 font-medium">
                {seasons.length} {seasons.length > 1 ? "Seasons" : "Season"}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              {tournamentName}
            </h2>
            {activeSeason.description && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 max-w-2xl leading-relaxed">
                {activeSeason.description}
              </p>
            )}
          </div>

          {/* Season Selector Tabs */}
          <div className="flex flex-col sm:items-end gap-2 shrink-0">
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
                    {s.status === "ONGOING" && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                      </span>
                    )}
                    {s.status === "COMPLETED" && (
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

        {/* Active Season Sub-bar */}
        <div className="mt-6 pt-5 border-t border-neutral-200/70 dark:border-neutral-800/70 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 text-xs font-bold rounded-full ${
                activeSeason.status === "ONGOING"
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  : activeSeason.status === "UPCOMING"
                    ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400"
                    : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
              }`}
            >
              {activeSeason.status === "ONGOING" ? "Live" : activeSeason.status}
            </span>
            <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full">
              Format: {activeSeason.type === "GROUP_STAGE" ? "Group Stage" : "Playoff"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-950 px-3.5 py-1.5 rounded-lg border border-neutral-200/60 dark:border-neutral-800 shadow-2xs">
            <Clock className="h-4 w-4 text-brand-500" />
            <span>
              {new Intl.DateTimeFormat("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }).format(new Date(activeSeason.startDate))}
              {activeSeason.endDate &&
                ` - ${new Intl.DateTimeFormat("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }).format(new Date(activeSeason.endDate))}`}
            </span>
          </div>
        </div>
      </div>

      {/* Season Body Content */}
      <div className="p-6 md:p-8 pt-0 flex flex-col gap-8">
        {/* Teams List (MPL Style Shields) */}
        {displayTeams.length > 0 && (
          <div className="flex flex-col gap-6 py-6 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <h3
                className="text-xl md:text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-[0.15em] opacity-80"
                style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}
              >
                {activeSeason.type === "GROUP_STAGE"
                  ? `TOP TEAMS • ${activeSeason.season}`
                  : `TIM PESERTA • ${activeSeason.season}`}
              </h3>
              <span className="text-xs font-medium text-neutral-400">
                {displayTeams.length} Tim
              </span>
            </div>

            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              {displayTeams.map((team) => (
                <div
                  key={team.id}
                  className="relative w-24 md:w-30 flex flex-col items-center group transition-transform hover:-translate-y-1"
                >
                  {/* Shield Shape */}
                  <div
                    className="w-full aspect-3/5 bg-white hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 shadow-md border-b-4 border-brand-800 flex flex-col items-center relative overflow-hidden transition-colors"
                    style={{
                      clipPath:
                        "polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%)",
                    }}
                  >
                    {/* Header color block */}
                    <div className="w-full h-7 md:h-8 bg-[#7a1818] flex items-center justify-center text-[10px] md:text-xs font-bold text-white uppercase tracking-wider px-1 text-center leading-tight">
                      {team.name}
                    </div>
                    {/* Logo space */}
                    <div className="flex-1 w-full flex items-center justify-center p-2 pb-6">
                      {team.logoUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={team.logoUrl}
                          alt={team.name}
                          className="w-full h-full object-contain filter drop-shadow-sm"
                        />
                      ) : (
                        <div className="text-4xl font-black text-neutral-200 dark:text-neutral-800 opacity-50">
                          ?
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Toggle between Schedule and Bracket if Playoff and has matches */}
        {activeSeason.type === "PLAYOFF" && activeSeason.matches.length > 0 && (
          <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
            <div className="inline-flex p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-2xl border border-neutral-200/60 dark:border-neutral-700/60 gap-1 shadow-inner">
              <button
                type="button"
                onClick={() => setEventView("schedule")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                  eventView === "schedule"
                    ? "bg-white dark:bg-neutral-900 text-brand-600 dark:text-brand-400 shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-700"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                <Clock className="h-4 w-4" />
                Jadwal Pertandingan
              </button>
              <button
                type="button"
                onClick={() => setEventView("bracket")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                  eventView === "bracket"
                    ? "bg-white dark:bg-neutral-900 text-brand-600 dark:text-brand-400 shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-700"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                <GitCommit className="h-4 w-4" />
                Bagan Bracket
              </button>
            </div>
          </div>
        )}

        {/* Content: Bracket View or Schedule Cards */}
        {activeSeason.type === "PLAYOFF" && eventView === "bracket" ? (
          <div className="w-full">
            <TournamentBracket
              matches={activeSeason.matches}
              tournamentName={`${tournamentName} - ${activeSeason.season}`}
            />
          </div>
        ) : (
          /* Matches Section */
          upcomingMatches.length === 0 ? (
            <div className="text-center py-12 bg-neutral-50 dark:bg-neutral-950/50 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700">
              {activeSeason.status === "COMPLETED" ? (
                <div className="flex flex-col items-center gap-3">
                  <Trophy className="h-8 w-8 text-yellow-500 opacity-80" />
                  <p className="text-neutral-700 dark:text-neutral-300 font-semibold">
                    Pertandingan {activeSeason.season} telah selesai diselenggarakan!
                  </p>
                  <Link
                    href="/results"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline mt-1"
                  >
                    Lihat Hasil Juara & Leaderboard di Page Results <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : (
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                  Belum ada jadwal match berikutnya untuk {activeSeason.season}.
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Jadwal Pertandingan ({activeSeason.season})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingMatches.map((match) => (
                  <div
                    key={match.id}
                    className="group flex flex-col p-5 bg-neutral-50/70 dark:bg-neutral-950/60 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs hover:shadow-md hover:border-brand-300 dark:hover:border-brand-700 transition-all"
                  >
                    <div className="flex justify-between items-center mb-4 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        Match {match.matchOrder} • Game {match.roundNumber}
                      </span>
                      <div className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400 font-semibold">
                        <Clock className="h-3.5 w-3.5" />
                        <span>
                          {match.scheduledAt
                            ? new Intl.DateTimeFormat("id-ID", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                                .format(new Date(match.scheduledAt))
                                .replace(",", " •")
                                .replace(".", ":")
                            : "TBA"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      {/* Team A */}
                      <div
                        className={`flex items-center justify-between p-3 rounded-xl border ${
                          match.winnerId === match.teamAId
                            ? "bg-brand-50/80 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800"
                            : "bg-white dark:bg-neutral-900 border-neutral-200/60 dark:border-neutral-800"
                        }`}
                      >
                        <span
                          className={`font-semibold text-sm ${
                            match.winnerId === match.teamAId
                              ? "text-brand-700 dark:text-brand-300 font-bold"
                              : "text-neutral-700 dark:text-neutral-300"
                          }`}
                        >
                          {match.teamA?.name || "TBD"}
                        </span>
                        <span className="font-extrabold text-lg text-neutral-900 dark:text-white">
                          {match.scoreA !== null ? match.scoreA : "-"}
                        </span>
                      </div>

                      {/* Team B */}
                      <div
                        className={`flex items-center justify-between p-3 rounded-xl border ${
                          match.winnerId === match.teamBId
                            ? "bg-brand-50/80 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800"
                            : "bg-white dark:bg-neutral-900 border-neutral-200/60 dark:border-neutral-800"
                        }`}
                      >
                        <span
                          className={`font-semibold text-sm ${
                            match.winnerId === match.teamBId
                              ? "text-brand-700 dark:text-brand-300 font-bold"
                              : "text-neutral-700 dark:text-neutral-300"
                          }`}
                        >
                          {match.teamB?.name || "TBD"}
                        </span>
                        <span className="font-extrabold text-lg text-neutral-900 dark:text-white">
                          {match.scoreB !== null ? match.scoreB : "-"}
                        </span>
                      </div>
                    </div>

                    {/* Match Status */}
                    <div className="mt-4 flex justify-between items-center pt-3 border-t border-neutral-200/60 dark:border-neutral-800">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-md ${
                          match.status === "COMPLETED"
                            ? "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                            : match.status === "ONGOING"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                        }`}
                      >
                        {match.status}
                      </span>

                      {match.status === "COMPLETED" && match.winner && (
                        <span className="text-xs font-medium text-neutral-500 flex items-center gap-1">
                          Pemenang:{" "}
                          <span className="font-bold text-brand-600 dark:text-brand-400">
                            {match.winner.name}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
