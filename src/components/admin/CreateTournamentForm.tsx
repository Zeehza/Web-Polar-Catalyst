"use client";

import React, { useActionState, useState, useEffect } from "react";
import { createTournament } from "@/app/actions/admin";
import { Save, AlertCircle, Sparkles, Layers } from "lucide-react";
import { useRouter } from "next/navigation";

interface ExistingTournament {
  name: string;
  game: string;
  seasons: string[];
}

interface CreateTournamentFormProps {
  existingTournaments: ExistingTournament[];
  initialName?: string;
  initialGame?: string;
}

export default function CreateTournamentForm({
  existingTournaments,
  initialName = "",
  initialGame = "",
}: CreateTournamentFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createTournament, null);

  const matchedExisting = existingTournaments.find(
    (t) => t.name.toLowerCase() === initialName.toLowerCase()
  );

  const [mode, setMode] = useState<"existing" | "new">(
    matchedExisting || (existingTournaments.length > 0 && initialName)
      ? "existing"
      : existingTournaments.length > 0
        ? "new"
        : "new"
  );

  const [selectedTournamentName, setSelectedTournamentName] = useState<string>(
    matchedExisting?.name || initialName || (existingTournaments[0]?.name ?? "")
  );

  const [name, setName] = useState<string>(
    mode === "existing" ? selectedTournamentName : initialName
  );
  const [game, setGame] = useState<string>(
    mode === "existing" && matchedExisting
      ? matchedExisting.game
      : initialGame
  );

  const [startDate, setStartDate] = useState<string>("");

  // Helper to suggest next season label e.g. Season 2, Season 3
  const getNextSeasonSuggestion = (seasons: string[]) => {
    let maxNum = 0;
    seasons.forEach((s) => {
      const match = s.match(/(?:season|s)\s*(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    return maxNum > 0 ? `Season ${maxNum + 1}` : `Season ${seasons.length + 1}`;
  };

  const [season, setSeason] = useState<string>(() => {
    if (mode === "existing" && matchedExisting) {
      return getNextSeasonSuggestion(matchedExisting.seasons);
    }
    return "Season 1";
  });

  // Calculate current tournament seasons and check duplicate in real-time
  const currentTournament = mode === "existing"
    ? existingTournaments.find((t) => t.name.toLowerCase() === selectedTournamentName.toLowerCase())
    : existingTournaments.find((t) => t.name.toLowerCase() === name.trim().toLowerCase());

  const currentSeasons = currentTournament?.seasons || [];
  const isDuplicateSeason = currentSeasons.some(
    (s) => s.trim().toLowerCase() === season.trim().toLowerCase()
  );
  const suggestedNextSeason = getNextSeasonSuggestion(currentSeasons);

  const handleSelectTournament = (selectedName: string) => {
    setSelectedTournamentName(selectedName);
    setName(selectedName);
    const found = existingTournaments.find((t) => t.name === selectedName);
    if (found) {
      setGame(found.game);
      setSeason(getNextSeasonSuggestion(found.seasons));
    }
  };

  const handleModeChange = (newMode: "existing" | "new") => {
    setMode(newMode);
    if (newMode === "existing" && existingTournaments.length > 0) {
      const target =
        existingTournaments.find((t) => t.name === selectedTournamentName) ||
        existingTournaments[0];
      setSelectedTournamentName(target.name);
      setName(target.name);
      setGame(target.game);
      setSeason(getNextSeasonSuggestion(target.seasons));
    } else {
      setName("");
      setGame("");
      setSeason("Season 1");
    }
  };

  useEffect(() => {
    if (state?.success && state?.redirect) {
      router.push(state.redirect);
    }
  }, [state, router]);

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm p-6 md:p-8">
      {state?.error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500 shrink-0 mt-0.5" />
          <p className="text-red-700 dark:text-red-400 text-sm font-medium">{state.error}</p>
        </div>
      )}

      {/* Mode selection tabs if there are existing tournaments */}
      {existingTournaments.length > 0 && (
        <div className="flex gap-2 p-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => handleModeChange("existing")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
              mode === "existing"
                ? "bg-white dark:bg-neutral-900 text-brand-600 dark:text-brand-400 shadow-xs"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            <Layers className="h-4 w-4" />
            Tambah Season Turnamen yang Ada
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("new")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
              mode === "new"
                ? "bg-white dark:bg-neutral-900 text-brand-600 dark:text-brand-400 shadow-xs"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Buat Turnamen Baru
          </button>
        </div>
      )}

      <form action={formAction} className="flex flex-col gap-5">
        {mode === "existing" ? (
          <>
            <div className="flex flex-col gap-2">
              <label htmlFor="selectTournament" className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Pilih Acara Turnamen *
              </label>
              <select
                id="selectTournament"
                value={selectedTournamentName}
                onChange={(e) => handleSelectTournament(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white"
              >
                {existingTournaments.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name} ({t.game}) — {t.seasons.length} Season ({t.seasons.join(", ")})
                  </option>
                ))}
              </select>
              <input type="hidden" name="name" value={name} />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Game
              </label>
              <input
                type="text"
                name="game"
                value={game}
                readOnly
                className="w-full px-4 py-3 bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-600 dark:text-neutral-400 outline-none cursor-not-allowed font-medium"
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Nama Turnamen *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white"
                placeholder="Contoh: Polar Catalyst Valorant Cup"
              />
              <p className="text-xs text-neutral-500">
                Nama tetap acara turnamen esports (nama ini dapat memiliki banyak season di dalamnya).
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="game" className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Game *
              </label>
              <input
                type="text"
                id="game"
                name="game"
                value={game}
                onChange={(e) => setGame(e.target.value)}
                required
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white"
                placeholder="Contoh: Mobile Legend, Valorant, Dota 2"
              />
            </div>
          </>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label htmlFor="season" className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Label Season *
            </label>
            <span className="text-xs text-brand-600 dark:text-brand-400 font-medium">
              Contoh: Season 1, Season 2, S1 2026
            </span>
          </div>
          <input
            type="text"
            id="season"
            name="season"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            required
            className={`w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white font-medium ${
              isDuplicateSeason
                ? "border-amber-500 focus:border-amber-500"
                : "border-neutral-200 dark:border-neutral-800"
            }`}
            placeholder="Contoh: Season 1"
          />
          {isDuplicateSeason && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-700 dark:text-amber-400 text-xs">
              <div className="flex items-center gap-2 font-medium">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>
                  <strong>{season}</strong> sudah pernah dibuat untuk turnamen ini.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSeason(suggestedNextSeason)}
                className="self-start sm:self-auto px-2.5 py-1 bg-amber-200 dark:bg-amber-800/60 hover:bg-amber-300 dark:hover:bg-amber-800 text-amber-900 dark:text-amber-200 font-semibold rounded-lg transition-colors cursor-pointer text-xs"
              >
                Gunakan {suggestedNextSeason}
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="type" className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            Tipe Turnamen
          </label>
          <select
            id="type"
            name="type"
            defaultValue="PLAYOFF"
            className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white"
          >
            <option value="PLAYOFF">Playoff</option>
            <option value="GROUP_STAGE">Group Stage</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="startDate" className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            Tanggal Mulai *
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white"
          />
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isPending || isDuplicateSeason}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:bg-neutral-300 dark:disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md cursor-pointer"
          >
            {isPending ? (
              "Menyimpan..."
            ) : isDuplicateSeason ? (
              "Season Sudah Terdaftar"
            ) : (
              <>
                <Save className="h-4 w-4" /> Simpan Turnamen
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
