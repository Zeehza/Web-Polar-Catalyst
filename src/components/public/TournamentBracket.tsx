"use client";

import React, { useState, useMemo } from "react";
import { Trophy, Swords, Clock, GitCommit } from "lucide-react";

export interface BracketGameMatch {
  id: string;
  roundNumber: number;
  matchOrder: number;
  scoreA: number | null;
  scoreB: number | null;
  status: string;
  scheduledAt?: string | Date | null;
  playedAt?: string | Date | null;
  teamA?: { id: string; name: string; logoUrl?: string | null } | null;
  teamB?: { id: string; name: string; logoUrl?: string | null } | null;
  winner?: { id: string; name: string } | null;
  winnerId?: string | null;
}

interface MatchSeries {
  matchOrder: number;
  teamA: { id: string; name: string; logoUrl?: string | null } | null;
  teamB: { id: string; name: string; logoUrl?: string | null } | null;
  games: BracketGameMatch[];
  gamesWonA: number;
  gamesWonB: number;
  winnerId: string | null;
  status: "SCHEDULED" | "ONGOING" | "COMPLETED";
  scheduledAt?: string | Date | null;
}

interface TournamentBracketProps {
  matches: BracketGameMatch[];
  tournamentName?: string;
  championName?: string;
}

export default function TournamentBracket({
  matches,
  championName,
}: TournamentBracketProps) {
  const [hoveredTeamId, setHoveredTeamId] = useState<string | null>(null);

  // Group raw game matches into match series (grouped by matchOrder)
  const { isDoubleElimination, upperRounds, lowerRounds, grandFinal, singleElimRounds, bronzeMatch } =
    useMemo(() => {
      const seriesMap = new Map<number, MatchSeries>();

      matches.forEach((m) => {
        if (!seriesMap.has(m.matchOrder)) {
          seriesMap.set(m.matchOrder, {
            matchOrder: m.matchOrder,
            teamA: m.teamA || null,
            teamB: m.teamB || null,
            games: [],
            gamesWonA: 0,
            gamesWonB: 0,
            winnerId: null,
            status: "SCHEDULED",
            scheduledAt: m.scheduledAt,
          });
        }

        const series = seriesMap.get(m.matchOrder)!;
        series.games.push(m);

        // Pastikan teamA dan teamB terisi dari game-game dalam series
        if (!series.teamA && m.teamA) {
          series.teamA = m.teamA;
        } else if (!series.teamB && m.teamB && series.teamA && m.teamB.id !== series.teamA.id) {
          series.teamB = m.teamB;
        } else if (!series.teamB && m.teamA && series.teamA && m.teamA.id !== series.teamA.id) {
          series.teamB = m.teamA;
        }

        if (m.status === "ONGOING") series.status = "ONGOING";
        else if (m.status === "COMPLETED" && series.status !== "ONGOING") {
          series.status = "COMPLETED";
        }
      });

      const allSeries = Array.from(seriesMap.values()).sort(
        (a, b) => a.matchOrder - b.matchOrder
      );

      // Hitung kemenangan game berdasarkan team ID series yang stabil
      allSeries.forEach((series) => {
        const idA = series.teamA?.id;
        const idB = series.teamB?.id;

        series.games.forEach((g) => {
          if (!g.winnerId) return;
          if (idA && g.winnerId === idA) {
            series.gamesWonA++;
          } else if (idB && g.winnerId === idB) {
            series.gamesWonB++;
          }
        });

        if (series.gamesWonA > series.gamesWonB && series.teamA) {
          series.winnerId = series.teamA.id;
        } else if (series.gamesWonB > series.gamesWonA && series.teamB) {
          series.winnerId = series.teamB.id;
        } else {
          // Jika poin imbang atau belum selesai, ambil winner dari game terakhir
          const lastGame = series.games[series.games.length - 1];
          if (lastGame?.winnerId) series.winnerId = lastGame.winnerId;
        }
      });

      if (allSeries.length === 0) {
        return {
          isDoubleElimination: false,
          upperRounds: [],
          lowerRounds: [],
          grandFinal: null,
          singleElimRounds: [],
          bronzeMatch: null,
        };
      }

      // Check if Double Elimination: count how many losers play again
      const lostTeams = new Set<string>();
      let losersPlayingAgain = 0;

      allSeries.forEach((s) => {
        const teamALostBefore = s.teamA && lostTeams.has(s.teamA.id);
        const teamBLostBefore = s.teamB && lostTeams.has(s.teamB.id);

        if (teamALostBefore || teamBLostBefore) {
          losersPlayingAgain++;
        }

        if (s.winnerId) {
          const loserId = s.teamA && s.winnerId === s.teamA.id ? s.teamB?.id : s.teamA?.id;
          if (loserId) lostTeams.add(loserId);
        }
      });

      const isDouble = losersPlayingAgain >= 2;

      if (isDouble) {
        // Double Elimination partition
        const maxOrder = Math.max(...allSeries.map((s) => s.matchOrder));
        const gf = allSeries.find((s) => s.matchOrder === maxOrder) || null;

        const lostBeforeSet = new Set<string>();
        const upperList: MatchSeries[] = [];
        const lowerList: MatchSeries[] = [];

        allSeries.forEach((s) => {
          if (s.matchOrder === maxOrder) return; // Grand final handled separately

          const aLost = s.teamA && lostBeforeSet.has(s.teamA.id);
          const bLost = s.teamB && lostBeforeSet.has(s.teamB.id);

          if (aLost || bLost) {
            lowerList.push(s);
          } else {
            upperList.push(s);
          }

          if (s.winnerId) {
            const loserId = s.teamA && s.winnerId === s.teamA.id ? s.teamB?.id : s.teamA?.id;
            if (loserId) lostBeforeSet.add(loserId);
          }
        });

        // Partition Upper Bracket into rounds (e.g. 4 -> 2 -> 1 matches)
        const uRounds: Array<{ title: string; series: MatchSeries[] }> = [];
        if (upperList.length >= 7) {
          // 8-team upper bracket: 4 quarter, 2 semi, 1 final
          uRounds.push({ title: "Upper Round 1", series: upperList.slice(0, 4) });
          uRounds.push({ title: "Upper Semifinals", series: upperList.slice(4, 6) });
          uRounds.push({ title: "Upper Final", series: upperList.slice(6) });
        } else if (upperList.length >= 3) {
          // 4-team upper bracket: 2 semi, 1 final
          uRounds.push({ title: "Upper Semifinals", series: upperList.slice(0, 2) });
          uRounds.push({ title: "Upper Final", series: upperList.slice(2) });
        } else {
          uRounds.push({ title: "Upper Bracket", series: upperList });
        }

        // Partition Lower Bracket into rounds
        const lRounds: Array<{ title: string; series: MatchSeries[] }> = [];

        if (upperList.length >= 8 || lowerList.length >= 7) {
          // 16-team lower bracket: 4 -> 4 -> 2 -> 2 -> 1 -> 1
          const r1 = lowerList.slice(0, 4);
          const r2 = lowerList.slice(4, 8);
          const r3 = lowerList.slice(8, 10);
          const r4 = lowerList.slice(10, 12);
          const semi = lowerList.slice(12, 13);
          const final = lowerList.slice(13);

          if (r1.length > 0) lRounds.push({ title: "Lower Round 1", series: r1 });
          if (r2.length > 0) lRounds.push({ title: "Lower Round 2", series: r2 });
          if (r3.length > 0) lRounds.push({ title: "Lower Round 3", series: r3 });
          if (r4.length > 0) lRounds.push({ title: "Lower Round 4", series: r4 });
          if (semi.length > 0) lRounds.push({ title: "Lower Semifinal", series: semi });
          if (final.length > 0) lRounds.push({ title: "Lower Final", series: final });
        } else if (upperList.length >= 4 || lowerList.length >= 3) {
          // 8-team lower bracket:
          // Lower R1: 2 matches (losers of Upper R1: M7, M8)
          // Lower R2: 2 matches (winners of Lower R1 vs losers of Upper Semi: M9, M10)
          // Lower Semifinal: 1 match (winners of Lower R2: M12)
          // Lower Final: 1 match (winner of Lower Semi vs loser of Upper Final: M13)
          const r1 = lowerList.slice(0, 2);
          const r2 = lowerList.slice(2, 4);
          const semi = lowerList.slice(4, 5);
          const final = lowerList.slice(5);

          if (r1.length > 0) lRounds.push({ title: "Lower Round 1", series: r1 });
          if (r2.length > 0) lRounds.push({ title: "Lower Round 2", series: r2 });
          if (semi.length > 0) lRounds.push({ title: "Lower Semifinal", series: semi });
          if (final.length > 0) lRounds.push({ title: "Lower Final", series: final });
        } else if (lowerList.length >= 2) {
          // 4-team lower bracket: 1 -> 1
          lRounds.push({ title: "Lower Semifinal", series: lowerList.slice(0, 1) });
          lRounds.push({ title: "Lower Final", series: lowerList.slice(1) });
        } else if (lowerList.length === 1) {
          lRounds.push({ title: "Lower Semifinal", series: lowerList });
        } else {
          lRounds.push({ title: "Lower Bracket", series: lowerList });
        }

        return {
          isDoubleElimination: true,
          upperRounds: uRounds,
          lowerRounds: lRounds,
          grandFinal: gf,
          singleElimRounds: [],
          bronzeMatch: null,
        };
      } else {
        // Single Elimination partition
        let bronze: MatchSeries | null = null;
        let mainSeries = allSeries;

        // Check if there is an explicit bronze / 3rd place match
        const maxOrder = Math.max(...allSeries.map((s) => s.matchOrder));
        const finalMatch = allSeries.find((s) => s.matchOrder === maxOrder);

        // Check if match before final has loser of semifinal
        if (allSeries.length >= 4) {
          const candidateBronze = allSeries[allSeries.length - 2];
          // If candidateBronze does not lead to finalMatch, it might be 3rd place decider
          if (
            candidateBronze &&
            candidateBronze.winnerId !== finalMatch?.teamA?.id &&
            candidateBronze.winnerId !== finalMatch?.teamB?.id
          ) {
            bronze = candidateBronze;
            mainSeries = allSeries.filter((s) => s.matchOrder !== candidateBronze.matchOrder);
          }
        }

        const sRounds: Array<{ title: string; series: MatchSeries[] }> = [];
        if (mainSeries.length >= 15) {
          sRounds.push({ title: "Round of 16", series: mainSeries.slice(0, 8) });
          sRounds.push({ title: "Quarterfinals", series: mainSeries.slice(8, 12) });
          sRounds.push({ title: "Semifinals", series: mainSeries.slice(12, 14) });
          sRounds.push({ title: "Grand Final", series: mainSeries.slice(14) });
        } else if (mainSeries.length >= 7) {
          sRounds.push({ title: "Quarterfinals", series: mainSeries.slice(0, 4) });
          sRounds.push({ title: "Semifinals", series: mainSeries.slice(4, 6) });
          sRounds.push({ title: "Grand Final", series: mainSeries.slice(6) });
        } else if (mainSeries.length >= 3) {
          sRounds.push({ title: "Semifinals", series: mainSeries.slice(0, 2) });
          sRounds.push({ title: "Grand Final", series: mainSeries.slice(2) });
        } else {
          sRounds.push({ title: "Playoff Final", series: mainSeries });
        }

        return {
          isDoubleElimination: false,
          upperRounds: [],
          lowerRounds: [],
          grandFinal: null,
          singleElimRounds: sRounds,
          bronzeMatch: bronze,
        };
      }
    }, [matches]);

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
        <Swords className="h-8 w-8 text-neutral-400 mb-3" />
        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
          Belum ada bagan pertandingan yang dapat ditampilkan.
        </p>
      </div>
    );
  }

  // Component to render a match series card (Challonge style)
  const renderMatchCard = (series: MatchSeries, customLabel?: string) => {
    const isWinnerA = series.winnerId && series.teamA && series.winnerId === series.teamA.id;
    const isWinnerB = series.winnerId && series.teamB && series.winnerId === series.teamB.id;

    const isHoveredA = series.teamA && hoveredTeamId === series.teamA.id;
    const isHoveredB = series.teamB && hoveredTeamId === series.teamB.id;
    const isHoveredMatch = isHoveredA || isHoveredB;

    return (
      <div
        key={series.matchOrder}
        className={`w-64 rounded-xl border transition-all shadow-xs overflow-hidden flex flex-col ${
          isHoveredMatch
            ? "border-brand-500 ring-2 ring-brand-500/20 bg-white dark:bg-neutral-900"
            : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 hover:border-neutral-300 dark:hover:border-neutral-700"
        }`}
      >
        {/* Match Header */}
        <div className="px-3 py-1.5 bg-neutral-50 dark:bg-neutral-950/70 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-neutral-700 dark:text-neutral-300">
              M{series.matchOrder}
            </span>
            {customLabel && <span>• {customLabel}</span>}
          </div>
          <div>
            {series.status === "COMPLETED" ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium">
                Selesai
              </span>
            ) : series.status === "ONGOING" ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                Live
              </span>
            ) : (
              <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                Jadwal
              </span>
            )}
          </div>
        </div>

        {/* Team A Row */}
        <div
          onMouseEnter={() => series.teamA && setHoveredTeamId(series.teamA.id)}
          onMouseLeave={() => setHoveredTeamId(null)}
          className={`flex items-center justify-between px-3 py-2 transition-colors cursor-pointer border-b border-neutral-100 dark:border-neutral-800/60 ${
            isHoveredA
              ? "bg-brand-500/15 text-brand-700 dark:text-brand-300 font-bold"
              : isWinnerA
                ? "bg-emerald-50/40 dark:bg-emerald-950/15"
                : "hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 pr-2">
            {isWinnerA ? (
              <Trophy className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            ) : (
              <div className="h-1.5 w-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700 shrink-0" />
            )}
            <span
              className={`text-xs truncate ${
                isWinnerA
                  ? "font-bold text-neutral-900 dark:text-white"
                  : "text-neutral-600 dark:text-neutral-400 font-medium"
              }`}
              title={series.teamA?.name || "TBD"}
            >
              {series.teamA?.name || "TBD"}
            </span>
          </div>
          <span
            className={`font-mono text-xs px-1.5 py-0.5 rounded shrink-0 font-bold ${
              isWinnerA
                ? "bg-brand-500 text-white"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
            }`}
          >
            {series.gamesWonA}
          </span>
        </div>

        {/* Team B Row */}
        <div
          onMouseEnter={() => series.teamB && setHoveredTeamId(series.teamB.id)}
          onMouseLeave={() => setHoveredTeamId(null)}
          className={`flex items-center justify-between px-3 py-2 transition-colors cursor-pointer ${
            isHoveredB
              ? "bg-brand-500/15 text-brand-700 dark:text-brand-300 font-bold"
              : isWinnerB
                ? "bg-emerald-50/40 dark:bg-emerald-950/15"
                : "hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 pr-2">
            {isWinnerB ? (
              <Trophy className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            ) : (
              <div className="h-1.5 w-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700 shrink-0" />
            )}
            <span
              className={`text-xs truncate ${
                isWinnerB
                  ? "font-bold text-neutral-900 dark:text-white"
                  : "text-neutral-600 dark:text-neutral-400 font-medium"
              }`}
              title={series.teamB?.name || "TBD"}
            >
              {series.teamB?.name || "TBD"}
            </span>
          </div>
          <span
            className={`font-mono text-xs px-1.5 py-0.5 rounded shrink-0 font-bold ${
              isWinnerB
                ? "bg-brand-500 text-white"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
            }`}
          >
            {series.gamesWonB}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-neutral-50 dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl shrink-0">
            <GitCommit className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h4 className="text-base font-bold text-neutral-900 dark:text-white">
                Bagan Playoff
              </h4>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                {isDoubleElimination ? "Double Elimination" : "Single Elimination"}
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Sorot nama tim untuk melihat alur bagan
            </p>
          </div>
        </div>

        {championName && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-200 text-xs font-bold self-start sm:self-auto shadow-xs shrink-0">
            <Trophy className="h-4 w-4 text-amber-500 shrink-0" />
            <span>Juara: {championName}</span>
          </div>
        )}
      </div>

      {/* Horizontal Scrollable Bracket Canvas */}
      <div className="w-full overflow-x-auto pb-6 scrollbar-thin">
        {isDoubleElimination ? (
          /* ==========================================================
             DOUBLE ELIMINATION LAYOUT (Challonge Style)
             ========================================================== */
          <div className="flex flex-col gap-10 min-w-max pr-6">
            {/* 1. UPPER BRACKET SECTION */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="h-4 w-1 bg-brand-500 rounded-full" />
                <h5 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                  Upper Bracket
                </h5>
              </div>

              <div className="flex items-stretch gap-8">
                {upperRounds.map((round) => (
                  <div key={round.title} className="flex flex-col gap-3">
                    <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider text-center pb-1 border-b border-neutral-200 dark:border-neutral-800">
                      {round.title}
                    </div>
                    <div className="flex flex-col justify-around gap-6 h-full py-2">
                      {round.series.map((s) => renderMatchCard(s))}
                    </div>
                  </div>
                ))}

                {/* Grand Final Column connected to Upper Bracket */}
                {grandFinal && (
                  <div className="flex flex-col gap-3 pl-4 border-l border-dashed border-neutral-300 dark:border-neutral-700">
                    <div className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider text-center pb-1 border-b border-brand-300 dark:border-brand-700 flex items-center justify-center gap-1.5">
                      <Trophy className="h-3.5 w-3.5 text-amber-500" />
                      Grand Final
                    </div>
                    <div className="flex flex-col justify-center gap-4 h-full py-2">
                      {renderMatchCard(grandFinal, "Laga Puncak")}
                      {grandFinal.winnerId && (
                        <div className="p-3 bg-linear-to-r from-amber-50 to-amber-100/60 dark:from-amber-950/40 dark:to-amber-900/20 border border-amber-300 dark:border-amber-800 rounded-xl text-center">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block mb-0.5">
                            Tournament Champion
                          </span>
                          <span className="text-sm font-black text-amber-900 dark:text-amber-200">
                            {grandFinal.teamA?.id === grandFinal.winnerId
                              ? grandFinal.teamA.name
                              : grandFinal.teamB?.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. LOWER BRACKET SECTION */}
            <div className="flex flex-col gap-4 pt-6 border-t border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="h-4 w-1 bg-amber-500 rounded-full" />
                <h5 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                  Lower Bracket
                </h5>
              </div>

              <div className="flex items-stretch gap-8">
                {lowerRounds.map((round) => (
                  <div key={round.title} className="flex flex-col gap-3">
                    <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider text-center pb-1 border-b border-neutral-200 dark:border-neutral-800">
                      {round.title}
                    </div>
                    <div className="flex flex-col justify-around gap-6 h-full py-2">
                      {round.series.map((s) => renderMatchCard(s))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ==========================================================
             SINGLE ELIMINATION LAYOUT (Challonge Style)
             ========================================================== */
          <div className="flex items-stretch gap-8 min-w-max pr-6">
            {singleElimRounds.map((round) => (
              <div key={round.title} className="flex flex-col gap-3">
                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider text-center pb-1 border-b border-neutral-200 dark:border-neutral-800">
                  {round.title}
                </div>
                <div className="flex flex-col justify-around gap-6 h-full py-2">
                  {round.series.map((s) => renderMatchCard(s))}
                </div>
              </div>
            ))}

            {/* Optional 3rd place decider */}
            {bronzeMatch && (
              <div className="flex flex-col gap-3 pl-4 border-l border-dashed border-neutral-300 dark:border-neutral-700">
                <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider text-center pb-1 border-b border-amber-300 dark:border-amber-700">
                  Perebutan Juara 3
                </div>
                <div className="flex flex-col justify-center gap-4 h-full py-2">
                  {renderMatchCard(bronzeMatch, "Bronze Match")}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
