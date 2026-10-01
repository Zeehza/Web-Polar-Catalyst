// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getLeaderboard = (teams: any[], matches: any[]) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stats: Record<string, any> = {};
  
  teams.forEach(team => {
    stats[team.id] = {
      ...team,
      played: 0,
      wins: 0,
      losses: 0,
      points: 0,
    };
  });

  matches.forEach(match => {
    if (match.teamAId && stats[match.teamAId]) stats[match.teamAId].played++;
    if (match.teamBId && stats[match.teamBId]) stats[match.teamBId].played++;

    if (match.winnerId && stats[match.winnerId]) {
      stats[match.winnerId].wins++;
      stats[match.winnerId].points += 3; // Contoh: 3 poin untuk menang
      
      // Tentukan yang kalah
      const loserId = match.winnerId === match.teamAId ? match.teamBId : match.teamAId;
      if (loserId && stats[loserId]) {
        stats[loserId].losses++;
      }
    }
  });

  // Convert object ke array dan urutkan berdasarkan poin
  return Object.values(stats).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    // Jika poin seri, urutkan berdasarkan win rate atau matches played
    return b.wins - a.wins;
  });
};

/**
 * Menghitung leaderboard per grup untuk mode GROUP_STAGE.
 * Hanya menghitung match yang kedua tim-nya berada di grup yang sama.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getGroupLeaderboards = (teams: any[], matches: any[]) => {
  // Kelompokkan tim berdasarkan grup
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    result[groupName] = getLeaderboard(groupTeams, groupMatches);
  }

  // Urutkan berdasarkan nama grup (A, B, C, D, lalu "Tidak Ada Grup" di akhir)
  const sortedEntries = Object.entries(result).sort(([a], [b]) => {
    if (a === "Tidak Ada Grup") return 1;
    if (b === "Tidak Ada Grup") return -1;
    return a.localeCompare(b);
  });

  return sortedEntries;
};
