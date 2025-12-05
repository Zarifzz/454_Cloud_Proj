import * as React from 'react'
import { cn } from './utils'

type ButtonVariant = 'default' | 'outline' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

const baseStyles =
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

const variantStyles: Record<ButtonVariant, string> = {
  default: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600',
  outline:
    'border border-slate-200 text-slate-900 bg-white hover:bg-slate-50 focus-visible:ring-slate-200',
  ghost: 'text-slate-900 hover:bg-slate-100 focus-visible:ring-slate-100',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-6 text-base',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className = '', variant = 'default', size = 'md', ...props },
  ref,
) {
  const variantClass = variantStyles[variant] ?? variantStyles.default
  const sizeClass = sizeStyles[size] ?? sizeStyles.md
  const classes = cn(baseStyles, variantClass, sizeClass, className)

  return <button ref={ref} className={classes} {...props} />
})
