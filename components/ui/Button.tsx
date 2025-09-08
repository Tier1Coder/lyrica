"use client"
import * as React from 'react'
import clsx from 'clsx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const base = 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed'

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-primary-fg hover:opacity-90 focus-visible:ring-primary',
  secondary: 'bg-secondary text-secondary-fg hover:opacity-90 focus-visible:ring-secondary',
  ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-inherit focus-visible:ring-gray-400',
  danger: 'bg-danger text-danger-fg hover:opacity-90 focus-visible:ring-danger',
}

export default function Button({ className, variant = 'primary', ...props }: Readonly<ButtonProps>) {
  return <button className={clsx(base, variants[variant], className)} {...props} />
}
