import { useCallback, useEffect } from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function DesignDrawerBackdrop({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const { patch } = model
  const close = useCallback(
    () => patch({ layers: false, inspector: false }),
    [patch],
  )
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) close()
    }
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [close])
  return (
    <button
      className="design-drawer-backdrop"
      aria-label={t('Close panel')}
      onClick={close}
    />
  )
}
