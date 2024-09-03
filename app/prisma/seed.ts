const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const drivers = [
    { name: "Max Verstappen" },
    { name: "Sergio Perez" },
    { name: "Lewis Hamilton" },
    { name: "George Russell" },
    { name: "Charles Leclerc" },
    { name: "Carlos Sainz" },
    { name: "Fernando Alonso" },
    { name: "Lance Stroll" },
    { name: "Lando Norris" },
    { name: "Oscar Piastri" },
    { name: "Esteban Ocon" },
    { name: "Pierre Gasly" },
    { name: "Valtteri Bottas" },
    { name: "Zhou Guanyu" },
    { name: "Kevin Magnussen" },
    { name: "Nico Hulkenberg" },
    { name: "Yuki Tsunoda" },
    { name: "Daniel Ricciardo" },
    { name: "Alexander Albon" },
    { name: "Logan Sargeant" },
  ];

  for (const driver of drivers) {
    await prisma.driver.create({
      data: driver,
    });
  }

  const rounds = [
    {
      round: 15,
      name: "Netherlands",
      raceQualifyingAt: new Date("2024-08-24T13:00:00"),
      raceAt: new Date("2024-08-25T13:00:00"),
    },
    {
      round: 16,
      name: "Italy",
      raceQualifyingAt: new Date("2024-08-31T14:00:00"),
      raceAt: new Date("2024-09-01T13:00:00"),
    },
  ];

  for (const round of rounds) {
    await prisma.round.create({
      data: { year: 2024, ...round },
    });
  }

  const users = [
    {
      name: "Edd",
      isAdmin: true,
    },
    {
      name: "Aimee",
    },
  ];

  for (const user of users) {
    await prisma.user.create({
      data: user,
    });
  }

  for (const round of await prisma.round.findMany()) {
    for (const user of await prisma.user.findMany()) {
      await prisma.pick.create({
        data: {
          userId: user.id,
          year: round.year,
          round: round.round,
          type: "RACE_QUALIFYING",
          driver1Id: 1,
          driver2Id: 2,
          driver3Id: 3,
          score: 2,
          scoredAt: new Date(),
        },
      });
    }
    await prisma.result.create({
      data: {
        year: round.year,
        round: round.round,
        type: "RACE_QUALIFYING",
        driver1Id: 1,
        driver2Id: 2,
        driver3Id: 3,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
