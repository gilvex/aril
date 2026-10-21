import { createElement, type JSX } from 'react'
import type { TextProps } from '../types/textProps.ts'
import './text.css'
export function Text<T extends keyof JSX.IntrinsicElements = 'span'>({
  as,
  variant = 'inherit',
  tone = 'inherit',
  className = '',
  children,
  ...props
}: TextProps<T>) {
  return createElement(
    as || 'span',
    {
      ...props,
      className: `text text-${variant} text-tone-${tone} ${className}`,
    },
    children,
  )
}
