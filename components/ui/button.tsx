import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a98fff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#090c17] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-[linear-gradient(135deg,#8066ff,#4e9cff)] text-white shadow-[0_13px_30px_rgba(109,83,255,0.24)] hover:brightness-110 hover:-translate-y-0.5",
        secondary:
          "border border-white/15 bg-white/[0.035] text-[#e7eaff] hover:border-white/25 hover:bg-white/[0.075]",
        ghost: "text-[#acb5cf] hover:bg-white/[0.06] hover:text-white",
        danger: "border border-[#ff718d]/25 bg-[#ff718d]/10 text-[#ffadc0] hover:bg-[#ff718d]/18",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 px-5",
        icon: "size-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => {
    return <button className={cn(buttonVariants({ variant, size }), className)} ref={ref} type={type} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
