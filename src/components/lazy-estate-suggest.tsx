import { lazy, Suspense, useState, type ComponentProps } from "react";
import { Input } from "@/components/ui/input";

const EstateSuggestAsync = lazy(() =>
  import("@/components/estate-suggest").then((mod) => ({ default: mod.EstateSuggest })),
);

type Props = ComponentProps<typeof EstateSuggestAsync> & { eager?: boolean };

export function LazyEstateSuggest({ eager = false, ...props }: Props) {
  const [active, setActive] = useState(eager);

  const fallback = (
    <Input
      id={props.id}
      name={props.name}
      value={props.value}
      placeholder={props.placeholder}
      autoComplete="street-address"
      onChange={(event) => {
        setActive(true);
        props.onChange(event.target.value);
      }}
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
