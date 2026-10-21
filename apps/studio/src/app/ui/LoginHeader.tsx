import { Text } from '@/shared/ui/Text.tsx'
import { getProductBranding } from '@/shared/deploymentSettings/index.ts'
import { ProductLogo } from '@/shared/ui/index.tsx'
import { LanguagePicker, ThemePicker } from '@/features/appearance/index.ts'

export function LoginHeader() {
  return (
    <header className="login-header">
      <div className="login-brand" title={getProductBranding().productName}>
        <ProductLogo />
        <Text as="span">{getProductBranding().productName}</Text>
      </div>
      <div className="login-preferences">
        <LanguagePicker />
        <ThemePicker />
      </div>
    </header>
  )
}
