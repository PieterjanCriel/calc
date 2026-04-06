export interface UserProgress {
  totalPoints: number;
  currentStreak: number;
  lastPlayedDate: string;
  longestStreak: number;
  tablesCompleted: string[];
  achievements: string[];
  tableProgress: {
    [tableName: string]: {
      gamesPlayed: number;
      bestScore: number;
    };
  };
  stats: {
    totalGamesPlayed: number;
    totalCorrectAnswers: number;
    totalQuestions: number;
    perfectScores: number;
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  points: number;
  unlocked: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_steps", name: "Eerste Stappen", description: "Voltooi je eerste oefening", emoji: "👣", points: 10, unlocked: false },
  { id: "perfect_score", name: "Perfecte Score", description: "Behaal 100% in een quiz", emoji: "💯", points: 30, unlocked: false },
  { id: "times_table_5", name: "Halve Tafel", description: "Voltooi 5 verschillende tafels", emoji: "⭐", points: 50, unlocked: false },
  { id: "times_table_10", name: "Tafel Meester", description: "Voltooi alle 10 tafels", emoji: "🏆", points: 100, unlocked: false },
  { id: "quiz_master", name: "Quiz Kampioen", description: "Haal 5 perfecte scores", emoji: "🎯", points: 75, unlocked: false },
  { id: "on_fire", name: "In de Flow", description: "Bereik een 3-daagse streak", emoji: "🔥", points: 40, unlocked: false },
  { id: "dedicated", name: "Toegewijd", description: "Bereik een 7-daagse streak", emoji: "💎", points: 75, unlocked: false },
  { id: "century", name: "Eeuwfeest", description: "Verzamel 100 punten", emoji: "💰", points: 0, unlocked: false },
  { id: "half_thousand", name: "Halfduizend", description: "Verzamel 500 punten", emoji: "🌟", points: 0, unlocked: false },
  { id: "math_lover", name: "Reken Fan", description: "Speel 25 spelletjes", emoji: "🎮", points: 50, unlocked: false },
];

class ProgressManager {
  private storageKey = "calc_tables_progress";

  getProgress(): UserProgress {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) return JSON.parse(stored);
    return this.createDefault();
  }

  private createDefault(): UserProgress {
    return {
      totalPoints: 0, currentStreak: 0, lastPlayedDate: "", longestStreak: 0,
      tablesCompleted: [], achievements: [], tableProgress: {},
      stats: { totalGamesPlayed: 0, totalCorrectAnswers: 0, totalQuestions: 0, perfectScores: 0 },
    };
  }

  private save(progress: UserProgress): void {
    localStorage.setItem(this.storageKey, JSON.stringify(progress));
  }

  private updateStreak(progress: UserProgress): UserProgress {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (progress.lastPlayedDate === today) return progress;
    else if (progress.lastPlayedDate === yesterday || progress.lastPlayedDate === "") progress.currentStreak = progress.lastPlayedDate === "" ? 1 : progress.currentStreak + 1;
    else progress.currentStreak = 1;
    progress.lastPlayedDate = today;
    if (progress.currentStreak > progress.longestStreak) progress.longestStreak = progress.currentStreak;
    return progress;
  }

  recordGameComplete(tableName: string, correct: number, total: number): { progress: UserProgress; newAchievements: Achievement[] } {
    let progress = this.getProgress();
    progress = this.updateStreak(progress);
    if (!progress.tableProgress[tableName]) progress.tableProgress[tableName] = { gamesPlayed: 0, bestScore: 0 };
    const table = progress.tableProgress[tableName];
    table.gamesPlayed++;
    const pct = Math.round((correct / total) * 100);
    if (pct > table.bestScore) table.bestScore = pct;
    progress.stats.totalGamesPlayed++;
    progress.stats.totalCorrectAnswers += correct;
    progress.stats.totalQuestions += total;
    const base = Math.floor(correct * 2);
    const bonus = pct === 100 ? 10 : 0;
    progress.totalPoints += base + bonus;
    if (pct === 100) progress.stats.perfectScores++;
    if (pct >= 80 && !progress.tablesCompleted.includes(tableName)) {
      progress.tablesCompleted.push(tableName);
      progress.totalPoints += 20;
    }
    const newAchievements = this.checkAchievements(progress);
    this.save(progress);
    return { progress, newAchievements };
  }

  private checkAchievements(progress: UserProgress): Achievement[] {
    const newOnes: Achievement[] = [];
    for (const a of ACHIEVEMENTS) {
      if (progress.achievements.includes(a.id)) continue;
      let ok = false;
      switch (a.id) {
        case "first_steps": ok = progress.stats.totalGamesPlayed >= 1; break;
        case "perfect_score": ok = progress.stats.perfectScores >= 1; break;
        case "times_table_5": ok = progress.tablesCompleted.length >= 5; break;
        case "times_table_10": ok = progress.tablesCompleted.length >= 10; break;
        case "quiz_master": ok = progress.stats.perfectScores >= 5; break;
        case "on_fire": ok = progress.currentStreak >= 3; break;
        case "dedicated": ok = progress.currentStreak >= 7; break;
        case "century": ok = progress.totalPoints >= 100; break;
        case "half_thousand": ok = progress.totalPoints >= 500; break;
        case "math_lover": ok = progress.stats.totalGamesPlayed >= 25; break;
      }
      if (ok) {
        progress.achievements.push(a.id);
        progress.totalPoints += a.points;
        newOnes.push({ ...a, unlocked: true });
      }
    }
    return newOnes;
  }

  getAchievements(): Achievement[] {
    const progress = this.getProgress();
    return ACHIEVEMENTS.map(a => ({ ...a, unlocked: progress.achievements.includes(a.id) }));
  }
}

export const progressManager = new ProgressManager();
