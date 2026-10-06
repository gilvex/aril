import { filterRequirements } from '../utils/filterRequirements.ts'
import { moveRequirements } from '../utils/moveRequirements.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { requirementFieldLabels } from '@/widgets/requirements/config/requirementFieldLabels.ts'
import { createRequirementsState } from '@/widgets/requirements/model/createRequirementsState.ts'
import { useRequirementsModel } from '@/widgets/requirements/model/useRequirementsModel.ts'
import type { RequirementViewer } from '@/widgets/requirements/types/requirementViewer.ts'
import type { RequirementField } from '@pomegranate/domain/collaboration'
import type { Requirement } from '@pomegranate/domain/workspace'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { UseRequirementsControllerProps } from '../types/useRequirementsControllerProps.ts'
export function useRequirementsController({
  workspaceId,
  workspace,
  selected,
  onSelect,
  sendPresence,
  peers,
  profile,
  change,
}: UseRequirementsControllerProps) {
  const { t } = useTranslation()

  const preferenceKey =
    'pomegranate-requirements:' + profile.id + ':' + workspaceId
  const viewState = useRequirementsModel(() =>
    createRequirementsState(preferenceKey),
  )
  const {
    query,
    setQuery,
    category,
    setCategory,
    activity,
    setActivity,
    setViewState,
    priority,
    status,
    view,
    groupBy,
    detailWidth,
    checkedIds,
  } = viewState
  const anchor = useRef<string | null>(null)
  useEffect(() => {
    try {
      localStorage.setItem(
        preferenceKey,
        JSON.stringify({ view, groupBy, detailWidth }),
      )
    } catch {
      /* Optional preference. */
    }
  }, [preferenceKey, view, groupBy, detailWidth])
  useEffect(() => {
    const remaining = checkedIds.filter((id) =>
      workspace.requirements.some((item) => item.id === id),
    )
    if (remaining.length !== checkedIds.length)
      setViewState({ checkedIds: remaining })
  }, [workspace.requirements, checkedIds, setViewState])

  const current = useMemo(
    () => workspace.requirements.find((r) => r.id === selected),
    [workspace, selected],
  )

  const typingTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )
  const selectRequirement = useCallback(
    (id: string | null) => {
      clearTimeout(typingTimer.current)
      setActivity(null)
      onSelect(id)
    },
    [typingTimer, setActivity, onSelect],
  )
  const currentId = current?.id || null
  const field = activity?.id === currentId ? activity.field : null
  const typing = activity?.id === currentId && activity.typing
  useEffect(() => {
    sendPresence(
      { requirement: currentId ? { id: currentId, field, typing } : null },
      true,
    )
  }, [currentId, field, typing, sendPresence])
  useEffect(() => {
    const hide = () => {
      if (document.hidden) {
        clearTimeout(typingTimer.current)
        setActivity(null)
      }
    }
    document.addEventListener('visibilitychange', hide)
    return () => {
      clearTimeout(typingTimer.current)
      document.removeEventListener('visibilitychange', hide)
    }
  }, [setActivity])
  const peopleFor = useCallback(
    (id: string): RequirementViewer[] => {
      const people: RequirementViewer[] = peers
        .filter(
          (peer) => peer.view === 'requirements' && peer.requirement?.id === id,
        )
        .sort((a, b) => a.seenAt - b.seenAt)
        .map((peer) => ({
          profile: peer.profile,
          requirement: peer.requirement!,
        }))
      if (currentId === id)
        people.push({ profile, requirement: { id, field, typing } })
      return [
        ...new Map(
          people.map((person) => [person.profile.id, person]),
        ).values(),
      ]
    },
    [peers, currentId, profile, field, typing],
  )
  const fieldPeople = useCallback(
    (name: RequirementField) =>
      currentId
        ? peopleFor(currentId).filter(
            (person) =>
              person.profile.id !== profile.id &&
              person.requirement.field === name,
          )
        : [],
    [currentId, peopleFor, profile],
  )
  const fieldProps = useCallback(
    (name: RequirementField) => {
      const editors = fieldPeople(name)
      return {
        onFocus: () => {
          clearTimeout(typingTimer.current)
          if (currentId)
            setActivity({ id: currentId, field: name, typing: false })
        },
        onBlur: () => {
          clearTimeout(typingTimer.current)
          setActivity(null)
        },
        onInput: () => {
          if (
            !currentId ||
            !['title', 'description', 'acceptance'].includes(name)
          )
            return
          setActivity({ id: currentId, field: name, typing: true })
          clearTimeout(typingTimer.current)
          typingTimer.current = setTimeout(
            () =>
              setActivity((value) =>
                value ? { ...value, typing: false } : null,
              ),
            1500,
          )
        },
        style: editors.length
          ? {
              outline: `2px solid ${editors[0].profile.color}99`,
              outlineOffset: 2,
            }
          : undefined,
      }
    },
    [fieldPeople, typingTimer, currentId, setActivity],
  )
  const fieldHint = useCallback(
    (name: RequirementField) => {
      const editors = fieldPeople(name)
      return editors.length ? (
        <span className="requirement-field-presence">
          {editors.map((person) => person.profile.name).join(', ')} ·{' '}
          {editors.some((person) => person.requirement.typing)
            ? t('typing in')
            : t('editing')}{' '}
          {t(requirementFieldLabels[name])}
        </span>
      ) : null
    },
    [fieldPeople, t],
  )
  const results = useMemo(
    () =>
      filterRequirements(workspace.requirements, {
        query,
        category,
        priority,
        status,
      }),
    [workspace.requirements, query, category, priority, status],
  )
  const checked = useMemo(() => new Set(checkedIds), [checkedIds])
  const toggleChecked = useCallback(
    (id: string, range = false) => {
      const next = new Set(checkedIds)
      const from = results.findIndex((item) => item.id === anchor.current)
      const to = results.findIndex((item) => item.id === id)
      if (range && from >= 0 && to >= 0)
        results
          .slice(Math.min(from, to), Math.max(from, to) + 1)
          .forEach((item) => next.add(item.id))
      else if (next.has(id)) next.delete(id)
      else next.add(id)
      anchor.current = id
      setViewState({ checkedIds: [...next] })
    },
    [checkedIds, results, setViewState],
  )
  const move = useCallback(
    (
      ids: string[],
      field: 'status' | 'priority' | 'category',
      value: string,
    ) => {
      change((w) => moveRequirements(w, ids, field, value))
    },
    [change],
  )
  const clearFilters = useCallback(
    () =>
      setViewState({
        query: '',
        category: 'All areas',
        status: '',
        priority: '',
      }),
    [setViewState],
  )
  const update = useCallback(
    (patch: Partial<Requirement>) => {
      const choice = (['priority', 'status', 'category'] as const).find(
        (name) => name in patch,
      )
      if (choice && currentId) {
        clearTimeout(typingTimer.current)
        setActivity({ id: currentId, field: choice, typing: false })
      }
      change((w) => ({
        ...w,
        requirements: w.requirements.map((r) =>
          r.id === selected ? { ...r, ...patch } : r,
        ),
      }))
    },
    [currentId, typingTimer, setActivity, change, selected],
  )
  const add = useCallback(
    (defaults: Partial<Requirement> = {}) => {
      const id = `R-${crypto.randomUUID().slice(0, 6)}`
      change((w) => ({
        ...w,
        requirements: [
          ...w.requirements,
          {
            id,
            title: 'New requirement',
            description: '',
            acceptance: '',
            category:
              category === 'All areas'
                ? 'Experience'
                : (category as Requirement['category']),
            priority: priority || 'Should have',
            status: status || 'Captured',
            ...defaults,
          },
        ],
      }))
      selectRequirement(id)
    },
    [change, selectRequirement, category, priority, status],
  )
  return {
    ...viewState,
    workspace,
    selected,
    profile,
    checked,
    toggleChecked,
    move,
    clearFilters,
    add,
    query,
    setQuery,
    category,
    setCategory,
    results,
    selectRequirement,
    peopleFor,
    current,
    fieldProps,
    update,
    fieldHint,
  }
}
