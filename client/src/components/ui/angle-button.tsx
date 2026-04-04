import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const angleButtonVariants = cva(
  "relative inline-flex items-center justify-center font-bold text-white uppercase tracking-wider transition-all duration-300 transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        "learn-more": "bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 focus-visible:ring-pink-500",
        "buy-now": "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-600 focus-visible:ring-yellow-500",
        "read-more": "bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 focus-visible:ring-purple-500",
        "download": "bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 focus-visible:ring-blue-500",
        "book-now": "bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 focus-visible:ring-orange-500",
        "watch-now": "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 focus-visible:ring-purple-500",
        "apply-now": "bg-gradient-to-r from-orange-600 to-red-500 hover:from-orange-700 hover:to-red-600 focus-visible:ring-orange-500",
        "click-here": "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 focus-visible:ring-blue-500",
        primary: "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 focus-visible:ring-red-500",
      },
      size: {
        sm: "px-4 py-2 text-sm h-8",
        md: "px-6 py-3 text-base h-10",
        lg: "px-8 py-4 text-lg h-12",
        xl: "px-10 py-5 text-xl h-14",
      },
      angle: {
        left: "skew-x-12",
        right: "skew-x-[-12deg]",
        none: "skew-x-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      angle: "left",
    },
  }
)

export interface AngleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof angleButtonVariants> {
  asChild?: boolean
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
}

const AngleButton = React.forwardRef<HTMLButtonElement, AngleButtonProps>(
  (
    {
      className,
      variant,
      size,
      angle,
      icon,
      iconPosition = "right",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(angleButtonVariants({ variant, size, angle, className }))}
        ref={ref}
        {...props}
      >
        {/* Decorative corner elements */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white/30 rounded-tl-sm" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white/30 rounded-br-sm" />

        {/* Content */}
        <div className="flex items-center gap-2">
          {icon && iconPosition === "left" && <span>{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === "right" && <span>{icon}</span>}
        </div>

        {/* Hover glow effect */}
        <div className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-lg" />
      </button>
    )
  }
)

AngleButton.displayName = "AngleButton"

export { AngleButton, angleButtonVariants }
