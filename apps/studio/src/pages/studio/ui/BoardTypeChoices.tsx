import { Text } from '@/shared/ui/Text.tsx'
import { useCallback, type ChangeEvent } from 'react'
import { Workflow, PenTool, Check } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { BoardTypeChoicesProps } from '../types/boardTypeChoicesProps.ts'
import './boardTypeChoices.css'

export function BoardTypeChoices({
  newBoardType,
  setNewBoardType,
}: BoardTypeChoicesProps) {
  const { t } = useTranslation()
  const choose = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setNewBoardType(event.target.value as typeof newBoardType)
    },
    [setNewBoardType],
  )
  const choices = [
    {
      value: 'canvas',
      title: 'Blueprint',
      description: 'Map systems and flows',
      Icon: Workflow,
    },
    {
      value: 'design',
      title: 'Design',
      description: 'Build detailed interfaces',
      Icon: PenTool,
    },
  ] as const
  return (
    <fieldset className="board-type-choices">
      <Text as="legend">{t('Start with')}</Text>
      <div className="board-type-grid">
        {choices.map(({ value, title, description, Icon }) => (
          <Text as="label" className="board-type-card" key={value}>
            <input
              type="radio"
              name="boardType"
              value={value}
              checked={newBoardType === value}
              onChange={choose}
            />
            <Text as="span" className="board-type-visual">
              <Icon size={28} strokeWidth={1.5} />
              <Check className="board-type-check" size={14} />
            </Text>
            <Text as="strong">{t(title)}</Text>
            <Text as="small">{t(description)}</Text>
          </Text>
        ))}
      </div>
    </fieldset>
  )
}
