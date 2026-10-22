/* eslint-disable @typescript-eslint/no-explicit-any */
export const getLeaderboard = (
  teams: any[],
  matches: any[],
  tournamentType: string = "PLAYOFF"
) => {
  const stats: Record<string, any> = {};
  
  teams.forEach(team => {
    stats[team.id] = {
      ...team,
      played: 0,
      wins: 0,
      losses: 0,
      points: 0,
      bracketPlacement: 999,
    };
  });

  matches.forEach(match => {
    // Hanya hitung pertandingan yang sudah COMPLETED
    if (match.status && match.status !== "COMPLETED") return;

    const aId = match.teamAId || match.teamA?.id;
    const bId = match.teamBId || match.teamB?.id;

    if (aId && stats[aId]) stats[aId].played++;
    if (bId && stats[bId]) stats[bId].played++;

    if (match.winnerId && stats[match.winnerId]) {
      stats[match.winnerId].wins++;
      stats[match.winnerId].points += 3;
      
      // Tentukan tim yang kalah
      const loserId = match.winnerId === aId ? bId : aId;
      if (loserId && stats[loserId]) {
        stats[loserId].losses++;
      }
    }
  });

  // Hitung winRate (%) dan net difference (W - L)
  Object.values(stats).forEach(team => {
    team.netDiff = team.wins - team.losses;
    team.winRate = team.played > 0 ? (team.wins / team.played) * 100 : 0;
  });

  // Untuk format PLAYOFF: Peringkat ditentukan oleh tahapan bracket eliminasi (Grand Final, Semifinal, dst.)
  if (tournamentType === "PLAYOFF" && matches.length > 0) {
    const seriesMap = new Map<number, any[]>();
    matches.forEach(m => {
      if (m.status && m.status !== "COMPLETED") return;
      if (!seriesMap.has(m.matchOrder)) seriesMap.set(m.matchOrder, []);
      seriesMap.get(m.matchOrder)!.push(m);
    });

    const seriesResults: Array<{ matchOrder: number; winnerId: string; loserId: string }> = [];
    seriesMap.forEach((games, matchOrder) => {
      const teams = new Map<string, string>();
      const winCount: Record<string, number> = {};

      games.forEach(g => {
        const aId = g.teamAId || g.teamA?.id;
        const bId = g.teamBId || g.teamB?.id;
        if (aId) teams.set(aId, g.teamA?.name || aId);
        if (bId) teams.set(bId, g.teamB?.name || bId);
        if (g.winnerId) winCount[g.winnerId] = (winCount[g.winnerId] || 0) + 1;
      });

      const participantIds = Array.from(teams.keys());
      if (participantIds.length >= 2) {
        const id1 = participantIds[0];
        const id2 = participantIds[1];
        const w1 = winCount[id1] || 0;
        const w2 = winCount[id2] || 0;

        if (w1 > w2) {
          seriesResults.push({ matchOrder, winnerId: id1, loserId: id2 });
        } else if (w2 > w1) {
          seriesResults.push({ matchOrder, winnerId: id2, loserId: id1 });
        } else {
          // Fallback: periksa winnerId dari game terakhir
          const lastGame = games[games.length - 1];
          if (lastGame?.winnerId) {
            const wId = lastGame.winnerId;
            const lId = wId === id1 ? id2 : id1;
            seriesResults.push({ matchOrder, winnerId: wId, loserId: lId });
          }
        }
      }
    });

    // Urutkan nomor seri match dari tertinggi (Grand Final) ke terendah
    seriesResults.sort((a, b) => b.matchOrder - a.matchOrder);

    if (seriesResults.length > 0) {
      const grandFinal = seriesResults[0];
      const rankedIds = new Set<string>();

      // 1. Juara 1: Pemenang Grand Final
      if (stats[grandFinal.winnerId]) {
        stats[grandFinal.winnerId].bracketPlacement = 1;
        stats[grandFinal.winnerId].stageTitle = "Juara 1 (Champion)";
        rankedIds.add(grandFinal.winnerId);
      }

      // 2. Juara 2: Runner-up Grand Final
      if (stats[grandFinal.loserId]) {
        stats[grandFinal.loserId].bracketPlacement = 2;
        stats[grandFinal.loserId].stageTitle = "Juara 2 (Runner-up)";
        rankedIds.add(grandFinal.loserId);
      }

      // 3. Peringkat 3 ke bawah: Ditentukan berurutan dari yang gugur di seri match tertinggi berikutnya
      let nextRank = 3;
      for (let i = 1; i < seriesResults.length; i++) {
        const loserId = seriesResults[i].loserId;
        if (loserId && stats[loserId] && !rankedIds.has(loserId)) {
          stats[loserId].bracketPlacement = nextRank;
          stats[loserId].stageTitle = nextRank === 3 ? "Juara 3" : `Peringkat ${nextRank}`;
          rankedIds.add(loserId);
          nextRank++;
        }
      }
    }
  }

  // Urutkan sesuai standar turnamen esports:
  return Object.values(stats).sort((a, b) => {
    // 1. Prioritas utama Playoff: Bracket Placement (Hasil Eliminasi Playoff)
    if (a.bracketPlacement !== b.bracketPlacement) {
      return a.bracketPlacement - b.bracketPlacement;
    }

    // 2. Win Rate (%) tertinggi
    if (b.winRate !== a.winRate) return b.winRate - a.winRate;

    // 3. Tiebreaker: Kemenangan (W) terbanyak
    if (b.wins !== a.wins) return b.wins - a.wins;

    // 4. Tiebreaker: Selisih kemenangan bersih (W - L)
    if (b.netDiff !== a.netDiff) return b.netDiff - a.netDiff;

    // 5. Tiebreaker: Total poin
    if (b.points !== a.points) return b.points - a.points;

    // 6. Abjad nama tim
    return a.name.localeCompare(b.name);
  });
};

/**
 * Menghitung leaderboard per grup untuk mode GROUP_STAGE.
 * Hanya menghitung match yang kedua tim-nya berada di grup yang sama.
 */
export const getGroupLeaderboards = (teams: any[], matches: any[]) => {
  // Kelompokkan tim berdasarkan grup
  const groups: Record<string, any[]> = {};
  const teamGroupMap: Record<string, string> = {};

  teams.forEach(team => {
    const group = team.group || "Tidak Ada Grup";
    if (!groups[group]) groups[group] = [];
    groups[group].push(team);
    teamGroupMap[team.id] = group;
  });

  // Untuk setiap grup, hitung leaderboard-nya
  const result: Record<string, ReturnType<typeof getLeaderboard>> = {};

  for (const [groupName, groupTeams] of Object.entries(groups)) {
    // Filter match: hanya yang kedua tim berada di grup ini
    const groupMatches = matches.filter(match => {
      const teamAGroup = match.teamAId ? teamGroupMap[match.teamAId] : null;
      const teamBGroup = match.teamBId ? teamGroupMap[match.teamBId] : null;
      return teamAGroup === groupName && teamBGroup === groupName;
    });

    result[groupName] = getLeaderboard(groupTeams, groupMatches, "GROUP_STAGE");
  }

  // Urutkan berdasarkan nama grup (A, B, C, D, lalu "Tidak Ada Grup" di akhir)
  const sortedEntries = Object.entries(result).sort(([a], [b]) => {
    if (a === "Tidak Ada Grup") return 1;
    if (b === "Tidak Ada Grup") return -1;
    return a.localeCompare(b);
  });

  return sortedEntries;
};
