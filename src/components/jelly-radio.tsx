import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import "./jelly-radio.css";

type Item = {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
};

type Props = {
  items: Item[];
  value: string;
  onChange: (value: string, index: number) => void;
  size?: "sm" | "md" | "lg";
  gap?: number;
  radius?: number;
  swell?: number;
  barge?: number;
  shrink?: number;
  jelly?: number;
  bounce?: number;
  stagger?: number;
  stiffness?: number;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
};

const SIZES = { sm: [28, 12, 12], md: [36, 13, 16], lg: [44, 14, 16] } as const;

type ChipMotion = {
  el: HTMLButtonElement | null;
  x: number;
  vx: number;
  sx: number;
  vsx: number;
  sy: number;
  vsy: number;
  tx: number;
  tsx: number;
  tsy: number;
  k: number;
  delay: number;
  started: number;
};

export function JellyRadio({
  items,
  value,
  onChange,
  size = "lg",
  gap = 8,
  radius = 999,
  swell = 0.12,
  barge = 4,
  shrink = 0.04,
  jelly = 0.6,
  bounce = 0.2,
  stagger = 18,
  stiffness = 580,
  disabled = false,
  ariaLabel = "Options",
  className = "",
}: Props) {
  const groupRef = useRef<HTMLDivElement>(null);
  const chips = useRef<ChipMotion[]>([]);
  const kick = useRef<() => void>(() => {});
  const at = Math.max(0, items.findIndex((item) => item.value === value));
  const atRef = useRef(at);
  const cfg = useRef({ swell, barge, shrink, jelly, bounce, stagger, stiffness });
  cfg.current = { swell, barge, shrink, jelly, bounce, stagger, stiffness };
  const [h, font, px] = SIZES[size] ?? SIZES.lg;
  const itemsKey = items.map((item) => item.value).join("|");

  function ensure(i: number) {
    let chip = chips.current[i];
    if (!chip) {
      chip = { el: null, x: 0, vx: 0, sx: 1, vsx: 0, sy: 1, vsy: 0, tx: 0, tsx: 1, tsy: 1, k: stiffness, delay: 0, started: 0 };
      chips.current[i] = chip;
    }
    return chip;
  }

  function apply(sel: number, instant: boolean) {
    const group = groupRef.current;
    if (!group) return;
    const C = cfg.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rtl = getComputedStyle(group).direction === "rtl";
    const width = chips.current[sel]?.el?.offsetWidth ?? 0;
    const push = (width * C.swell) / 2 + C.barge;
    const now = performance.now();
    for (let i = 0; i < items.length; i++) {
      const chip = ensure(i);
      const on = i === sel;
      const far = Math.abs(i - sel);
      const dir = Math.sign(i - sel) * (rtl ? -1 : 1);
      const s = on ? 1 + C.swell : 1 - C.shrink;
      chip.tx = dir * push;
      chip.tsx = s;
      chip.tsy = s;
      chip.k = C.stiffness * (1 - 0.12 * Math.min(far, 3));
      chip.delay = instant || reduce ? 0 : far * C.stagger;
      chip.started = now;
      if (instant || reduce) {
        chip.x = chip.tx;
        chip.vx = 0;
        chip.sx = s;
        chip.vsx = 0;
        chip.sy = s;
        chip.vsy = 0;
      }
      paint(i, sel);
    }
  }

  function paint(i: number, sel: number) {
    const chip = chips.current[i];
    const el = chip?.el;
    if (!chip || !el) return;
    el.style.transform = `translateX(${chip.x.toFixed(2)}px) scale(${chip.sx.toFixed(4)}, ${chip.sy.toFixed(4)})`;
    el.dataset.on = i === sel ? "true" : "false";
    el.setAttribute("aria-checked", i === sel ? "true" : "false");
    el.tabIndex = i === sel ? 0 : -1;
  }

  function measure() {
    const group = groupRef.current;
    if (!group) return;
    const widths = chips.current.map((chip) => chip.el?.offsetWidth ?? 0);
    const chipH = chips.current[0]?.el?.offsetHeight ?? 0;
    const maxW = Math.max(0, ...widths);
    group.style.setProperty("--jr-pad-x", `${Math.ceil((maxW * cfg.current.swell * 1.3) / 2 + cfg.current.barge) + 2}px`);
    group.style.setProperty("--jr-pad-y", `${Math.ceil((chipH * cfg.current.swell) / 2) + 2}px`);
  }

  useLayoutEffect(() => {
    chips.current = chips.current.slice(0, items.length);
    measure();
    apply(atRef.current, true);
    const group = groupRef.current;
    if (!group) return;
    const observer = new ResizeObserver(() => {
      measure();
      apply(atRef.current, true);
    });
    observer.observe(group);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey, size, gap, swell, barge, shrink]);

  useEffect(() => {
    if (atRef.current === at) return;
    atRef.current = at;
    apply(at, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [at]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      const C = cfg.current;
      let moving = false;
      chips.current.forEach((chip) => {
        if (!chip) return;
        if (now - chip.started < chip.delay) {
          moving = true;
          return;
        }
        const j = C.jelly;
        [chip.x, chip.vx] = spring(chip.x, chip.vx, chip.tx, chip.k, 0.9, C.bounce, dt);
        [chip.sx, chip.vsx] = spring(chip.sx, chip.vsx, chip.tsx, chip.k * (1 + 0.24 * j), 0.9 - 0.1 * j, Math.min(0.85, C.bounce + 0.3 * j), dt);
        if (now - chip.started >= chip.delay + 50 * j) {
          [chip.sy, chip.vsy] = spring(chip.sy, chip.vsy, chip.tsy, chip.k * (1 - 0.14 * j), 0.9 + 0.05 * j, C.bounce, dt);
        }
        if (Math.abs(chip.x - chip.tx) > 0.05 || Math.abs(chip.vx) > 0.05 || Math.abs(chip.sx - chip.tsx) > 0.002 || Math.abs(chip.sy - chip.tsy) > 0.002) {
          moving = true;
        }
      });
      chips.current.forEach((_, i) => paint(i, atRef.current));
      if (moving) raf = requestAnimationFrame(step);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(step);
    };
    kick.current = start;
    start();
    return () => cancelAnimationFrame(raf);
  }, [itemsKey]);

  function commit(i: number, instant: boolean) {
    if (disabled || i === atRef.current || items[i]?.disabled) return;
    atRef.current = i;
    apply(i, instant);
    kick.current();
    onChange(items[i].value, i);
  }

  function stepFrom(i: number, dir: number) {
    const n = items.length;
    let j = i;
    for (let tries = 0; tries < n; tries++) {
      j = (j + dir + n) % n;
      if (!items[j].disabled) return j;
    }
    return i;
  }

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label={ariaLabel}
      data-disabled={disabled ? "" : undefined}
      className={`jelly-radio${className ? ` ${className}` : ""}`}
      style={{
        ["--jr-gap" as string]: `${gap}px`,
        ["--jr-radius" as string]: `${radius}px`,
        ["--jr-h" as string]: `${h}px`,
        ["--jr-font" as string]: `${font}px`,
        ["--jr-px" as string]: `${px}px`,
      }}
    >
      {items.map((item, i) => (
        <button
          key={item.value}
          ref={(el) => {
            ensure(i).el = el;
          }}
          type="button"
          role="radio"
          aria-checked={i === at}
          tabIndex={i === at ? 0 : -1}
          disabled={disabled || !!item.disabled}
          className="jelly-radio__chip"
          data-on={i === at ? "true" : "false"}
          onClick={(event) => commit(i, event.detail === 0)}
          onKeyDown={(event) => {
            let next: number | null = null;
            if (event.key === "ArrowRight" || event.key === "ArrowDown") next = stepFrom(i, 1);
            else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = stepFrom(i, -1);
            else if (event.key === "Home") next = stepFrom(-1, 1);
            else if (event.key === "End") next = stepFrom(items.length, -1);
            else if (event.key === " " || event.key === "Enter") next = i;
            if (next === null) return;
            event.preventDefault();
            commit(next, true);
            chips.current[next]?.el?.focus();
          }}
        >
          <span className="jelly-radio__skin">
            {item.icon ? <span className="jelly-radio__icon">{item.icon}</span> : null}
            <span className="jelly-radio__label">{item.label}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

function spring(curr: number, vel: number, dest: number, k: number, mass: number, bounce: number, dt: number) {
  const damping = 2 * Math.sqrt(k * mass) * (1 - bounce);
  const acc = (-k * (curr - dest) - damping * vel) / mass;
  vel += acc * dt;
  curr += vel * dt;
  return [curr, vel] as const;
}
