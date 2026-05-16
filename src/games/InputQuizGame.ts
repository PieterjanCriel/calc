import type { Problem } from "../tables";
import { shuffleArray } from "../tables";
import { playCelebration } from "../celebration";

export class InputQuizGame {
  private problems: Problem[];
  private currentIndex: number = 0;
  private score: number = 0;
  private container: HTMLElement;
  private onComplete: (correct: number, total: number) => void;
  private onHome: () => void;
  private currentInput: string = "";

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
    (document.activeElement as HTMLElement)?.blur();
    this.currentInput = "";
    const problem = this.problems[this.currentIndex];
    const progress = `${this.currentIndex + 1} / ${this.problems.length}`;

    this.container.innerHTML = `
      <div class="game-header">
        <button class="btn-home" id="btn-home">Home</button>
        <h2>Typ het antwoord</h2>
        <div class="progress">${progress}</div>
        <div class="score">Score: ${this.score}</div>
      </div>
      <div class="quiz-question">
        <span class="question">${problem.question} = ?</span>
      </div>
      <div class="input-display" id="input-display">_</div>
      <div class="numpad">
        ${[1,2,3,4,5,6,7,8,9,0].map(n => `
          <button class="numpad-btn" data-digit="${n}">${n}</button>
        `).join("")}
      </div>
      <div class="input-actions">
        <button class="btn btn-wrong" id="btn-reset">Reset</button>
        <button class="btn btn-primary" id="btn-submit">OK</button>
      </div>
    `;

    document.getElementById("btn-home")?.addEventListener("click", this.onHome);
    document.getElementById("btn-reset")?.addEventListener("click", () => this.resetInput());
    document.getElementById("btn-submit")?.addEventListener("click", () => this.submitAnswer());

    document.querySelectorAll(".numpad-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const digit = (e.currentTarget as HTMLElement).dataset.digit!;
        this.addDigit(digit);
      });
    });
  }

  private addDigit(digit: string): void {
    if (this.currentInput.length >= 4) return;
    this.currentInput += digit;
    this.updateDisplay();
  }

  private resetInput(): void {
    this.currentInput = "";
    this.updateDisplay();
  }

  private updateDisplay(): void {
    const display = document.getElementById("input-display");
    if (display) {
      display.textContent = this.currentInput || "_";
    }
  }

  private submitAnswer(): void {
    if (this.currentInput === "") return;
    const answer = parseInt(this.currentInput, 10);
    const problem = this.problems[this.currentIndex];
    const isCorrect = answer === problem.answer;

    const display = document.getElementById("input-display")!;
    document.querySelectorAll(".numpad-btn, #btn-reset, #btn-submit").forEach(btn => {
      (btn as HTMLButtonElement).disabled = true;
    });

    if (isCorrect) {
      this.score++;
      display.classList.add("correct");
      this.showFeedback("Correct!", true);
    } else {
      display.classList.add("wrong");
      this.showFeedback(`Het antwoord is ${problem.answer}`, false);
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
    this.container.querySelector(".input-actions")?.after(feedback);
  }

  private showResults(): void {
    playCelebration();
    const percentage = Math.round((this.score / this.problems.length) * 100);
    const message = percentage >= 80 ? "Super goed!" : percentage >= 50 ? "Goed gedaan!" : "Blijf oefenen!";

    this.container.innerHTML = `
      <div class="results">
        <h2>${message}</h2>
        <div class="results-score">
          <span class="score-text">${this.score} / ${this.problems.length}</span>
          <span class="percentage">${percentage}%</span>
        </div>
        <button class="btn btn-primary" id="btn-back">Terug naar menu</button>
      </div>
    `;

    document.getElementById("btn-back")?.addEventListener("click", () =>
      this.onComplete(this.score, this.problems.length)
    );
  }
}
