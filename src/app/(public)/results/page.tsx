import React from "react";
import { prisma } from "@/lib/prisma";
import { Trophy, Medal } from "lucide-react";
import TournamentResultGroup, {
  ResultSeason,
} from "@/components/public/TournamentResultGroup";

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
          orderBy: [{ matchOrder: "asc" }, { roundNumber: "asc" }],
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

  // Group tournaments by name
  const groupedMap = new Map<
    string,
    { tournamentName: string; game: string; seasons: ResultSeason[] }
  >();

  tournaments.forEach((t) => {
    if (!groupedMap.has(t.name)) {
      groupedMap.set(t.name, {
        tournamentName: t.name,
        game: t.game,
        seasons: [t as unknown as ResultSeason],
      });
    } else {
      groupedMap.get(t.name)!.seasons.push(t as unknown as ResultSeason);
    }
  });

  const tournamentGroups = Array.from(groupedMap.values());

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
            Lihat rekam jejak kemenangan, podium juara, dan posisi klasemen tim
            di turnamen komunitas Polar Catalyst per season.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="container mx-auto px-4 py-16 md:px-8 max-w-6xl">
        {tournamentGroups.length === 0 ? (
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
            {tournamentGroups.map((group) => (
              <TournamentResultGroup
                key={group.tournamentName}
                tournamentName={group.tournamentName}
                game={group.game}
                seasons={group.seasons}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
