import React from "react";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Trophy, Calendar, MapPin, Clock } from "lucide-react";

export const metadata = {
  title: "Events | Polar Catalyst",
  description: "Jadwal dan event turnamen terbaru dari Polar Catalyst.",
};

export default async function JadwalPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let tournaments: any[] = [];
  try {
    tournaments = await prisma.tournament.findMany({
      where: {
        status: {
          in: ["ONGOING", "UPCOMING", "COMPLETED"],
        },
      },
      orderBy: {
        startDate: "desc",
      },
      include: {
        teams: {
          orderBy: { name: "asc" },
        },
        matches: {
          orderBy: [{ roundNumber: "asc" }, { matchOrder: "asc" }],
          include: {
            teamA: true,
            teamB: true,
            winner: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Gagal mengambil jadwal dari database:", error);
    // Jika koneksi DB gagal, kita akan kembalikan array kosong agar UI tetap berjalan.
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
            <Calendar className="h-8 w-8" suppressHydrationWarning />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Events
          </h1>
          <p className="max-w-2xl text-lg text-brand-200">
            Pantau jadwal pertandingan, hasil terbaru, dan status bracket
            turnamen komunitas yang diselenggarakan oleh Polar Catalyst.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="container mx-auto px-4 py-16 md:px-8 max-w-5xl">
        {tournaments.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <Trophy
              className="mx-auto h-12 w-12 text-neutral-300 dark:text-neutral-700 mb-4"
              suppressHydrationWarning
            />
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
              Belum Ada Event
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400">
              Jadwal event berikutnya akan segera diumumkan.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {tournaments.map(
              (
                tournament: any /* eslint-disable-line @typescript-eslint/no-explicit-any */,
              ) => (
                <div key={tournament.id} className="flex flex-col gap-6">
                  {/* Tournament Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            tournament.status === "ONGOING"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : tournament.status === "UPCOMING"
                                ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400"
                                : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                          }`}
                        >
                          {tournament.status === "ONGOING"
                            ? "Live"
                            : tournament.status}
                        </span>
                        <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {tournament.game}
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {tournament.name}
                      </h2>
                      {tournament.description && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                          {tournament.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-950 px-4 py-2 rounded-lg border border-neutral-100 dark:border-neutral-800">
                      <Clock className="h-4 w-4" />
                      <span>
                        {format(new Date(tournament.startDate), "dd MMM yyyy", {
                          locale: id,
                        })}
                        {tournament.endDate &&
                          ` - ${format(new Date(tournament.endDate), "dd MMM yyyy", { locale: id })}`}
                      </span>
                    </div>
                  </div>

                  {tournament.status === "ONGOING" && (
                    <>
                      {/* Teams List (MPL Style) */}
                      {tournament.teams && tournament.teams.length > 0 && (
                        <div className="flex flex-col gap-6 py-6 border-b border-neutral-200 dark:border-neutral-800">
                          <h3
                            className="text-2xl font-bold text-center text-neutral-900 dark:text-white uppercase tracking-[0.2em] opacity-80"
                            style={{
                              fontFamily: 'Impact, "Arial Black", sans-serif',
                            }}
                          >
                            TIM
                          </h3>
                          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                            {tournament.teams.map(
                              (
                                team: any /* eslint-disable-line @typescript-eslint/no-explicit-any */,
                              ) => (
                                <div
                                  key={team.id}
                                  className="relative w-24 md:w-30 flex flex-col items-center"
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
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      {/* Matches List */}
                      {tournament.matches.length === 0 ? (
                        <div className="text-center py-12 bg-white/50 dark:bg-neutral-900/50 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700">
                          <p className="text-neutral-500 dark:text-neutral-400">
                            Jadwal match belum ditentukan untuk turnamen ini.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {tournament.matches.map(
                            (
                              match: any /* eslint-disable-line @typescript-eslint/no-explicit-any */,
                            ) => (
                              <div
                                key={match.id}
                                className="group flex flex-col p-5 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xs hover:shadow-md hover:border-brand-300 dark:hover:border-brand-700 transition-all"
                              >
                                <div className="flex justify-between items-center mb-4 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                  <span>
                                    Round {match.roundNumber} - Match{" "}
                                    {match.matchOrder}
                                  </span>
                                  <div className="flex items-center gap-1 text-brand-600 dark:text-brand-400">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                      {match.scheduledAt
                                        ? format(
                                            new Date(match.scheduledAt),
                                            "dd MMM • HH:mm",
                                            { locale: id },
                                          )
                                        : "TBA"}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                  {/* Team A */}
                                  <div
                                    className={`flex items-center justify-between p-3 rounded-lg ${match.winnerId === match.teamAId ? "bg-brand-50/50 dark:bg-brand-900/10" : "bg-neutral-50 dark:bg-neutral-950"}`}
                                  >
                                    <span
                                      className={`font-semibold ${match.winnerId === match.teamAId ? "text-brand-700 dark:text-brand-300" : "text-neutral-700 dark:text-neutral-300"}`}
                                    >
                                      {match.teamA?.name || "TBD"}
                                    </span>
                                    <span className="font-bold text-lg text-neutral-900 dark:text-white">
                                      {match.scoreA !== null
                                        ? match.scoreA
                                        : "-"}
                                    </span>
                                  </div>

                                  {/* Team B */}
                                  <div
                                    className={`flex items-center justify-between p-3 rounded-lg ${match.winnerId === match.teamBId ? "bg-brand-50/50 dark:bg-brand-900/10" : "bg-neutral-50 dark:bg-neutral-950"}`}
                                  >
                                    <span
                                      className={`font-semibold ${match.winnerId === match.teamBId ? "text-brand-700 dark:text-brand-300" : "text-neutral-700 dark:text-neutral-300"}`}
                                    >
                                      {match.teamB?.name || "TBD"}
                                    </span>
                                    <span className="font-bold text-lg text-neutral-900 dark:text-white">
                                      {match.scoreB !== null
                                        ? match.scoreB
                                        : "-"}
                                    </span>
                                  </div>
                                </div>

                                {/* Match Status */}
                                <div className="mt-4 flex justify-between items-center pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                  <span
                                    className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                                      match.status === "COMPLETED"
                                        ? "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                                        : match.status === "ONGOING"
                                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                          : "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                    }`}
                                  >
                                    {match.status}
                                  </span>

                                  {match.status === "COMPLETED" &&
                                    match.winner && (
                                      <span className="text-xs font-medium text-neutral-500 flex items-center gap-1">
                                        Winner:{" "}
                                        <span className="font-bold text-brand-600 dark:text-brand-400">
                                          {match.winner.name}
                                        </span>
                                      </span>
                                    )}
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ),
            )}
          </div>
        )}
      </section>
    </div>
  );
}
