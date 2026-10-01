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
import { FormWithToast, InnerButton } from "@/components/SubmitButton";
import GroupSelect from "@/components/GroupSelect";
import {
  updateTournamentInfo,
  addTeam,
  addMatch,
  updateMatchResult,
  deleteTeam,
  deleteMatch,
  deleteTournament,
  updateTeamGroup,
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

  // Server action bind for info update
  const handleInfoUpdate = async (formData: FormData) => {
    "use server";
    const status = formData.get("status") as string;
    const type = formData.get("type") as string;
    await updateTournamentInfo(id, status, type);
  };

  // Server action bind for match update
  const handleMatchUpdate = async (formData: FormData) => {
    "use server";
    const matchId = formData.get("matchId") as string;
    const teamAId = (formData.get("teamAId") as string) || null;
    const teamBId = (formData.get("teamBId") as string) || null;
    const scoreA = formData.get("scoreA")
      ? parseInt(formData.get("scoreA") as string)
      : null;
    const scoreB = formData.get("scoreB")
      ? parseInt(formData.get("scoreB") as string)
      : null;
    const status = formData.get("status") as string;
    const scheduledAt = (formData.get("scheduledAt") as string) || null;

    // Auto-determine winner from scores
    let winnerId: string | null = null;
    if (scoreA !== null && scoreB !== null) {
      if (scoreA > scoreB && teamAId) winnerId = teamAId;
      else if (scoreB > scoreA && teamBId) winnerId = teamBId;
    }

    await updateMatchResult(matchId, {
      scoreA,
      scoreB,
      winnerId,
      status,
      scheduledAt,
    });
  };

  // Server action bind for group update
  const handleTeamGroupUpdate = async (formData: FormData) => {
    "use server";
    const teamId = formData.get("teamId") as string;
    const group = (formData.get("group") as string) || null;
    await updateTeamGroup(teamId, group);
  };

  const formatDatetimeLocal = (date: Date | null) => {
    if (!date) return "";
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
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

      <div className="flex flex-col gap-8">
        {/* Top Section: General Info & Teams */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Info Turnamen */}
          <div key={`info-${tournament.status}-${tournament.type}`} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold mb-4 dark:text-white">
                Info Turnamen
              </h2>
              <FormWithToast
                action={handleInfoUpdate}
                className="flex flex-col gap-4"
                toastMessage="Info turnamen terupdate!"
              >
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Status</label>
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
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Tipe</label>
                  <select
                    name="type"
                    defaultValue={tournament.type}
                    className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl outline-none dark:text-white"
                  >
                    <option value="GROUP_STAGE">Group Stage</option>
                    <option value="PLAYOFF">Playoff</option>
                  </select>
                </div>
                <InnerButton className="w-full bg-brand-500 hover:bg-brand-600 text-white py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 mt-4">
                  <Save className="h-4 w-4" /> Update Info
                </InnerButton>
              </FormWithToast>
            </div>
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
              <div className="flex flex-col gap-2 flex-1">
                <input
                  type="text"
                  name="name"
                  placeholder="Nama tim baru..."
                  required
                  className="px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg outline-none text-sm dark:text-white"
                />
                <input
                  type="url"
                  name="logoUrl"
                  placeholder="URL Logo (Opsional)"
                  className="px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg outline-none text-sm dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-3 py-2 rounded-lg hover:opacity-80 transition-opacity flex items-center justify-center self-end h-21.5"
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
                      <div className="flex items-center gap-2">
                        {team.logoUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={team.logoUrl}
                            alt={team.name}
                            className="w-6 h-6 object-contain"
                          />
                        ) : (
                          <div className="w-6 h-6 bg-neutral-200 dark:bg-neutral-800 rounded flex items-center justify-center text-[10px]">
                            ?
                          </div>
                        )}
                        <span className="flex-1">{team.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {tournament.type === "GROUP_STAGE" && (
                          <GroupSelect
                            teamId={team.id}
                            defaultGroup={team.group || ""}
                            action={handleTeamGroupUpdate}
                          />
                        )}
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
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section: Manage Matches */}
        <div className="flex flex-col gap-6">
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
                  Game
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
                  Match
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
              <div className="flex flex-col gap-1 flex-1 min-w-37.5">
                <label className="text-xs font-semibold text-neutral-500">
                  Waktu (Opsional)
                </label>
                <input
                  type="datetime-local"
                  name="scheduledAt"
                  className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 outline-none text-sm dark:text-white"
                />
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
                  <div key={`${match.id}-${match.status}-${match.scoreA}-${match.scoreB}`} className="flex items-start gap-2">
                    <FormWithToast
                      action={handleMatchUpdate}
                      wrapperClassName="flex-1 min-w-0"
                      className="w-full p-4 border border-neutral-100 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 hover:border-brand-300 dark:hover:border-brand-700 transition-colors flex flex-col"
                      toastMessage="Match diperbarui!"
                    >
                      <input type="hidden" name="matchId" value={match.id} />
                      <input
                        type="hidden"
                        name="teamAId"
                        value={match.teamAId || ""}
                      />
                      <input
                        type="hidden"
                        name="teamBId"
                        value={match.teamBId || ""}
                      />

                      {/* Row 1: Match info + Teams + Scores */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg px-2.5 py-1.5 font-mono text-xs font-bold shrink-0">
                          R{match.roundNumber}-M{match.matchOrder}
                        </div>

                        <div className="flex-1 flex items-center gap-2 min-w-0">
                          <span
                            className={`text-sm font-semibold flex-1 text-right ${match.winnerId === match.teamAId ? "text-brand-500" : "dark:text-white"}`}
                          >
                            {match.teamA?.name || "TBD"}
                          </span>
                          <input
                            type="number"
                            name="scoreA"
                            defaultValue={match.scoreA ?? ""}
                            className="w-11 px-1 py-1 text-center text-sm rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 dark:text-white outline-none shrink-0"
                          />
                          <span className="text-neutral-400 font-bold text-xs shrink-0">
                            vs
                          </span>
                          <input
                            type="number"
                            name="scoreB"
                            defaultValue={match.scoreB ?? ""}
                            className="w-11 px-1 py-1 text-center text-sm rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 dark:text-white outline-none shrink-0"
                          />
                          <span
                            className={`text-sm font-semibold flex-1 ${match.winnerId === match.teamBId ? "text-brand-500" : "dark:text-white"}`}
                          >
                            {match.teamB?.name || "TBD"}
                          </span>
                        </div>
                      </div>

                      {/* Row 2: Controls */}
                      <div className="flex items-center justify-center gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                        <input
                          type="datetime-local"
                          name="scheduledAt"
                          defaultValue={formatDatetimeLocal(match.scheduledAt)}
                          title="Waktu (Kosong = TBA)"
                          className="w-auto px-2 py-1 text-xs rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 dark:text-white outline-none"
                        />
                        <select
                          name="status"
                          defaultValue={match.status}
                          className="px-2 py-1 text-xs rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 dark:text-white outline-none"
                        >
                          <option value="SCHEDULED">SCHEDULED</option>
                          <option value="ONGOING">ONGOING</option>
                          <option value="COMPLETED">COMPLETED</option>
                        </select>
                        <InnerButton
                          className="bg-brand-500 hover:bg-brand-600 text-white p-1.5 rounded-md transition-colors"
                          title="Simpan Perubahan"
                        >
                          <Check className="h-4 w-4" />
                        </InnerButton>
                      </div>
                    </FormWithToast>
                    <form
                      action={async (formData) => {
                        "use server";
                        await deleteMatch(formData);
                      }}
                      className="pt-4"
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
