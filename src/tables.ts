export interface Problem {
  question: string;
  answer: number;
  emoji: string;
}

export interface TableCategory {
  name: string;
  emoji: string;
  problems: Problem[];
}

export type TableType = "multiplication" | "division";

function generateMultiplicationTable(n: number): Problem[] {
  const problems: Problem[] = [];
  for (let i = 1; i <= 10; i++) {
    problems.push({
      question: `${n} × ${i}`,
      answer: n * i,
      emoji: "✖️",
    });
  }
  return problems;
}

function generateDivisionTable(n: number): Problem[] {
  const problems: Problem[] = [];
  for (let i = 1; i <= 10; i++) {
    problems.push({
      question: `${n * i} ÷ ${n}`,
      answer: i,
      emoji: "➗",
    });
  }
  return problems;
}

function generateMixedMultiplication(tables: number[], count = 10): Problem[] {
  const all = tables.flatMap((n) => generateMultiplicationTable(n));
  return shuffleArray(all).slice(0, count);
}

export const multiplicationTables: TableCategory[] = [
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `Tafel van ${i + 1}`,
    emoji: `${i + 1}️⃣`,
    problems: generateMultiplicationTable(i + 1),
  })),
  {
    name: "Mix 1-5",
    emoji: "🔀",
    problems: generateMixedMultiplication([1, 2, 3, 4, 5]),
  },
  {
    name: "Mix 6 & 8",
    emoji: "🎲",
    problems: generateMixedMultiplication([6, 8]),
  },
  {
    name: "Alles Mix",
    emoji: "🌟",
    problems: generateMixedMultiplication([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
  },
];

function generateMixedDivision(tables: number[], count = 10): Problem[] {
  const all = tables.flatMap((n) => generateDivisionTable(n));
  return shuffleArray(all).slice(0, count);
}

export const divisionTables: TableCategory[] = [
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `Delen door ${i + 1}`,
    emoji: `${i + 1}️⃣`,
    problems: generateDivisionTable(i + 1),
  })),
  {
    name: "Mix 1-5",
    emoji: "🔀",
    problems: generateMixedDivision([1, 2, 3, 4, 5]),
  },
  {
    name: "Mix 6 & 8",
    emoji: "🎲",
    problems: generateMixedDivision([6, 8]),
  },
  {
    name: "Alles Mix",
    emoji: "🌟",
    problems: generateMixedDivision([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
  },
];

export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function generateWrongAnswers(correctAnswer: number, count: number): number[] {
  const wrong: Set<number> = new Set();
  while (wrong.size < count) {
    const offset = Math.floor(Math.random() * 20) - 10;
    const candidate = correctAnswer + offset;
    if (candidate !== correctAnswer && candidate > 0 && !wrong.has(candidate)) {
      wrong.add(candidate);
    }
  }
  return Array.from(wrong);
}
