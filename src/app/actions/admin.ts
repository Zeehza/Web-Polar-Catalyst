"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { withAdminActionError } from "@/lib/action-utils";

export async function createTournament(prevState: unknown, formData: FormData) {
  return withAdminActionError("creating tournament", "Gagal membuat turnamen.", async () => {
    const name = (formData.get("name") as string)?.trim();
    const season = ((formData.get("season") as string) || "Season 1").trim();
    const game = (formData.get("game") as string)?.trim();
    const type = (formData.get("type") as string) || "PLAYOFF";
    const startDateStr = formData.get("startDate") as string;
    
    if (!name || !game || !startDateStr) {
      return { success: false, error: "Nama, Game, dan Tanggal Mulai wajib diisi." };
    }

    const startDate = new Date(startDateStr);
    if (isNaN(startDate.getTime())) {
      return { success: false, error: "Format Tanggal Mulai tidak valid." };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = await (prisma.tournament as any).findFirst({
      where: {
        name,
        season,
      },
    });

    if (existing) {
      return {
        success: false,
        error: `Turnamen "${name}" dengan ${season} sudah ada. Silakan gunakan nama season lain (misal: Season 2).`,
      };
    }

    const slug = `${name}-${season}`.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const created = await (prisma.tournament.create as any)({
        data: {
          name,
          season,
          slug,
          game,
          type,
          startDate,
          status: "DRAFT",
        },
      });

      revalidatePath("/admin/turnamen");
      revalidatePath("/events");
      revalidatePath("/results");
      return { success: true, redirect: `/admin/turnamen/${created.id}` };
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      if (error?.code === "P2002") {
        return {
          success: false,
          error: `Turnamen "${name}" dengan ${season} sudah ada di database. Silakan gunakan label season lain (misal: Season 2).`,
        };
      }
      throw error;
    }
  });
}

export async function updateTournamentInfo(
  id: string,
  statusOrData: string | { status: string; type: string; name?: string; season?: string; description?: string | null },
  typeArg?: string
) {
  return withAdminActionError("updating tournament info", "Gagal mengubah info turnamen.", async () => {
    let status: string;
    let type: string;
    let name: string | undefined;
    let season: string | undefined;
    let description: string | null | undefined;

    if (typeof statusOrData === "object") {
      status = statusOrData.status;
      type = statusOrData.type;
      name = statusOrData.name?.trim();
      season = statusOrData.season?.trim();
      description = statusOrData.description;
    } else {
      status = statusOrData;
      type = typeArg || "PLAYOFF";
    }

    if (name && season) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existing = await (prisma.tournament as any).findFirst({
        where: { name, season },
      });
      if (existing && existing.id !== id) {
        return { success: false, error: `Turnamen "${name}" dengan ${season} sudah ada.` };
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma.tournament.update as any)({
      where: { id },
      data: {
        status,
        type,
        ...(name ? { name } : {}),
        ...(season ? { season } : {}),
        ...(description !== undefined ? { description } : {}),
      },
    });
    revalidatePath(`/admin/turnamen/${id}`);
    revalidatePath("/admin/turnamen");
    revalidatePath("/events");
    revalidatePath("/results");
    return { success: true };
  });
}

export async function addTeam(formData: FormData) {
  return withAdminActionError("adding team", "Gagal menambahkan tim.", async () => {
    const name = formData.get("name") as string;
    const tournamentId = formData.get("tournamentId") as string;
    const logoUrl = formData.get("logoUrl") as string;
    const group = (formData.get("group") as string) || null;

    if (!name || !tournamentId) {
      return { success: false, error: "Nama tim wajib diisi." };
    }

    await prisma.team.create({
      data: {
        name,
        tournamentId,
        logoUrl: logoUrl || null,
        group,
      },
    });

    revalidatePath(`/admin/turnamen/${tournamentId}`);
    return { success: true, message: "Tim berhasil ditambahkan." };
  });
}

export async function addMatch(formData: FormData) {
  return withAdminActionError("adding match", "Gagal menambahkan match (pastikan Match & Game unik).", async () => {
    const tournamentId = formData.get("tournamentId") as string;
    const matchOrder = parseInt(formData.get("matchOrder") as string);
    const roundNumber = parseInt(formData.get("roundNumber") as string);
    const teamAId = formData.get("teamAId") as string || null;
    const teamBId = formData.get("teamBId") as string || null;
    const scheduledAtStr = formData.get("scheduledAt") as string;

    await prisma.match.create({
      data: {
        tournamentId,
        matchOrder,
        roundNumber,
        teamAId,
        teamBId,
        scheduledAt: scheduledAtStr ? new Date(scheduledAtStr) : null,
        status: "SCHEDULED"
      }
    });

    revalidatePath(`/admin/turnamen/${tournamentId}`);
    revalidatePath("/events");
    return { success: true, message: "Match & Game berhasil ditambahkan." };
  });
}

export async function updateMatchResult(matchId: string, data: {
  scoreA: number | null;
  scoreB: number | null;
  winnerId: string | null;
  status: string;
  scheduledAt?: string | null;
}) {
  return withAdminActionError("updating match", "Gagal memperbarui match.", async () => {
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) throw new Error("Match not found");

    await prisma.match.update({
      where: { id: matchId },
      data: {
        scoreA: data.scoreA,
        scoreB: data.scoreB,
        winnerId: data.winnerId,
        status: data.status,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        playedAt: data.status === "COMPLETED" && match.status !== "COMPLETED" ? new Date() : undefined,
      }
    });

    revalidatePath(`/admin/turnamen/${match.tournamentId}`);
    revalidatePath("/events");
    revalidatePath("/results");
    return { success: true };
  });
}

export async function updateTeamGroup(teamId: string, group: string | null) {
  return withAdminActionError("updating team group", "Gagal memperbarui grup tim.", async () => {
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new Error("Team not found");

    await prisma.team.update({
      where: { id: teamId },
      data: { group },
    });

    revalidatePath(`/admin/turnamen/${team.tournamentId}`);
    return { success: true };
  });
}

export async function deleteTeam(formData: FormData) {
  return withAdminActionError("deleting team", "Gagal menghapus tim.", async () => {
    const teamId = formData.get("teamId") as string;
    const tournamentId = formData.get("tournamentId") as string;
    await prisma.team.delete({ where: { id: teamId } });
    revalidatePath(`/admin/turnamen/${tournamentId}`);
    return { success: true };
  });
}

export async function deleteMatch(formData: FormData) {
  return withAdminActionError("deleting match", "Gagal menghapus match.", async () => {
    const matchId = formData.get("matchId") as string;
    const tournamentId = formData.get("tournamentId") as string;
    await prisma.match.delete({ where: { id: matchId } });
    revalidatePath(`/admin/turnamen/${tournamentId}`);
    return { success: true };
  });
}

export async function deleteTournament(formData: FormData) {
  return withAdminActionError("deleting tournament", "Gagal menghapus turnamen.", async () => {
    const tournamentId = formData.get("tournamentId") as string;
    await prisma.tournament.delete({ where: { id: tournamentId } });
    revalidatePath("/admin/turnamen");
    return { success: true };
  });
}
