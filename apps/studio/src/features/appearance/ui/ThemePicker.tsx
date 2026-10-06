import { Monitor, Moon, Sun } from 'lucide-react'
import { useThemePreference } from '../../../shared/model/useThemePreference.ts'
import type { ThemePreference } from '../../../shared/types/themePreference.ts'
import { setThemePreference } from '../../../shared/utils/setThemePreference.ts'

export function ThemePicker() {
  const preference = useThemePreference()
  const Icon =
    preference === 'dark' ? Moon : preference === 'light' ? Sun : Monitor
  return (
    <label className="theme-picker">
      <span>
        <Icon size={16} /> Appearance
      </span>
      <select
        aria-label="Appearance"
        value={preference}
        onChange={(event) =>
          setThemePreference(event.target.value as ThemePreference)
        }
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  )
}
