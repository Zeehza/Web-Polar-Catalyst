import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Reset data (optional, careful in prod!)
  await prisma.match.deleteMany();
  await prisma.team.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.sponsor.deleteMany();
  await prisma.admin.deleteMany();

  // Create Admin
  const passwordHash = await bcrypt.hash("password123", 10);
  await prisma.admin.create({
    data: {
      username: "admin",
      passwordHash,
    },
  });

  // Create a Tournament
  const t1 = await prisma.tournament.create({
    data: {
      name: "Polar Catalyst Valorant Cup 2026",
      slug: "pcvc-2026",
      description: "Turnamen Valorant tahunan terbesar dari Polar Catalyst.",
      game: "Valorant",
      status: "ONGOING",
      startDate: new Date("2026-11-01T00:00:00Z"),
      endDate: new Date("2026-11-15T00:00:00Z"),
    },
  });

  const t2 = await prisma.tournament.create({
    data: {
      name: "Polar Catalyst Apex Legends Brawl",
      slug: "apex-brawl-2026",
      description: "Turnamen Apex Legends komunitas.",
      game: "Apex Legends",
      status: "UPCOMING",
      startDate: new Date("2026-12-05T00:00:00Z"),
    },
  });

  // Create Teams for T1
  const teamsData = ["Team Alpha", "Team Beta", "Team Gamma", "Team Delta"].map(
    (name, index) => ({
      name,
      tournamentId: t1.id,
      seed: index + 1,
    })
  );

  const createdTeams = await Promise.all(
    teamsData.map((data) => prisma.team.create({ data }))
  );

  // Create Matches for T1
  await prisma.match.create({
    data: {
      tournamentId: t1.id,
      roundNumber: 1,
      matchOrder: 1,
      teamAId: createdTeams[0].id,
      teamBId: createdTeams[1].id,
      scoreA: 2,
      scoreB: 1,
      winnerId: createdTeams[0].id,
      status: "COMPLETED",
      scheduledAt: new Date("2026-11-01T14:00:00Z"),
      playedAt: new Date("2026-11-01T16:00:00Z"),
    },
  });

  await prisma.match.create({
    data: {
      tournamentId: t1.id,
      roundNumber: 1,
      matchOrder: 2,
      teamAId: createdTeams[2].id,
      teamBId: createdTeams[3].id,
      status: "SCHEDULED",
      scheduledAt: new Date(Date.now() + 86400000 * 2), // 2 days from now
    },
  });

  // Sponsors
  await prisma.sponsor.create({
    data: {
      name: "Sponsor Satu",
      logoUrl: "/sponsors/satu.png",
      tier: "PLATINUM",
      displayOrder: 1,
    },
  });

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
