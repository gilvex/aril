import type { SelectChange } from '@/shared/types/selectChange.ts'
import {
  useCallback,
  useEffect,
  useRef,
  type DragEvent,
  type MouseEvent,
  type KeyboardEvent,
} from 'react'
import type { RequirementItemProps } from '../types/requirementItemProps.ts'
export function useRequirementCard({ item, model }: RequirementItemProps) {
  const { setViewState, selectRequirement, move, menuId, groupBy } = model
  const menu = useRef<HTMLButtonElement>(null)
  const menuButton = useRef<HTMLButtonElement>(null)
  const startDrag = useCallback(
    (event: DragEvent<HTMLElement>) => {
      if (
        (event.target as HTMLElement).closest(
          'button, input, select, [data-studio-select-menu]',
        )
      ) {
        event.preventDefault()
        return
      }
      event.dataTransfer.setData(
        'application/x-pomegranate-requirement',
        item.id,
      )
      event.dataTransfer.effectAllowed = 'move'
      setViewState({ draggingId: item.id, menuId: null })
    },
    [item.id, setViewState],
  )
  const endDrag = useCallback(
    () => setViewState({ draggingId: null, dropGroup: null }),
    [setViewState],
  )
  const open = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (
        (event.target as HTMLElement).closest(
          'button, input, select, label, a, [data-studio-select-menu]',
        )
      )
        return
      selectRequirement(item.id)
    },
    [item.id, selectRequirement],
  )
  const toggleMenu = useCallback(
    () => setViewState({ menuId: menuId === item.id ? null : item.id }),
    [item.id, menuId, setViewState],
  )
  const moveItem = useCallback(
    (event: SelectChange) => {
      move([item.id], groupBy, event.target.value)
      setViewState({ menuId: null })
      menuButton.current?.focus()
    },
    [item.id, groupBy, move, setViewState],
  )
  const keys = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if ((event.target as Element).closest('[data-studio-select-menu]')) return
      if (event.key === 'Escape' && menuId === item.id) {
        event.preventDefault()
        event.stopPropagation()
        setViewState({ menuId: null })
        menuButton.current?.focus()
      }
    },
    [menuId, item.id, setViewState],
  )
  useEffect(() => {
    if (menuId === item.id) menu.current?.focus()
  }, [menuId, item.id])
  return {
    menu,
    menuButton,
    startDrag,
    endDrag,
    open,
    toggleMenu,
    moveItem,
    keys,
  }
}
