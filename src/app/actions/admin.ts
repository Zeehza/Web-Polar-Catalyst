"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTournament(prevState: unknown, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const game = formData.get("game") as string;
    const startDateStr = formData.get("startDate") as string;
    
    if (!name || !game || !startDateStr) {
      return { success: false, error: "Nama, Game, dan Tanggal Mulai wajib diisi." };
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();

    await prisma.tournament.create({
      data: {
        name,
        slug,
        game,
        startDate: new Date(startDateStr),
        status: "DRAFT",
      },
    });

    revalidatePath("/admin/turnamen");
    revalidatePath("/events");
    return { success: true, redirect: "/admin/turnamen" };
  } catch (error) {
    console.error("Error creating tournament:", error);
    return { success: false, error: "Gagal membuat turnamen." };
  }
}

export async function updateTournamentStatus(id: string, status: string) {
  try {
    await prisma.tournament.update({
      where: { id },
      data: { status },
    });
    revalidatePath(`/admin/turnamen/${id}`);
    revalidatePath("/events");
    revalidatePath("/results");
    return { success: true };
  } catch (error) {
    console.error("Error updating tournament status:", error);
    return { success: false, error: "Gagal mengubah status turnamen." };
  }
}

export async function addTeam(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const tournamentId = formData.get("tournamentId") as string;
    const logoUrl = formData.get("logoUrl") as string;

    if (!name || !tournamentId) {
      return { success: false, error: "Nama tim wajib diisi." };
    }

    await prisma.team.create({
      data: {
        name,
        tournamentId,
        logoUrl: logoUrl || null,
      },
    });

    revalidatePath(`/admin/turnamen/${tournamentId}`);
    return { success: true, message: "Tim berhasil ditambahkan." };
  } catch (error) {
    console.error("Error adding team:", error);
    return { success: false, error: "Gagal menambahkan tim." };
  }
}

export async function addMatch(formData: FormData) {
  try {
    const tournamentId = formData.get("tournamentId") as string;
    const roundNumber = parseInt(formData.get("roundNumber") as string);
    const matchOrder = parseInt(formData.get("matchOrder") as string);
    const teamAId = formData.get("teamAId") as string || null;
    const teamBId = formData.get("teamBId") as string || null;
    const scheduledAtStr = formData.get("scheduledAt") as string;

    await prisma.match.create({
      data: {
        tournamentId,
        roundNumber,
        matchOrder,
        teamAId,
        teamBId,
        scheduledAt: scheduledAtStr ? new Date(scheduledAtStr) : null,
        status: "SCHEDULED"
      }
    });

    revalidatePath(`/admin/turnamen/${tournamentId}`);
    revalidatePath("/events");
    return { success: true, message: "Match berhasil ditambahkan." };
  } catch (error) {
    console.error("Error adding match:", error);
    return { success: false, error: "Gagal menambahkan match (pastikan Round & Order unik)." };
  }
}

export async function updateMatchResult(matchId: string, data: {
  scoreA: number | null;
  scoreB: number | null;
  winnerId: string | null;
  status: string;
  scheduledAt?: string | null;
}) {
  try {
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
  } catch (error) {
    console.error("Error updating match:", error);
    return { success: false, error: "Gagal memperbarui match." };
  }
}

export async function deleteTeam(formData: FormData) {
  try {
    const teamId = formData.get("teamId") as string;
    const tournamentId = formData.get("tournamentId") as string;
    await prisma.team.delete({ where: { id: teamId } });
    revalidatePath(`/admin/turnamen/${tournamentId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting team:", error);
    return { success: false, error: "Gagal menghapus tim." };
  }
}

export async function deleteMatch(formData: FormData) {
  try {
    const matchId = formData.get("matchId") as string;
    const tournamentId = formData.get("tournamentId") as string;
    await prisma.match.delete({ where: { id: matchId } });
    revalidatePath(`/admin/turnamen/${tournamentId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting match:", error);
    return { success: false, error: "Gagal menghapus match." };
  }
}

export async function deleteTournament(formData: FormData) {
  try {
    const tournamentId = formData.get("tournamentId") as string;
    await prisma.tournament.delete({ where: { id: tournamentId } });
    revalidatePath("/admin/turnamen");
    return { success: true };
  } catch (error) {
    console.error("Error deleting tournament:", error);
    return { success: false, error: "Gagal menghapus turnamen." };
  }
}
