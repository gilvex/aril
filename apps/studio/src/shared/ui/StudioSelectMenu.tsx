import { Select } from 'radix-ui'
import { ChevronUp, ChevronDown } from 'lucide-react'
import type { StudioSelectMenuProps } from '../types/studioSelectMenuProps.ts'

export function StudioSelectMenu({ children }: StudioSelectMenuProps) {
  return (
    <Select.Portal container={document.fullscreenElement || document.body}>
      <Select.Content
        className="studio-select-menu"
        data-studio-select-menu
        position="popper"
        sideOffset={5}
        collisionPadding={12}
      >
        <Select.ScrollUpButton>
          <ChevronUp size={16} />
        </Select.ScrollUpButton>
        <Select.Viewport>{children}</Select.Viewport>
        <Select.ScrollDownButton>
          <ChevronDown size={16} />
        </Select.ScrollDownButton>
      </Select.Content>
    </Select.Portal>
  )
}
