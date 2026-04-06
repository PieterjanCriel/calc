import "./style.css";
import type { TableCategory } from "./tables";
import { multiplicationTables, divisionTables } from "./tables";
import { FlashcardGame } from "./games/FlashcardGame";
import { QuizGame } from "./games/QuizGame";
import { MemoryGame } from "./games/MemoryGame";
import { progressManager, type Achievement } from "./progress";

type GameMode = "flashcards" | "quiz" | "memory";
type TableType = "multiplication" | "division";

class TablesApp {
  private container: HTMLElement;
  private selectedTable: TableCategory | null = null;
  private selectedType: TableType = "multiplication";

  constructor() {
    this.container = document.getElementById("app")!;
    this.showHomePage();
  }

  private showHomePage(): void {
    const progress = progressManager.getProgress();
    this.container.innerHTML = `
      <div class="home-page">
        <div class="home-header">
          <h1>🧮 Tafels Oefenen!</h1>
          <p class="home-subtitle">Oefen de tafels van vermenigvuldiging en deling!</p>
          <div class="progress-bar-home">
            <div class="progress-stats">
              <span class="stat-item">🏆 ${progress.totalPoints} punten</span>
              <span class="stat-item">🔥 ${progress.currentStreak} dagen streak</span>
              <span class="stat-item">⭐ ${progress.achievements.length}/${progressManager.getAchievements().length} badges</span>
            </div>
          </div>
        </div>
        <div class="home-cards">
          <button class="home-card" id="btn-multiply">
            <span class="home-card-icon">✖️</span>
            <h2>Vermenigvuldigen</h2>
            <p>Oefen de tafels van 1 tot 10 + mix!</p>
          </button>
          <button class="home-card" id="btn-divide">
            <span class="home-card-icon">➗</span>
            <h2>Delen</h2>
            <p>Oefen deelsommen van 1 tot 10 + mix!</p>
          </button>
          <button class="home-card" id="btn-trophies">
            <span class="home-card-icon">🏆</span>
            <h2>Trofeeënkamer</h2>
            <p>Bekijk je badges, punten en vooruitgang</p>
          </button>
        </div>
      </div>
    `;
    document.getElementById("btn-multiply")?.addEventListener("click", () => { this.selectedType = "multiplication"; this.showTableSelection(); });
    document.getElementById("btn-divide")?.addEventListener("click", () => { this.selectedType = "division"; this.showTableSelection(); });
    document.getElementById("btn-trophies")?.addEventListener("click", () => this.showTrophiesPage());
  }

  private showTableSelection(): void {
    const tables = this.selectedType === "multiplication" ? multiplicationTables : divisionTables;
    const title = this.selectedType === "multiplication" ? "✖️ Vermenigvuldigen" : "➗ Delen";
    this.container.innerHTML = `
      <div class="main-menu">
        <button class="btn-back" id="back-to-home">← Home</button>
        <h1>${title}</h1>
        <p class="subtitle">Kies een tafel om te oefenen</p>
        <div class="categories">
          ${tables.map((t, i) => `
            <button class="category-btn" data-index="${i}">
              <span class="cat-emoji">${t.emoji}</span>
              <span class="cat-name">${t.name}</span>
            </button>
          `).join("")}
        </div>
      </div>
    `;
    document.getElementById("back-to-home")?.addEventListener("click", () => this.showHomePage());
    document.querySelectorAll(".category-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = parseInt((e.currentTarget as HTMLElement).dataset.index || "0");
        this.selectedTable = tables[index];
        this.showGameSelection();
      });
    });
  }

  private showGameSelection(): void {
    const t = this.selectedTable!;
    this.container.innerHTML = `
      <div class="game-selection">
        <button class="btn-back" id="back-to-tables">← Terug</button>
        <h2>${t.emoji} ${t.name}</h2>
        <p class="subtitle">${t.problems.length} sommen om te oefenen!</p>
        <div class="game-modes">
          <button class="game-mode-btn" data-mode="flashcards">
            <span class="mode-emoji">🎴</span>
            <span class="mode-name">Flashcards</span>
            <span class="mode-desc">Bekijk en leer de sommen</span>
          </button>
          <button class="game-mode-btn" data-mode="quiz">
            <span class="mode-emoji">🧠</span>
            <span class="mode-name">Quiz</span>
            <span class="mode-desc">Test je kennis!</span>
          </button>
          <button class="game-mode-btn" data-mode="memory">
            <span class="mode-emoji">🃏</span>
            <span class="mode-name">Memory</span>
            <span class="mode-desc">Zoek de juiste paren!</span>
          </button>
        </div>
      </div>
    `;
    document.getElementById("back-to-tables")?.addEventListener("click", () => this.showTableSelection());
    document.querySelectorAll(".game-mode-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        this.startGame((e.currentTarget as HTMLElement).dataset.mode as GameMode);
      });
    });
  }

  private startGame(mode: GameMode): void {
    const table = this.selectedTable!;
    const gameContainer = document.createElement("div");
    gameContainer.className = "game-container";
    this.container.innerHTML = "";
    this.container.appendChild(gameContainer);
    const onComplete = (correct: number, total: number) => {
      this.handleGameComplete(table.name, correct, total);
      this.showGameSelection();
    };
    const onHome = () => this.showHomePage();
    if (mode === "flashcards") new FlashcardGame(table.problems, gameContainer, onComplete, onHome);
    else if (mode === "quiz") new QuizGame(table.problems, gameContainer, onComplete, onHome);
    else new MemoryGame(table.problems, gameContainer, onComplete, onHome);
  }

  private handleGameComplete(tableName: string, correct: number, total: number): void {
    const { newAchievements } = progressManager.recordGameComplete(tableName, correct, total);
    if (newAchievements.length > 0) this.showAchievementNotifications(newAchievements);
  }

  private showAchievementNotifications(achievements: Achievement[]): void {
    const el = document.createElement("div");
    el.className = "achievement-notifications";
    el.innerHTML = achievements.map(a => `
      <div class="achievement-notification">
        <div class="achievement-notification-icon">${a.emoji}</div>
        <div class="achievement-notification-content">
          <div class="achievement-notification-title">🎉 Badge Ontgrendeld!</div>
          <div class="achievement-notification-name">${a.name}</div>
          <div class="achievement-notification-points">+${a.points} punten</div>
        </div>
      </div>
    `).join("");
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity = "0"; setTimeout(() => el.remove(), 500); }, 5000);
  }

  private showTrophiesPage(): void {
    const progress = progressManager.getProgress();
    const achievements = progressManager.getAchievements();
    const unlocked = achievements.filter(a => a.unlocked);
    const locked = achievements.filter(a => !a.unlocked);
    const accuracy = progress.stats.totalQuestions > 0
      ? Math.round((progress.stats.totalCorrectAnswers / progress.stats.totalQuestions) * 100) : 0;

    this.container.innerHTML = `
      <div class="trophies-page">
        <button class="btn-back" id="back-to-home">← Home</button>
        <h1>🏆 Trofeeënkamer</h1>
        <p class="subtitle">Je vooruitgang en prestaties</p>
        <div class="trophy-summary">
          <div class="trophy-stat-card"><div class="trophy-stat-icon">🏆</div><div class="trophy-stat-value">${progress.totalPoints}</div><div class="trophy-stat-label">Punten</div></div>
          <div class="trophy-stat-card"><div class="trophy-stat-icon">🔥</div><div class="trophy-stat-value">${progress.currentStreak}</div><div class="trophy-stat-label">Streak</div></div>
          <div class="trophy-stat-card"><div class="trophy-stat-icon">⭐</div><div class="trophy-stat-value">${progress.longestStreak}</div><div class="trophy-stat-label">Langste Streak</div></div>
          <div class="trophy-stat-card"><div class="trophy-stat-icon">🎯</div><div class="trophy-stat-value">${accuracy}%</div><div class="trophy-stat-label">Nauwkeurigheid</div></div>
        </div>
        <div class="achievements-section">
          <h2>⭐ Badges (${unlocked.length}/${achievements.length})</h2>
          <div class="achievements-grid">
            ${unlocked.map(a => `
              <div class="achievement-card unlocked">
                <div class="achievement-emoji">${a.emoji}</div>
                <div class="achievement-name">${a.name}</div>
                <div class="achievement-desc">${a.description}</div>
                <div class="achievement-points">+${a.points} punten</div>
              </div>
            `).join("") || '<p class="no-achievements">Nog geen badges. Ga oefenen!</p>'}
          </div>
          <h3>🔒 Nog Te Ontgrendelen</h3>
          <div class="achievements-grid">
            ${locked.map(a => `
              <div class="achievement-card locked">
                <div class="achievement-emoji">${a.emoji}</div>
                <div class="achievement-name">${a.name}</div>
                <div class="achievement-desc">${a.description}</div>
                <div class="achievement-points">+${a.points} punten</div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;
    document.getElementById("back-to-home")?.addEventListener("click", () => this.showHomePage());
  }
}

new TablesApp();
