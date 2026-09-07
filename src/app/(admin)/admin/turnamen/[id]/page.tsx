import React from "react";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  Save,
  Users,
  Swords,
  Plus,
  Check,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import {
  updateTournamentStatus,
  addTeam,
  addMatch,
  updateMatchResult,
  deleteTeam,
  deleteMatch,
  deleteTournament,
} from "@/app/actions/admin";
import { redirect } from "next/navigation";

export default async function TournamentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      teams: { orderBy: { name: "asc" } },
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

  if (!tournament) return <div>Tournament not found</div>;

  // Server action bind for status update
  const handleStatusUpdate = async (formData: FormData) => {
    "use server";
    const status = formData.get("status") as string;
    await updateTournamentStatus(id, status);
  };

  // Server action bind for match update
  const handleMatchUpdate = async (formData: FormData) => {
    "use server";
    const matchId = formData.get("matchId") as string;
    const scoreA = formData.get("scoreA")
      ? parseInt(formData.get("scoreA") as string)
      : null;
    const scoreB = formData.get("scoreB")
      ? parseInt(formData.get("scoreB") as string)
      : null;
    const winnerId = (formData.get("winnerId") as string) || null;
    const status = formData.get("status") as string;

    await updateMatchResult(matchId, { scoreA, scoreB, winnerId, status });
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/turnamen"
            className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {tournament.name}
            </h1>
            <p className="text-neutral-500 text-sm mt-1">
              {tournament.game} • {tournament.slug}
            </p>
          </div>
        </div>

        <form
          action={async (formData) => {
            "use server";
            await deleteTournament(formData);
            redirect("/admin/turnamen");
          }}
        >
          <input type="hidden" name="tournamentId" value={id} />
          <button
            type="submit"
            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium"
          >
            <Trash2 className="h-4 w-4" /> Hapus Turnamen
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: General Info & Teams */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          {/* Status Update */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 dark:text-white">
              Status Turnamen
            </h2>
            <form action={handleStatusUpdate} className="flex flex-col gap-4">
              <select
                name="status"
                defaultValue={tournament.status}
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl outline-none dark:text-white"
              >
                <option value="UPCOMING">UPCOMING</option>
                <option value="ONGOING">ONGOING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
              <button
                type="submit"
                className="w-full bg-brand-500 hover:bg-brand-600 text-white py-2.5 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <Save className="h-4 w-4" /> Update Status
              </button>
            </form>
          </div>

          {/* Manage Teams */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold dark:text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-brand-500" /> Tim Peserta
              </h2>
              <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md text-xs font-bold">
                {tournament.teams.length}
              </span>
            </div>

            <form
              action={async (formData) => {
                "use server";
                await addTeam(formData);
              }}
              className="flex gap-2 mb-4"
            >
              <input type="hidden" name="tournamentId" value={id} />
              <input
                type="text"
                name="name"
                placeholder="Nama tim baru..."
                required
                className="flex-1 px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg outline-none text-sm dark:text-white"
              />
              <button
                type="submit"
                className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-3 py-2 rounded-lg hover:opacity-80 transition-opacity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </form>

            <div className="flex-1 overflow-y-auto max-h-75 border border-neutral-100 dark:border-neutral-800 rounded-xl p-2">
              {tournament.teams.length === 0 ? (
                <p className="text-center text-neutral-400 text-sm py-4">
                  Belum ada tim.
                </p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {tournament.teams.map((team) => (
                    <li
                      key={team.id}
                      className="px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-950 rounded-lg dark:text-neutral-300 font-medium flex items-center justify-between group"
                    >
                      <span>{team.name}</span>
                      <form
                        action={async (formData) => {
                          "use server";
                          await deleteTeam(formData);
                        }}
                      >
                        <input type="hidden" name="teamId" value={team.id} />
                        <input type="hidden" name="tournamentId" value={id} />
                        <button
                          type="submit"
                          className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Manage Matches */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                <Swords className="h-6 w-6 text-brand-500" /> Pertandingan
                (Matches)
              </h2>
            </div>

            {/* Add Match Form */}
            <form
              action={async (formData) => {
                "use server";
                await addMatch(formData);
              }}
              className="flex flex-wrap items-end gap-3 p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl mb-6 border border-neutral-200 dark:border-neutral-800"
            >
              <input type="hidden" name="tournamentId" value={id} />
              <div className="flex flex-col gap-1 flex-1 min-w-25">
                <label className="text-xs font-semibold text-neutral-500">
                  Round
                </label>
                <input
                  type="number"
                  name="roundNumber"
                  required
                  min="1"
                  defaultValue="1"
                  className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 outline-none text-sm dark:text-white"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-25">
                <label className="text-xs font-semibold text-neutral-500">
                  Urutan (Order)
                </label>
                <input
                  type="number"
                  name="matchOrder"
                  required
                  min="1"
                  defaultValue="1"
                  className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 outline-none text-sm dark:text-white"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-37.5">
                <label className="text-xs font-semibold text-neutral-500">
                  Team A
                </label>
                <select
                  name="teamAId"
                  className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 outline-none text-sm dark:text-white"
                >
                  <option value="">TBD</option>
                  {tournament.teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-37.5">
                <label className="text-xs font-semibold text-neutral-500">
                  Team B
                </label>
                <select
                  name="teamBId"
                  className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 outline-none text-sm dark:text-white"
                >
                  <option value="">TBD</option>
                  {tournament.teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-4 py-2 rounded-lg hover:opacity-80 transition-opacity font-medium text-sm flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Add
              </button>
            </form>

            {/* Matches List */}
            <div className="flex flex-col gap-4">
              {tournament.matches.length === 0 ? (
                <p className="text-center text-neutral-400 text-sm py-8">
                  Belum ada jadwal pertandingan.
                </p>
              ) : (
                tournament.matches.map((match) => (
                  <div
                    key={match.id}
                    className="flex flex-col md:flex-row items-center gap-2"
                  >
                    <form
                      action={handleMatchUpdate}
                      className="flex-1 flex flex-col md:flex-row items-center gap-4 p-4 border border-neutral-100 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
                    >
                      <input type="hidden" name="matchId" value={match.id} />

                      <div className="flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 rounded-lg px-3 py-2 font-mono text-xs font-bold w-full md:w-auto">
                        R{match.roundNumber} - M{match.matchOrder}
                      </div>

                      <div className="flex-1 flex items-center justify-between gap-4 w-full">
                        <div className="flex flex-col items-end flex-1">
                          <span
                            className={`text-sm font-semibold truncate ${match.winnerId === match.teamAId ? "text-brand-500" : "dark:text-white"}`}
                          >
                            {match.teamA?.name || "TBD"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            name="scoreA"
                            defaultValue={match.scoreA ?? ""}
                            className="w-12 px-2 py-1 text-center rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 dark:text-white outline-none"
                          />
                          <span className="text-neutral-400 font-bold">-</span>
                          <input
                            type="number"
                            name="scoreB"
                            defaultValue={match.scoreB ?? ""}
                            className="w-12 px-2 py-1 text-center rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 dark:text-white outline-none"
                          />
                        </div>

                        <div className="flex flex-col items-start flex-1">
                          <span
                            className={`text-sm font-semibold truncate ${match.winnerId === match.teamBId ? "text-brand-500" : "dark:text-white"}`}
                          >
                            {match.teamB?.name || "TBD"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-start">
                        <select
                          name="winnerId"
                          defaultValue={match.winnerId || ""}
                          className="px-2 py-1 text-xs rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 dark:text-white outline-none"
                        >
                          <option value="">No Winner Yet</option>
                          {match.teamAId && (
                            <option value={match.teamAId}>
                              {match.teamA?.name}
                            </option>
                          )}
                          {match.teamBId && (
                            <option value={match.teamBId}>
                              {match.teamB?.name}
                            </option>
                          )}
                        </select>

                        <select
                          name="status"
                          defaultValue={match.status}
                          className="px-2 py-1 text-xs rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 dark:text-white outline-none"
                        >
                          <option value="SCHEDULED">SCHEDULED</option>
                          <option value="ONGOING">ONGOING</option>
                          <option value="COMPLETED">COMPLETED</option>
                        </select>

                        <button
                          type="submit"
                          className="bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white p-1.5 rounded-md transition-colors"
                          title="Simpan Perubahan"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      </div>
                    </form>
                    <form
                      action={async (formData) => {
                        "use server";
                        await deleteMatch(formData);
                      }}
                    >
                      <input type="hidden" name="matchId" value={match.id} />
                      <input type="hidden" name="tournamentId" value={id} />
                      <button
                        type="submit"
                        className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
                        title="Hapus Match"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
