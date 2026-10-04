import type { ComponentProps } from "react"

export type ButtonVariant = "primary" | "outline" | "ghost"
export type ButtonSize = "sm" | "md" | "lg"

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-pill font-medium " +
  "transition-colors dur-fast ease-standard " +
  "disabled:cursor-not-allowed disabled:opacity-disabled"

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-strong",
  outline:
    "border border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground",
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
}

const SIZES: Record<ButtonSize, string> = {
  sm: "min-h-control-sm px-3.5 text-[0.8125rem]",
  md: "min-h-touch px-4 text-sm",
  lg: "min-h-control-lg px-6 text-sm",
}

export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
} = {}) {
  return [BASE, VARIANTS[variant], SIZES[size], className]
    .filter(Boolean)
    .join(" ")
}

export function Button({
  variant,
  size,
  className,
  ...props
}: ComponentProps<"button"> & {
  variant?: ButtonVariant
  size?: ButtonSize
}) {
  return (
    <button className={buttonStyles({ variant, size, className })} {...props} />
  )
}