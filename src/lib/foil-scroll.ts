export const FOIL_MAX_FULL = 3;

export type FoilRect = { top: number; height: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function isFoilOnScreen(rect: FoilRect, vh: number) {
  return rect.top < vh && rect.top + rect.height > 0;
}

/** 0 when the card sits at the bottom of the travel, 1 at the top. */
export function foilProgress(rect: FoilRect, vh: number) {
  const travel = Math.max(1, vh + rect.height);
  return clamp(1 - (rect.top + rect.height) / travel, 0, 1);
}

export function foilProximity(rect: FoilRect, vh: number) {
  const mid = vh / 2;
  if (mid <= 0) return 0;
  const center = rect.top + rect.height / 2;
  return clamp(1 - Math.abs(center - mid) / mid, 0, 1);
}

export function foilPosition(progress: number) {
  return {
    x: 8 + progress * 84,
    y: 6 + progress * 88,
  };
}

export function foilOpacity(proximity: number, rank: number, touch: boolean) {
  const peak = touch ? 0.26 : 0.4;
  const floor = touch ? 0.05 : 0.08;
  const cap = rank < FOIL_MAX_FULL ? 1 : 0.22;
  return floor + (peak - floor) * proximity * cap;
}

const registered = new Set<HTMLElement>();
const visible = new Set<HTMLElement>();
let raf = 0;
let listening = false;
let io: IntersectionObserver | null = null;

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function coarsePointer() {
  return window.matchMedia("(pointer: coarse)").matches || window.matchMedia("(hover: none)").matches;
}

function applyFoil(el: HTMLElement, opacity: number, x: number, y: number) {
  el.style.setProperty("--foil-opacity", String(opacity));
  el.style.setProperty("--foil-x", `${x}%`);
  el.style.setProperty("--foil-y", `${y}%`);
}

function tick() {
  raf = 0;
  if (reducedMotion()) {
    for (const el of registered) applyFoil(el, 0.1, 28, 42);
    return;
  }

  const vh = window.innerHeight;
  const touch = coarsePointer();
  const ranked = [...visible]
    .map((el) => {
      const box = el.getBoundingClientRect();
      const rect = { top: box.top, height: box.height };
      return { el, rect, proximity: foilProximity(rect, vh) };
    })
    .filter((item) => isFoilOnScreen(item.rect, vh))
    .sort((a, b) => b.proximity - a.proximity);

  const active = new Set(ranked.map((item) => item.el));
  for (const el of visible) {
    if (!active.has(el)) applyFoil(el, 0, 28, 42);
  }

  ranked.forEach((item, rank) => {
    const { x, y } = foilPosition(foilProgress(item.rect, vh));
    applyFoil(item.el, foilOpacity(item.proximity, rank, touch), x, y);
  });
}

function schedule() {
  if (raf) return;
  raf = requestAnimationFrame(tick);
}

function ensureListening() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        if (entry.isIntersecting) visible.add(el);
        else {
          visible.delete(el);
          applyFoil(el, 0, 28, 42);
        }
      }
      schedule();
    },
    { rootMargin: "10% 0px", threshold: 0 },
  );
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  window.visualViewport?.addEventListener("scroll", schedule, { passive: true });
}

function stopIfIdle() {
  if (registered.size || !listening) return;
  listening = false;
  io?.disconnect();
  io = null;
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("resize", schedule);
  window.visualViewport?.removeEventListener("scroll", schedule);
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
}

export function registerFoilCard(el: HTMLElement) {
  registered.add(el);
  ensureListening();
  io?.observe(el);
  schedule();
  return () => {
    registered.delete(el);
    visible.delete(el);
    io?.unobserve(el);
    el.style.removeProperty("--foil-opacity");
    el.style.removeProperty("--foil-x");
    el.style.removeProperty("--foil-y");
    stopIfIdle();
  };
}
