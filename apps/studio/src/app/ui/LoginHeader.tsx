import { LanguagePicker, ThemePicker } from '@/features/appearance/index.ts'

export function LoginHeader() {
  return (
    <header className="login-header">
      <div className="login-brand">
        <img src="/aril.svg" alt="" />
        <span>aril</span>
      </div>
      <div className="login-preferences">
        <LanguagePicker />
        <ThemePicker />
      </div>
    </header>
  )
}
