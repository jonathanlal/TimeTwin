import * as React from 'react'
import { cn } from '@/lib/utils'

const variantStyles = {
  primary:
    'bg-sky-500 text-white shadow-[0_18px_40px_-24px_rgba(56,189,248,0.75)] hover:bg-sky-400 focus-visible:ring-sky-300',
  secondary:
    'bg-indigo-500 text-white shadow-[0_18px_40px_-24px_rgba(129,140,248,0.75)] hover:bg-indigo-400 focus-visible:ring-indigo-300',
  outline:
    'border border-slate-700 bg-transparent text-slate-100 hover:border-slate-500 hover:bg-slate-900/40 focus-visible:ring-slate-400',
  ghost:
    'bg-transparent text-slate-200 hover:bg-slate-900/30 focus-visible:ring-slate-400',
  subtle:
    'bg-slate-800/60 text-slate-100 hover:bg-slate-800 focus-visible:ring-slate-400',
} as const

const sizeStyles = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-sm font-medium',
  lg: 'h-12 px-6 text-base font-semibold',
  icon: 'h-11 w-11',
} as const

export type ButtonVariant = keyof typeof variantStyles
export type ButtonSize = keyof typeof sizeStyles

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  asChild?: boolean
}

const BaseButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild = false, type = 'button', ...props }, ref) => {
    const { children, ...rest } = props
    const classes = cn(
      'no-underline inline-flex select-none items-center justify-center gap-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-60',
      variantStyles[variant],
      sizeStyles[size],
      className,
    )

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...rest,
        className: cn(classes, children.props.className),
      })
    }

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        {...rest}
      >
        {children}
      </button>
    )
  },
)

BaseButton.displayName = 'Button'

export const Button = BaseButton

