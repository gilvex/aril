import { useTranslation } from '@/shared/i18n/index.ts'
import { Copy, Trash2 } from 'lucide-react'
import { useWireframeNodeDetailsHandlers } from '../model/useWireframeNodeDetailsHandlers.tsx'
import { WireframeDimensions } from './WireframeDimensions.tsx'

import { WireframeInteraction } from './WireframeInteraction.tsx'

import type { WireframeNodeDetailsProps } from '../types/wireframeNodeDetailsProps.ts'
export function WireframeNodeDetails(props: WireframeNodeDetailsProps) {
  const { node, editField, editData, editNode, screens, duplicate } = props

  const { t } = useTranslation()

  const { handleBlockScreenChange, handleBlockAppearanceChange, handleClick } =
    useWireframeNodeDetailsHandlers(props)
  return (
    <div className="inspector-body" key={node.id}>
      <label>
        {t('Label')}
        <input
          aria-label={t('Block label')}
          ref={editField}
          value={node.data.title}
          maxLength={120}
          onChange={(e) => editData({ title: e.target.value || 'Untitled' })}
        />
      </label>
      {node.data.kind !== 'button' && node.data.kind !== 'screen' && (
        <label>
          {node.data.kind === 'input' ? t('Placeholder') : t('Content')}
          <textarea
            aria-label={t('Block content')}
            rows={3}
            maxLength={2000}
            value={node.data.content}
            onChange={(e) => editData({ content: e.target.value })}
          />
        </label>
      )}
      <WireframeDimensions t={t} node={node} editNode={editNode} />
      {node.data.kind === 'screen' ? (
        <div className="wire-screen-presets">
          <button
            className="button"
            onClick={() => editNode({ width: 640, height: 460 })}
          >
            {t('Desktop')}
          </button>
          <button
            className="button"
            onClick={() => editNode({ width: 320, height: 640 })}
          >
            {t('Mobile')}
          </button>
        </div>
      ) : (
        <label>
          {t('On screen')}
          <select
            aria-label={t('Block screen')}
            value={node.parentId || ''}
            onChange={handleBlockScreenChange}
          >
            <option value="">{t('Canvas (no screen)')}</option>
            {screens.map((screen) => (
              <option key={screen.id} value={screen.id}>
                {screen.data.title}
              </option>
            ))}
          </select>
        </label>
      )}
      <label>
        {t('Appearance')}
        <select
          aria-label={t('Block appearance')}
          value={node.data.tone}
          onChange={handleBlockAppearanceChange}
        >
          <option value="plain">{t('Plain')}</option>
          <option value="soft">{t('Soft')}</option>
          <option value="accent">{t('Accent')}</option>
        </select>
      </label>
      <WireframeInteraction
        {...props}

        node={node}
      />
      <div className="inspector-actions">
        <button className="button" onClick={duplicate}>
          <Copy size={14} />
          {t('Duplicate')}
        </button>
        <button
          className="icon-button danger"
          aria-label={
            node.data.kind === 'screen'
              ? t('Delete screen and its blocks')
              : t('Delete block')
          }
          onClick={handleClick}
        >
          <Trash2 size={16} />
        </button>
      </div>
      {node.data.kind === 'screen' && (
        <p>
          {t(
            'Drag the screen’s title bar to move it with its blocks. Deleting a screen also deletes its contents; Undo restores them.',
          )}
        </p>
      )}
    </div>
  )
}
