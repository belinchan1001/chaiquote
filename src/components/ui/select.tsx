import * as React from "react";
import { cn } from "@/lib/utils";

function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "h-11 w-full appearance-none rounded-md bg-card bg-[length:12px] bg-[right_12px_center] bg-no-repeat px-3 pr-10 text-sm text-fg shadow-[var(--shadow-border)] outline-none transition-[box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path fill='none' stroke='%230C2248' stroke-width='1.4' d='M1.5 1.5 L6 6 L10.5 1.5'/></svg>\")",
      }}
      {...props}
    >
      {children}
    </select>
  );
}

export { Select };
