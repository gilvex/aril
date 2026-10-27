import { Text } from '@/shared/ui/Text.tsx'
import {
  useCallback,
  useId,
  useRef,
  useMemo,
  type ChangeEvent,
  type CSSProperties,
} from 'react'
import { Popover } from 'radix-ui'
import { useCompactLayout } from '@/shared/model/index.ts'
import { Search, X } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { nodeIconOptions } from '../config/nodeIconOptions.ts'
import { IconLibraryFooter } from './IconLibraryFooter.tsx'
import type { IconLibraryOptionProps } from '../types/iconLibraryOptionProps.ts'
import type { IconLibraryProps } from '../types/iconLibraryProps.ts'
import { IconLibraryOption } from './IconLibraryOption.tsx'
export function IconLibrary({
  node,
  readOnly,
  updateNode,
  model,
}: IconLibraryProps) {
  const { t } = useTranslation()
  const titleId = useId()
  const compact = useCompactLayout()
  const searchInput = useRef<HTMLInputElement>(null)
  const focusSearch = useCallback((event: Event) => {
    event.preventDefault()
    searchInput.current?.focus()
  }, [])
  const { query, size, setQuery, setSize, setOpen } = model
  const options = useMemo(
    () =>
      Object.entries(nodeIconOptions).filter(([id, option]) =>
        [id, option.label, t(option.label)].some((label) =>
          label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
        ),
      ),
    [query, t],
  )
  const search = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value),
    [setQuery],
  )
  const resize = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      setSize(Number(event.target.value)),
    [setSize],
  )
  const choose = useCallback(
    (icon: IconLibraryOptionProps['id']) => {
      if (readOnly) return
      updateNode({ icon })
      setOpen(false)
    },
    [readOnly, updateNode, setOpen],
  )
  const style = useMemo(
    () => ({ '--icon-preview-size': size + 'px' }) as CSSProperties,
    [size],
  )
  return (
    <Popover.Content
      className="icon-library nodrag nopan nowheel"
      side={compact ? 'bottom' : 'left'}
      align={compact ? 'center' : 'start'}
      sideOffset={12}
      collisionPadding={12}
      onOpenAutoFocus={focusSearch}
      aria-labelledby={titleId}
      style={style}
    >
      <header className="icon-library-header">
        <Text as="h2" id={titleId}>
          {t('Icon library')}
        </Text>
        <Popover.Close
          className="icon-button"
          aria-label={t('Close icon library')}
        >
          <X size={16} />
        </Popover.Close>
      </header>
      <Text as="label" className="icon-library-search">
        <Search size={16} aria-hidden="true" />
        <input
          ref={searchInput}
          type="search"
          value={query}
          onChange={search}
          placeholder={t('Search icons by name')}
          aria-label={t('Search icons by name')}
        />
      </Text>
      <Text as="label" className="icon-library-size">
        <Text as="span">{t('Preview size')}</Text>
        <input
          type="range"
          min={20}
          max={48}
          step={4}
          value={size}
          onChange={resize}
          aria-label={t('Preview size')}
        />
        <output>
          <Text>{size}</Text> <Text>px</Text>
        </output>
      </Text>
      <div className="icon-library-grid" aria-label={t('Available icons')}>
        {options.map(([id, option]) => (
          <IconLibraryOption
            key={id}
            id={id as keyof typeof nodeIconOptions}
            label={t(option.label)}
            icon={option.icon}
            selected={node.data.icon === id}
            size={size}
            choose={choose}
          />
        ))}
      </div>
      {!options.length && (
        <Text as="p" className="icon-library-empty" role="status">
          {t('No icons found. Try another name.')}
        </Text>
      )}
      <IconLibraryFooter node={node} count={options.length} choose={choose} />
    </Popover.Content>
  )
}
