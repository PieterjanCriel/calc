const resolvedUrl = `${import.meta.env.BASE_URL}assets/coach.svg`;

type Animation = (el: HTMLElement, i: number, total: number) => void;

const animations: Animation[] = [
  // Massive rain: coaches pour down in waves
  (el, i, total) => {
    const x = (i / total) * 120 - 10 + (Math.random() * 20 - 10);
    const wave = Math.floor(i / 8);
    const delay = wave * 0.6 + Math.random() * 0.4;
    const duration = 2.5 + Math.random() * 1.5;
    const size = 70 + Math.random() * 90;
    const rotation = Math.random() * 1080 - 540;
    const wobble = Math.random() * 150 - 75;
    Object.assign(el.style, {
      left: `${x}%`,
      top: `-${size + 20}px`,
      width: `${size}px`,
      height: `${size}px`,
      animation: `celebRain ${duration}s ${delay}s ease-in forwards`,
      "--wobble": `${wobble}px`,
      "--rotation": `${rotation}deg`,
    } as Record<string, string>);
  },

  // Big bang: massive explosion from center
  (el, i, total) => {
    const angle = (i / total) * Math.PI * 2 + Math.random() * 0.3;
    const distance = 300 + Math.random() * 500;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    const delay = Math.random() * 0.5;
    const size = 60 + Math.random() * 100;
    const rotation = Math.random() * 1440 - 720;
    Object.assign(el.style, {
      left: "50%",
      top: "45%",
      width: `${size}px`,
      height: `${size}px`,
      transform: "translate(-50%, -50%) scale(0)",
      animation: `celebExplode 2.5s ${delay}s cubic-bezier(0.22, 1, 0.36, 1) forwards`,
      "--tx": `${tx}px`,
      "--ty": `${ty}px`,
      "--rotation": `${rotation}deg`,
    } as Record<string, string>);
  },

  // Party rise: big coaches float up in staggered columns
  (el, i, total) => {
    const col = i % 7;
    const x = (col / 6) * 100;
    const delay = Math.floor(i / 7) * 0.4 + Math.random() * 0.3;
    const duration = 3 + Math.random() * 2;
    const size = 80 + Math.random() * 80;
    const sway = Math.random() * 200 - 100;
    Object.assign(el.style, {
      left: `${x}%`,
      bottom: `-${size + 30}px`,
      width: `${size}px`,
      height: `${size}px`,
      animation: `celebFloat ${duration}s ${delay}s ease-out forwards`,
      "--sway": `${sway}px`,
    } as Record<string, string>);
  },

  // Fireworks: multiple bursts from different points
  (el, i, total) => {
    const burstCount = 3;
    const burst = i % burstCount;
    const centers = [
      { x: 25, y: 35 },
      { x: 75, y: 40 },
      { x: 50, y: 25 },
    ];
    const center = centers[burst];
    const idx = Math.floor(i / burstCount);
    const perBurst = Math.ceil(total / burstCount);
    const angle = (idx / perBurst) * Math.PI * 2 + Math.random() * 0.5;
    const distance = 200 + Math.random() * 400;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    const delay = burst * 0.7 + Math.random() * 0.3;
    const size = 60 + Math.random() * 80;
    const rotation = Math.random() * 1080 - 540;
    Object.assign(el.style, {
      left: `${center.x}%`,
      top: `${center.y}%`,
      width: `${size}px`,
      height: `${size}px`,
      transform: "translate(-50%, -50%) scale(0)",
      animation: `celebExplode 2.5s ${delay}s cubic-bezier(0.22, 1, 0.36, 1) forwards`,
      "--tx": `${tx}px`,
      "--ty": `${ty}px`,
      "--rotation": `${rotation}deg`,
    } as Record<string, string>);
  },
];

export function playCelebration(): void {
  const overlay = document.createElement("div");
  overlay.className = "celeb-overlay";
  document.body.appendChild(overlay);

  const variation = animations[Math.floor(Math.random() * animations.length)];
  const count = 40 + Math.floor(Math.random() * 20);

  for (let i = 0; i < count; i++) {
    const img = document.createElement("img");
    img.src = resolvedUrl;
    img.className = "celeb-item";
    img.draggable = false;
    overlay.appendChild(img);
    variation(img, i, count);
  }

  setTimeout(() => {
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 800);
  }, 5500);
}
