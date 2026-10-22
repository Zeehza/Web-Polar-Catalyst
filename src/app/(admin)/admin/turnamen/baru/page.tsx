import React from "react";
import { prisma } from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import CreateTournamentForm from "@/components/admin/CreateTournamentForm";

export const metadata = {
  title: "Buat Turnamen / Season Baru | Admin Dashboard",
};

export default async function BuatTurnamenPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; game?: string }>;
}) {
  const { name: initialName = "", game: initialGame = "" } = await searchParams;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allTournamentsRaw = await (prisma.tournament as any).findMany({
    orderBy: { createdAt: "desc" },
  });

  const allTournaments = allTournamentsRaw as Array<{
    name: string;
    game: string;
    season: string;
  }>;

  // Group by tournament name
  const groupedMap = new Map<string, { name: string; game: string; seasons: string[] }>();
  allTournaments.forEach((t) => {
    if (!groupedMap.has(t.name)) {
      groupedMap.set(t.name, {
        name: t.name,
        game: t.game,
        seasons: [t.season],
      });
    } else {
      const entry = groupedMap.get(t.name)!;
      if (!entry.seasons.includes(t.season)) {
        entry.seasons.push(t.season);
      }
    }
  });

  const existingTournaments = Array.from(groupedMap.values());

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/turnamen"
          className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {initialName ? `Tambah Season: ${initialName}` : "Buat Turnamen / Season Baru"}
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            {initialName
              ? `Buat season berikutnya untuk turnamen ${initialName}.`
              : "Buat turnamen baru atau tambahkan season ke acara turnamen yang sudah ada."}
          </p>
        </div>
      </div>

      <CreateTournamentForm
        existingTournaments={existingTournaments}
        initialName={initialName}
        initialGame={initialGame}
      />
    </div>
  );
}
