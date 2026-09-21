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
