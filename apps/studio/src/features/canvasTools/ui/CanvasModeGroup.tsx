import { useCallback, type CSSProperties } from 'react'
import { Pencil, Shapes, CodeXml, Clapperboard } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from 'vagabond-ui/toggle-group'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useCanvasTools } from '../model/useCanvasTools.ts'
import type { CanvasToolMode } from '../types/canvasToolMode.ts'
const modes = [
  { id: 'draw', label: 'Hand-drawn', icon: Pencil },
  { id: 'shapes', label: 'Shapes', icon: Shapes },
  { id: 'dev', label: 'Dev mode', icon: CodeXml },
  { id: 'motion', label: 'Motion', icon: Clapperboard },
] as const
export function CanvasModeGroup({
  onChange,
}: {
  onChange?: (mode: CanvasToolMode) => void
}) {
  const { t } = useTranslation()
  const { mode, setMode } = useCanvasTools()
  const select = useCallback(
    (value: string) => {
      if (!modes.some((item) => item.id === value)) return
      setMode(value as CanvasToolMode)
      onChange?.(value as CanvasToolMode)
    },
    [onChange, setMode],
  )
  return (
    <ToggleGroup
      type="single"
      value={mode}
      onValueChange={select}
      className="canvas-mode-group"
      aria-label={t('Editing mode')}
      style={
        {
          '--mode-index': modes.findIndex((item) => item.id === mode),
        } as CSSProperties
      }
    >
      {modes.map(({ id, label, icon: Icon }) => (
        <ToggleGroupItem
          key={id}
          value={id}
          title={t(label)}
          aria-label={t(label)}
        >
          <Icon size={18} />
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
