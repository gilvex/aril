import { Text } from '@/shared/ui/Text.tsx'
import { Popover } from 'radix-ui'
import { ChevronDown } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { nodeIconOptions } from '../config/nodeIconOptions.ts'
import { kindIcons } from '../config/kindIcons.ts'
import { useIconPickerModel } from '../model/useIconPickerModel.ts'
import type { BlueprintIconPickerProps } from '../types/blueprintIconPickerProps.ts'
import { IconLibrary } from './IconLibrary.tsx'
import './iconLibrary.css'
export function BlueprintIconPicker(props: BlueprintIconPickerProps) {
  const { node, readOnly } = props
  const { t } = useTranslation()
  const model = useIconPickerModel()
  const option = node.data.icon ? nodeIconOptions[node.data.icon] : undefined
  const Icon = option?.icon || kindIcons[node.data.kind]
  return (
    <div className="blueprint-icon-picker">
      <Text as="span">{t('Icon')}</Text>
      <Popover.Root open={model.open && !readOnly} onOpenChange={model.setOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            className="icon-library-trigger"
            aria-label={t('Node icon')}
            disabled={readOnly}
          >
            <Icon size={20} aria-hidden="true" />
            <Text as="span">{t(option?.label || 'Default icon')}</Text>
            <ChevronDown size={14} aria-hidden="true" />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <IconLibrary {...props} model={model} />
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
}
