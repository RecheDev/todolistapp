import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-[0.98] active:transition-transform",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg transition-all duration-200",
        destructive:
          "bg-destructive/20 text-destructive border border-destructive/30 shadow-sm hover:bg-destructive/30 hover:shadow-md focus-visible:ring-destructive/20 transition-all duration-200",
        outline:
          "bg-muted/30 hover:bg-accent hover:text-accent-foreground transition-all duration-200",
        secondary:
          "bg-muted/20 text-secondary-foreground hover:bg-accent/50 transition-all duration-200",
        ghost:
          "hover:bg-accent/70 hover:text-accent-foreground transition-all duration-150",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80 transition-colors duration-150",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3 font-medium",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 font-medium text-sm",
        lg: "h-12 rounded-md px-6 has-[>svg]:px-4 font-semibold",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
