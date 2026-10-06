import { Children, isValidElement, type ReactNode } from 'react'
import type { SelectOption } from '../types/selectOption.ts'

export function readSelectOptions(
  children: ReactNode,
  group?: string,
): SelectOption[] {
  return Children.toArray(children).flatMap((child) => {
    if (
      !isValidElement<{
        value?: string
        children?: ReactNode
        disabled?: boolean
        label?: string
      }>(child)
    )
      return []
    if (child.type === 'option')
      return [
        {
          value: String(child.props.value ?? ''),
          label: child.props.children,
          disabled: child.props.disabled,
          group,
        },
      ]
    return readSelectOptions(
      child.props.children,
      child.type === 'optgroup' ? child.props.label : group,
    )
  })
}
