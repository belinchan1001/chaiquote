import { lazy, Suspense, useEffect, useState, type ComponentProps } from "react";
import { Input } from "@/components/ui/input";

const EstateSuggestAsync = lazy(() =>
  import("@/components/estate-suggest").then((mod) => ({ default: mod.EstateSuggest })),
);

type Props = ComponentProps<typeof EstateSuggestAsync> & { eager?: boolean };

export function LazyEstateSuggest({ eager = false, ...props }: Props) {
  const [active, setActive] = useState(eager);

  useEffect(() => {
    if (active) return;
    const start = () => setActive(true);
    const idle =
      typeof window !== "undefined" && "requestIdleCallback" in window
        ? window.requestIdleCallback(start, { timeout: 2500 })
        : undefined;
    const timer = window.setTimeout(start, 2500);
    return () => {
      if (idle != null) window.cancelIdleCallback?.(idle);
      window.clearTimeout(timer);
    };
  }, [active]);

  const fallback = (
    <Input
      id={props.id}
      name={props.name}
      value={props.value}
      placeholder={props.placeholder}
      autoComplete="street-address"
      onChange={(event) => props.onChange(event.target.value)}
      onFocus={() => setActive(true)}
    />
  );

  if (!active) return fallback;
  return (
    <Suspense fallback={fallback}>
      <EstateSuggestAsync {...props} />
    </Suspense>
  );
}
