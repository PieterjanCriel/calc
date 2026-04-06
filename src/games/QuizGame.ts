import type { Problem } from "../tables";
import { shuffleArray, generateWrongAnswers } from "../tables";

export class QuizGame {
  private problems: Problem[];
  private currentIndex: number = 0;
  private score: number = 0;
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
    const wrongAnswers = generateWrongAnswers(problem.answer, 3);
    const options = shuffleArray([problem.answer, ...wrongAnswers]);
    const progress = `${this.currentIndex + 1} / ${this.problems.length}`;

    this.container.innerHTML = `
      <div class="game-header">
        <button class="btn-home" id="btn-home">🏠</button>
        <h2>🧠 Quiz</h2>
        <div class="progress">${progress}</div>
        <div class="score">⭐ ${this.score}</div>
      </div>
      <div class="quiz-question">
        <span class="emoji">${problem.emoji}</span>
        <span class="question">${problem.question} = ?</span>
      </div>
      <div class="quiz-options">
        ${options.map((opt) => `
          <button class="quiz-option" data-answer="${opt}" data-correct="${opt === problem.answer}">
            ${opt}
          </button>
        `).join("")}
      </div>
    `;

    document.getElementById("btn-home")?.addEventListener("click", this.onHome);

    document.querySelectorAll(".quiz-option").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const target = e.currentTarget as HTMLElement;
        const isCorrect = target.dataset.correct === "true";
        this.handleAnswer(isCorrect, target);
      });
    });
  }

  private handleAnswer(correct: boolean, button: HTMLElement): void {
    document.querySelectorAll(".quiz-option").forEach((btn) => {
      (btn as HTMLButtonElement).disabled = true;
      if (btn.getAttribute("data-correct") === "true") {
        btn.classList.add("correct");
      }
    });

    if (correct) {
      this.score++;
      button.classList.add("correct");
      this.showFeedback("✅ Correct!", true);
    } else {
      button.classList.add("wrong");
      const problem = this.problems[this.currentIndex];
      this.showFeedback(`❌ Het antwoord is ${problem.answer}`, false);
    }

    setTimeout(() => {
      this.currentIndex++;
      if (this.currentIndex >= this.problems.length) {
        this.showResults();
      } else {
        this.render();
      }
    }, 1200);
  }

  private showFeedback(message: string, isCorrect: boolean): void {
    const feedback = document.createElement("div");
    feedback.className = `feedback ${isCorrect ? "correct" : "wrong"}`;
    feedback.textContent = message;
    this.container.querySelector(".quiz-options")?.appendChild(feedback);
  }

  private showResults(): void {
    const percentage = Math.round((this.score / this.problems.length) * 100);
    const emoji = percentage >= 80 ? "🏆" : percentage >= 50 ? "🎉" : "💪";
    const message = percentage >= 80 ? "Super goed!" : percentage >= 50 ? "Goed gedaan!" : "Blijf oefenen!";

    this.container.innerHTML = `
      <div class="results">
        <h2>${emoji} ${message}</h2>
        <div class="results-score">
          <span class="big-emoji">⭐</span>
          <span class="score-text">${this.score} / ${this.problems.length}</span>
          <span class="percentage">${percentage}%</span>
        </div>
        <button class="btn btn-primary" id="btn-back">🏠 Terug naar menu</button>
      </div>
    `;

    document.getElementById("btn-back")?.addEventListener("click", () =>
      this.onComplete(this.score, this.problems.length)
    );
  }
}
