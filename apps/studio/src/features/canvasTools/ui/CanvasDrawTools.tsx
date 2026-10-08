import { Pencil, Highlighter, Eraser, AlignJustify } from 'lucide-react'
import { StudioActionButton } from '@/shared/ui/index.tsx'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useCanvasTools } from '../model/useCanvasTools.ts'
const colors = ['#799fee', '#edabc3', '#a5d7bb', '#e5c37f', '#888888']
const brushes = [
  { id: 'pencil', label: 'Pencil', icon: Pencil },
  { id: 'marker', label: 'Marker', icon: Highlighter },
  { id: 'eraser', label: 'Eraser', icon: Eraser },
] as const
export function CanvasDrawTools({ disabled = false }: { disabled?: boolean }) {
  const { t } = useTranslation()
  const { drawing, width, color, patch } = useCanvasTools()
  const role = useWorkspaceRole()
  const blocked = disabled || role === 'viewer' || role === null
  return (
    <>
      {brushes.map(({ id, label, icon: Icon }) => (
        <StudioActionButton
          key={id}
          disabled={blocked}
          title={t(label)}
          aria-label={t(label)}
          aria-pressed={drawing === id}
          onClick={() => patch({ drawing: id })}
        >
          <Icon size={18} />
        </StudioActionButton>
      ))}
      <StudioActionButton
        disabled={blocked}
        title={t('Stroke width: {{width}}', { width })}
        aria-label={t('Stroke width: {{width}}', { width })}
        onClick={() => patch({ width: width === 3 ? 6 : width === 6 ? 12 : 3 })}
      >
        <AlignJustify size={18} />
      </StudioActionButton>
      <StudioActionButton
        disabled={blocked}
        title={t('Ink color')}
        aria-label={t('Ink color')}
        onClick={() =>
          patch({ color: colors[(colors.indexOf(color) + 1) % colors.length] })
        }
      >
        <span className="canvas-draw-color" style={{ background: color }} />
      </StudioActionButton>
    </>
  )
}
