import { useCallback, useEffect, useRef, type FocusEvent } from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function DesignImageUrl({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const node = model.selected[0]
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (input.current && document.activeElement !== input.current)
      input.current.value = node.imageUrl || ''
  }, [node.imageUrl, node.id])
  const commit = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      if (event.target.reportValidity())
        model.edit({ imageUrl: event.target.value.trim() })
    },
    [model],
  )
  return (
    <input
      ref={input}
      name="imageUrl"
      aria-label={t('Image URL')}
      type="url"
      pattern="https://.*"
      placeholder="https://…"
      defaultValue={node.imageUrl}
      onBlur={commit}
      maxLength={2000}
    />
  )
}
