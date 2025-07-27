import { PrismaClient, Difficulty } from "@prisma/client";

const prisma = new PrismaClient();

const sampleQuestions = [
  // Easy Questions
  {
    question: "What is the name of the city where GTA V takes place?",
    optionA: "Liberty City",
    optionB: "Los Santos",
    optionC: "Vice City",
    optionD: "San Fierro",
    correctAnswer: "B",
    difficulty: Difficulty.EASY,
    category: "Gaming",
  },
  {
    question: "Which mode is most popular for multiplayer in Call of Duty?",
    optionA: "Zombies",
    optionB: "Campaign",
    optionC: "Multiplayer",
    optionD: "Operations",
    correctAnswer: "C",
    difficulty: Difficulty.EASY,
    category: "Gaming",
  },
  {
    question: "What is the protagonist’s name in Ghost of Tsushima?",
    optionA: "Kazuma",
    optionB: "Ryu Hayabusa",
    optionC: "Jin Sakai",
    optionD: "Nobu",
    correctAnswer: "C",
    difficulty: Difficulty.EASY,
    category: "Gaming",
  },
  {
    question: "Which monster hunter school is Geralt from in The Witcher 3?",
    optionA: "Bear",
    optionB: "Cat",
    optionC: "Griffin",
    optionD: "Wolf",
    correctAnswer: "D",
    difficulty: Difficulty.EASY,
    category: "Gaming",
  },
  {
    question: "Who is the main playable character in Red Dead Redemption 2?",
    optionA: "Dutch",
    optionB: "John Marston",
    optionC: "Arthur Morgan",
    optionD: "Javier Escuella",
    correctAnswer: "C",
    difficulty: Difficulty.EASY,
    category: "Gaming",
  },
  {
    question: "What is the name of the futuristic city in Cyberpunk 2077?",
    optionA: "Neo-Tokyo",
    optionB: "Night City",
    optionC: "Mega City",
    optionD: "Edgeville",
    correctAnswer: "B",
    difficulty: Difficulty.EASY,
    category: "Gaming",
  },
  {
    question: "What is the name of Aloy’s game?",
    optionA: "Alloy Dawn",
    optionB: "Horizon Zero Dawn",
    optionC: "Beyond West",
    optionD: "Forbidden Light",
    correctAnswer: "B",
    difficulty: Difficulty.EASY,
    category: "Gaming",
  },
  {
    question: "Which US state is Far Cry 5 set in?",
    optionA: "Texas",
    optionB: "Alaska",
    optionC: "Montana",
    optionD: "Colorado",
    correctAnswer: "C",
    difficulty: Difficulty.EASY,
    category: "Gaming",
  },
  {
    question: "Who created the lore of Elden Ring?",
    optionA: "Hidetaka Miyazaki",
    optionB: "George R. R. Martin",
    optionC: "Kojima",
    optionD: "Todd Howard",
    correctAnswer: "B",
    difficulty: Difficulty.EASY,
    category: "Gaming",
  },
  {
    question:
      "What is the name of the lead character in Assassin's Creed Valhalla?",
    optionA: "Eivor",
    optionB: "Altair",
    optionC: "Ezio",
    optionD: "Connor",
    correctAnswer: "A",
    difficulty: Difficulty.EASY,
    category: "Gaming",
  },

  // Medium Questions
  {
    question: "What is Franklin’s main job when GTA V starts?",
    optionA: "Hitman",
    optionB: "Gang leader",
    optionC: "Police informant",
    optionD: "Repo man",
    correctAnswer: "D",
    difficulty: Difficulty.MEDIUM,
    category: "Gaming",
  },
  {
    question:
      "What is the name of the rebel leader in CoD: Modern Warfare (2019)?",
    optionA: "Karim",
    optionB: "Farah",
    optionC: "Alex",
    optionD: "Price",
    correctAnswer: "B",
    difficulty: Difficulty.MEDIUM,
    category: "Gaming",
  },
  {
    question: "Which clan does Jin Sakai belong to?",
    optionA: "Shimura",
    optionB: "Sakai",
    optionC: "Mongol",
    optionD: "Arashi",
    correctAnswer: "B",
    difficulty: Difficulty.MEDIUM,
    category: "Gaming",
  },
  {
    question: "Who is Geralt searching for in Witcher 3?",
    optionA: "Ciri",
    optionB: "Triss",
    optionC: "Yennefer",
    optionD: "Dandelion",
    correctAnswer: "A",
    difficulty: Difficulty.MEDIUM,
    category: "Gaming",
  },
  {
    question: "What disease does Arthur Morgan contract in RDR2?",
    optionA: "Cholera",
    optionB: "Pneumonia",
    optionC: "Tuberculosis",
    optionD: "Blackwater Fever",
    correctAnswer: "C",
    difficulty: Difficulty.MEDIUM,
    category: "Gaming",
  },
  {
    question: "Assassin's Creed Odyssey is set during which period?",
    optionA: "Roman Empire",
    optionB: "French Revolution",
    optionC: "Viking Era",
    optionD: "Peloponnesian War",
    correctAnswer: "D",
    difficulty: Difficulty.MEDIUM,
    category: "Gaming",
  },
  {
    question: "What are players referred to as in Elden Ring?",
    optionA: "Tarnished",
    optionB: "Ashen Ones",
    optionC: "Hollow",
    optionD: "Seekers",
    correctAnswer: "A",
    difficulty: Difficulty.MEDIUM,
    category: "Gaming",
  },
  {
    question: "What is Johnny Silverhand’s original profession?",
    optionA: "Assassin",
    optionB: "Soldier",
    optionC: "Rocker",
    optionD: "Thief",
    correctAnswer: "C",
    difficulty: Difficulty.MEDIUM,
    category: "Gaming",
  },
  {
    question: "Who is the villain in Far Cry 3?",
    optionA: "Pagan Min",
    optionB: "Vaas Montenegro",
    optionC: "Joseph Seed",
    optionD: "Anton Castillo",
    correctAnswer: "B",
    difficulty: Difficulty.MEDIUM,
    category: "Gaming",
  },
  {
    question: "What faction is Sylens part of in Horizon Forbidden West?",
    optionA: "Eclipse",
    optionB: "Shadow Carja",
    optionC: "Oseram",
    optionD: "Tenakth",
    correctAnswer: "A",
    difficulty: Difficulty.MEDIUM,
    category: "Gaming",
  },

  // Hard Questions
  {
    question: "What is the bank name in the GTA V prologue?",
    optionA: "Pacific Standard",
    optionB: "Paleto Bay",
    optionC: "Union Depository",
    optionD: "Blaine County Savings",
    correctAnswer: "D",
    difficulty: Difficulty.HARD,
    category: "Gaming",
  },
  {
    question: "Most of CoD: Black Ops II takes place in what year?",
    optionA: "1960s",
    optionB: "1980s",
    optionC: "2025",
    optionD: "2050",
    correctAnswer: "C",
    difficulty: Difficulty.HARD,
    category: "Gaming",
  },
  {
    question: "What gear enables fast travel in Ghost of Tsushima?",
    optionA: "Smoke Bombs",
    optionB: "Guiding Wind",
    optionC: "Traveler's Attire",
    optionD: "Map Tokens",
    correctAnswer: "C",
    difficulty: Difficulty.HARD,
    category: "Gaming",
  },
  {
    question:
      "What monster is featured in 'Contract: Lord of the Wood' in Witcher 3?",
    optionA: "Leshen",
    optionB: "Fiend",
    optionC: "Wyvern",
    optionD: "Noonwraith",
    correctAnswer: "B",
    difficulty: Difficulty.HARD,
    category: "Gaming",
  },
  {
    question: "Which horse spawns near Lake Isabella in RDR2?",
    optionA: "Missouri Fox Trotter",
    optionB: "Arabian White",
    optionC: "Mustang",
    optionD: "Turkoman",
    correctAnswer: "B",
    difficulty: Difficulty.HARD,
    category: "Gaming",
  },
  {
    question: "What’s the name of Bayek’s eagle in AC Origins?",
    optionA: "Khemu",
    optionB: "Layla",
    optionC: "Senu",
    optionD: "Ra",
    correctAnswer: "C",
    difficulty: Difficulty.HARD,
    category: "Gaming",
  },
  {
    question: "Which item unlocks the Grand Lift of Dectus in Elden Ring?",
    optionA: "Rold Medallion",
    optionB: "Erdtree Seal",
    optionC: "Dectus Medallion (Left + Right)",
    optionD: "Tarnished Rune",
    correctAnswer: "C",
    difficulty: Difficulty.HARD,
    category: "Gaming",
  },
  {
    question:
      "What chip contains Johnny Silverhand’s engram in Cyberpunk 2077?",
    optionA: "SoulLink",
    optionB: "Relic",
    optionC: "NetDive",
    optionD: "CoreSync",
    correctAnswer: "B",
    difficulty: Difficulty.HARD,
    category: "Gaming",
  },
  {
    question: "What happens if you wait at Pagan Min’s table in Far Cry 4?",
    optionA: "You get shot",
    optionB: "Game ends",
    optionC: "Secret mission",
    optionD: "You join him",
    correctAnswer: "B",
    difficulty: Difficulty.HARD,
    category: "Gaming",
  },
  {
    question:
      "What is the name of the rogue AI antagonist in Horizon Forbidden West?",
    optionA: "Hephaestus",
    optionB: "Nemesis",
    optionC: "GAIA",
    optionD: "HADES",
    correctAnswer: "B",
    difficulty: Difficulty.HARD,
    category: "Gaming",
  },
];

async function main() {
  console.log("🌱 Starting database seed...");

  // await prisma.question.deleteMany({});
  // console.log("🗑️  Cleared existing questions");

  for (const questionData of sampleQuestions) {
    await prisma.question.create({ data: questionData });
  }

  console.log(`✅ Seeded ${sampleQuestions.length} questions`);

  const counts = await prisma.question.groupBy({
    by: ["difficulty", "category"],
    _count: true,
  });

  console.log("\n📊 Questions by difficulty and category:");
  counts.forEach((count) => {
    console.log(
      `${count.difficulty} - ${count.category}: ${count._count} questions`
    );
  });
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
