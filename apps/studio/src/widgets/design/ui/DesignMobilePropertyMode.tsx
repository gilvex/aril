import { Button } from 'vagabond-ui/button'
import { useCallback } from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'

export function DesignMobilePropertyMode({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const { patch, styles } = model
  const properties = useCallback(() => patch({ styles: false }), [patch])
  const defaults = useCallback(() => patch({ styles: true }), [patch])
  return (
    <div
      className="design-tools-property-mode"
      role="group"
      aria-label={t('Properties')}
    >
      <Button variant="ghost" aria-pressed={!styles} onClick={properties}>
        {t('Properties')}
      </Button>
      <Button variant="ghost" aria-pressed={styles} onClick={defaults}>
        {t('Styles')}
      </Button>
    </div>
  )
}
