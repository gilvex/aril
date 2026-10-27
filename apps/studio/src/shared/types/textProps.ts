import type { ComponentPropsWithRef, JSX, ReactNode } from 'react'
export type TextProps<T extends keyof JSX.IntrinsicElements = 'span'> = {
  as?: T
  variant?: 'inherit' | 'body' | 'label' | 'caption' | 'title' | 'heading'
  tone?: 'inherit' | 'muted' | 'danger'
  children?: ReactNode
} & Omit<ComponentPropsWithRef<T>, 'as' | 'children'>
