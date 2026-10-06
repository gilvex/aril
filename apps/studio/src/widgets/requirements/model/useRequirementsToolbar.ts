import { useCallback, useEffect, useRef, useId, type ChangeEvent } from 'react'
import type { RequirementsViewProps } from '../types/requirementsViewProps.ts'
export function useRequirementsToolbar({ model }: RequirementsViewProps) {
  const { panel, setViewState, add } = model
  const root = useRef<HTMLDivElement>(null)
  const popup = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement | null>(null)
  const id = useId()
  const close = useCallback(() => {
    setViewState({ panel: null })
    trigger.current?.focus()
  }, [setViewState])
  const toggle = useCallback(
    (kind: 'filters' | 'search', button: HTMLButtonElement) => {
      trigger.current = button
      setViewState({ panel: panel === kind ? null : kind, menuId: null })
    },
    [panel, setViewState],
  )
  useEffect(() => {
    if (!panel) return
    popup.current?.querySelector<HTMLInputElement>('input, select')?.focus()
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node))
        setViewState({ panel: null })
    }
    const keys = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        close()
      }
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', keys, true)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', keys, true)
    }
  }, [panel, close, setViewState])
  const changeView = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value
      setViewState({
        view: value === 'list' ? 'list' : 'board',
        ...(value === 'list'
          ? {}
          : { groupBy: value as 'status' | 'priority' }),
        panel: null,
        menuId: null,
      })
    },
    [setViewState],
  )
  const activeCount =
    Number(model.category !== 'All areas') +
    Number(!!model.status) +
    Number(!!model.priority)
  const addRequirement = useCallback(() => {
    setViewState({ panel: null, menuId: null })
    add()
  }, [add, setViewState])
  return {
    root,
    popup,
    id,
    close,
    toggle,
    changeView,
    activeCount,
    addRequirement,
  }
}
