import {
  useCallback,
  type ChangeEvent,
  type CSSProperties,
  type KeyboardEvent,
} from 'react'
import { NodeResizer, type NodeProps } from '@xyflow/react'
import { Image } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { DesignFlowNode } from '../types/designFlowNode.ts'

export function DesignElementNode({
  data,
  selected,
}: NodeProps<DesignFlowNode>) {
  const { t } = useTranslation()
  const { element, editors, editing, editText, finishEditing } = data
  const textChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) =>
      editText(element.id, event.target.value),
    [editText, element.id],
  )
  const textKey = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      event.stopPropagation()
      if (
        event.key === 'Escape' ||
        (event.key === 'Enter' && (event.metaKey || event.ctrlKey))
      )
        finishEditing()
    },
    [finishEditing],
  )
  const fonts = {
    'DM Sans': '"DM Sans Variable", sans-serif',
    Manrope: '"Manrope Variable", sans-serif',
    Georgia: 'Georgia, serif',
    System: 'system-ui, sans-serif',
  }
  const style: CSSProperties = {
    background: element.fill,
    border: `${element.strokeWidth}px solid ${element.stroke}`,
    borderRadius: element.kind === 'ellipse' ? '50%' : element.radius,
    color: element.color,
    fontSize: element.fontSize,
    fontFamily: fonts[element.fontFamily],
    fontWeight: element.fontWeight,
    textAlign: element.textAlign,
    ...(editors.length ? { outline: `2px solid ${editors[0].color}` } : {}),
  }
  return (
    <>
      <NodeResizer
        isVisible={!!selected && !element.locked && !editing}
        minWidth={16}
        minHeight={16}
        maxWidth={6000}
        maxHeight={6000}
      />
      {element.kind === 'frame' && (
        <div className="design-frame-title">
          {element.name}
          <span>
            {Math.round(element.width)} × {Math.round(element.height)}
          </span>
        </div>
      )}
      <div className={`design-element kind-${element.kind}`} style={style}>
        {element.kind === 'image' &&
          (element.imageUrl ? (
            <img
              src={element.imageUrl}
              alt={element.name}
              draggable={false}
              referrerPolicy="no-referrer"
            />
          ) : (
            <Image size={32} aria-label={t('Image')} />
          ))}
        {editing ? (
          <textarea
            autoFocus
            className="nodrag nopan design-inline-text"
            aria-label={t('Text content')}
            value={element.text}
            maxLength={12000}
            onChange={textChange}
            onBlur={finishEditing}
            onKeyDown={textKey}
          />
        ) : (
          element.kind !== 'frame' &&
          element.kind !== 'image' && <span>{element.text}</span>
        )}
      </div>
      {editors.length > 0 && (
        <div
          className="design-layer-editors"
          aria-label={t('Selected by {{value}}', {
            value: editors.map((person) => person.name).join(', '),
          })}
        >
          {editors.map((person) => (
            <span key={person.id} style={{ background: person.color }}>
              {person.avatar && <img src={person.avatar} alt="" />}
              {person.name}
            </span>
          ))}
        </div>
      )}
    </>
  )
}
