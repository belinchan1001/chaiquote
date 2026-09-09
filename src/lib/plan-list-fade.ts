export const PLAN_LIST_STICKY_OFFSET = 80;
const MIN_VISIBLE_PX = 64;

export function isPlanListInView(
  rect: { top: number; bottom?: number; height?: number },
  viewportHeight: number,
  stickyOffset = PLAN_LIST_STICKY_OFFSET,
) {
  if (viewportHeight <= 0) return false;
  const bottom = rect.bottom ?? rect.top + (rect.height ?? 0);
  if (rect.top >= viewportHeight) return false;
  if (bottom <= stickyOffset) return false;
  const visible = Math.min(bottom, viewportHeight) - Math.max(rect.top, stickyOffset);
  return visible >= MIN_VISIBLE_PX;
}

/** Jump the list under the sticky header so the fade is on-screen. Instant so 240ms cannot finish mid-scroll. */
export function bringPlanListIntoView(el: HTMLElement) {
  el.scrollIntoView({ behavior: "auto", block: "start", inline: "nearest" });
}

export function watchPlanListInView(el: HTMLElement, onView: () => void): () => void {
  let done = false;
  let io: IntersectionObserver | null = null;

  const finish = () => {
    if (done) return;
    if (!isPlanListInView(el.getBoundingClientRect(), window.innerHeight)) return;
    done = true;
    io?.disconnect();
    window.removeEventListener("scrollend", finish);
    onView();
  };

  if (isPlanListInView(el.getBoundingClientRect(), window.innerHeight)) {
    onView();
    return () => {
      done = true;
    };
  }

  io = new IntersectionObserver(() => finish(), {
    threshold: [0, 0.1, 0.25, 0.5, 1],
    rootMargin: `-${PLAN_LIST_STICKY_OFFSET}px 0px 0px 0px`,
  });
  io.observe(el);
  window.addEventListener("scrollend", finish, { passive: true });

  return () => {
    done = true;
    io?.disconnect();
    window.removeEventListener("scrollend", finish);
  };
}
