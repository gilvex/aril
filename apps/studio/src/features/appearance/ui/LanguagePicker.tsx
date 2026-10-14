import { Check, Globe } from 'lucide-react'
import { DropdownMenu } from 'radix-ui'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useCallback, useRef } from 'react'
import './languagePicker.css'

export function LanguagePicker() {
  const { t, i18n } = useTranslation()
  const trigger = useRef<HTMLButtonElement>(null)
  const pointerInteraction = useRef(false)
  const usePointerFocus = useCallback(() => {
    pointerInteraction.current = true
  }, [])
  const useKeyboardFocus = useCallback(() => {
    pointerInteraction.current = false
    trigger.current?.removeAttribute('data-pointer-focus')
  }, [])
  const clearPointerFocus = useCallback(() => {
    trigger.current?.removeAttribute('data-pointer-focus')
  }, [])
  const restoreFocusAppearance = useCallback(() => {
    if (pointerInteraction.current) {
      trigger.current?.setAttribute('data-pointer-focus', 'true')
    }
  }, [])
  const changeLanguage = useCallback(
    (language: string) => {
      void i18n.changeLanguage(language)
    },
    [i18n],
  )
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          ref={trigger}
          className="language-picker-trigger"
          onPointerDown={usePointerFocus}
          onKeyDown={useKeyboardFocus}
          onBlur={clearPointerFocus}
          aria-label={t('Choose language')}
          title={t('Choose language')}
        >
          <Globe size={20} aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal
        container={(document.fullscreenElement as HTMLElement) || undefined}
      >
        <DropdownMenu.Content
          className="language-picker-menu"
          aria-label={t('Choose language')}
          align="end"
          sideOffset={8}
          collisionPadding={12}
          onPointerDownCapture={usePointerFocus}
          onKeyDownCapture={useKeyboardFocus}
          onCloseAutoFocus={restoreFocusAppearance}
        >
          <DropdownMenu.RadioGroup
            value={i18n.resolvedLanguage || 'en'}
            onValueChange={changeLanguage}
          >
            <DropdownMenu.RadioItem className="language-picker-option" value="en">
              <span lang="en">English</span>
              <DropdownMenu.ItemIndicator>
                <Check size={16} aria-hidden="true" />
              </DropdownMenu.ItemIndicator>
            </DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem className="language-picker-option" value="ru">
              <span lang="ru">Русский</span>
              <DropdownMenu.ItemIndicator>
                <Check size={16} aria-hidden="true" />
              </DropdownMenu.ItemIndicator>
            </DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
