import * as SwitchPrimitive from "@radix-ui/react-switch";
import * as React from "react";

import { cn } from "../utils/utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-all outline-none",
        "data-[state=unchecked]:bg-[#2b2b2b] data-[state=checked]:bg-[#0aa2ff]",
        "shadow-inner focus-visible:ring-[3px] focus-visible:ring-[#74caff]/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-5 rounded-full bg-white ring-0 transition-transform duration-200 ease-out",
          "data-[state=unchecked]:translate-x-0 data-[state=checked]:translate-x-[calc(100%-2px)]",
          "shadow-md"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
