import type { Problem } from "../tables";
import { shuffleArray } from "../tables";

export class FlashcardGame {
  private problems: Problem[];
  private currentIndex: number = 0;
  private isFlipped: boolean = false;
  private score: number = 0;
  private total: number = 0;
  private container: HTMLElement;
  private onComplete: (correct: number, total: number) => void;
  private onHome: () => void;

  constructor(
    problems: Problem[],
    container: HTMLElement,
    onComplete: (correct: number, total: number) => void,
    onHome: () => void
  ) {
    this.problems = shuffleArray(problems);
    this.container = container;
    this.onComplete = onComplete;
    this.onHome = onHome;
    this.render();
  }

  private render(): void {
    const problem = this.problems[this.currentIndex];
    const progress = `${this.currentIndex + 1} / ${this.problems.length}`;

    this.container.innerHTML = `
      <div class="game-header">
        <button class="btn-home" id="btn-home">🏠</button>
        <h2>🎴 Flashcards</h2>
        <div class="progress">${progress}</div>
        <div class="score">⭐ ${this.score}</div>
      </div>
      <div class="flashcard-container">
        <div class="flashcard ${this.isFlipped ? "flipped" : ""}" id="flashcard">
          <div class="flashcard-front">
            <span class="emoji">${problem.emoji}</span>
            <span class="word">${problem.question}</span>
            <span class="hint">Klik om het antwoord te zien!</span>
          </div>
          <div class="flashcard-back">
            <span class="emoji">✅</span>
            <span class="word">${problem.answer}</span>
          </div>
        </div>
      </div>
      <div class="flashcard-buttons">
        <button class="btn btn-wrong" id="btn-wrong">❌ Niet geweten</button>
        <button class="btn btn-correct" id="btn-correct">✅ Geweten!</button>
      </div>
    `;

    document.getElementById("btn-home")?.addEventListener("click", this.onHome);
    document.getElementById("flashcard")?.addEventListener("click", () => this.flip());
    document.getElementById("btn-wrong")?.addEventListener("click", () => this.next(false));
    document.getElementById("btn-correct")?.addEventListener("click", () => this.next(true));
  }

  private flip(): void {
    this.isFlipped = !this.isFlipped;
    document.getElementById("flashcard")?.classList.toggle("flipped", this.isFlipped);
  }

  private next(correct: boolean): void {
    this.total++;
    if (correct) this.score++;
    this.currentIndex++;
    this.isFlipped = false;

    if (this.currentIndex >= this.problems.length) {
      this.showResults();
    } else {
      this.render();
    }
  }

  private showResults(): void {
    const percentage = Math.round((this.score / this.total) * 100);
    const message = percentage >= 80 ? "🎉 Fantastisch!" : percentage >= 50 ? "👍 Goed gedaan!" : "💪 Blijf oefenen!";

    this.container.innerHTML = `
      <div class="results">
        <h2>${message}</h2>
        <div class="results-score">
          <span class="big-emoji">⭐</span>
          <span class="score-text">${this.score} / ${this.total}</span>
          <span class="percentage">${percentage}%</span>
        </div>
        <button class="btn btn-primary" id="btn-back">🏠 Terug naar menu</button>
      </div>
    `;

    document.getElementById("btn-back")?.addEventListener("click", () =>
      this.onComplete(this.score, this.total)
    );
  }
}
