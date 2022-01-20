import confetti, { Options } from "canvas-confetti";

const count = 200;
const defaults = {
  disableForReducedMotion: true,
  origin: { y: 0.7 },
};

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function fireLayer(particleRatio: number, opts: Options) {
  const randomAngleVariation = 20;
  confetti(
    Object.assign({}, defaults, opts, {
      particleCount: Math.floor(count * particleRatio),
      angle: randomBetween(
        90 - randomAngleVariation,
        90 + randomAngleVariation
      ),
    })
  );
}

export default function fire() {
  fireLayer(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fireLayer(0.2, {
    spread: 60,
  });
  fireLayer(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fireLayer(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fireLayer(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}
