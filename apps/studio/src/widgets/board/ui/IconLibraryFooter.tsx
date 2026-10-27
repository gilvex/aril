import { Text } from '@/shared/ui/Text.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { kindIcons } from '../config/kindIcons.ts'
import { IconLibraryOption } from './IconLibraryOption.tsx'
import type { IconLibraryFooterProps } from '../types/iconLibraryFooterProps.ts'
export function IconLibraryFooter({
  node,
  count,
  choose,
}: IconLibraryFooterProps) {
  const { t } = useTranslation()
  return (
    <footer className="icon-library-footer">
      <IconLibraryOption
        id={undefined}
        label={t('Default icon')}
        icon={kindIcons[node.data.kind]}
        selected={!node.data.icon}
        size={20}
        choose={choose}
      />
      <Text aria-live="polite">{t('iconResultCount', { count })}</Text>
    </footer>
  )
}
