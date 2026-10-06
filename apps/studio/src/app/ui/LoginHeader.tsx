import { LanguagePicker, ThemePicker } from '@/features/appearance/index.ts'

export function LoginHeader() {
  return (
    <header className="login-header">
      <div className="login-brand">
        <img src="/mark.svg" alt="" />
        <span>pomegranate</span>
      </div>
      <div className="login-preferences">
        <LanguagePicker />
        <ThemePicker />
      </div>
    </header>
  )
}
