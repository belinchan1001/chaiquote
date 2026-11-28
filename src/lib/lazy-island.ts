import {
  Component,
  Suspense,
  createElement,
  useEffect,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { onVitePreloadError, reloadOnceForChunkError } from "./public-error.ts";

type BoundaryProps = {
  children?: ReactNode;
  fallback?: ReactNode;
};

type BoundaryState = {
  hasError: boolean;
};

/** Catches a failed lazy chunk so the rest of the page keeps rendering. */
export class IslandErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error(error);
    if (info.componentStack) console.error(info.componentStack);
    reloadOnceForChunkError(error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}

/**
 * Suspense plus a local boundary. `fallback` is the loading placeholder.
 * `errorFallback` replaces the section after a chunk failure (default: omit it).
 */
export function LazyIsland({
  children,
  fallback = null,
  errorFallback = null,
}: {
  children?: ReactNode;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
}) {
  return createElement(
    IslandErrorBoundary,
    { fallback: errorFallback },
    createElement(Suspense, { fallback }, children),
  );
}

/** One-shot reload for a stale preload, without swallowing the import error. */
export function ChunkLoadRecovery() {
  useEffect(() => {
    const onEvent = (event: Event) => {
      onVitePreloadError(event);
    };
    window.addEventListener("vite:preloadError", onEvent);
    return () => window.removeEventListener("vite:preloadError", onEvent);
  }, []);
  return null;
}
