import * as React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
  adornment?: React.ReactNode;
  adornmentPlacement?: "start" | "end";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, adornment, adornmentPlacement = "start", ...props },
    ref
  ) => {
    const hasAdornment = Boolean(adornment);
    const isStartAdornment = adornmentPlacement === "start";
    const isEndAdornment = adornmentPlacement === "end";

    if (!hasAdornment) {
      return (
        <input
          type={type}
          data-slot="input"
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            className
          )}
          ref={ref}
          {...props}
        />
      );
    }

    return (
      <div className="relative flex items-center">
        {isStartAdornment && (
          <div className="absolute left-3 z-10 flex items-center pointer-events-none text-muted-foreground">
            {adornment}
          </div>
        )}
        <input
          type={type}
          data-slot="input"
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            // Dynamic padding based on adornment placement
            isStartAdornment && "pl-10 pr-3",
            isEndAdornment && "pl-3 pr-10",
            className
          )}
          ref={ref}
          {...props}
        />
        {isEndAdornment && (
          <div className="absolute right-3 z-10 flex items-center pointer-events-none text-muted-foreground">
            {adornment}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input, type InputProps };
