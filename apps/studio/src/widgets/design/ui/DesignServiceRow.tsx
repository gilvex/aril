import { Box } from 'lucide-react'
import { useDesignServiceRowHandlers } from '../model/useDesignServiceRowHandlers.tsx'

import type { DesignServiceRowProps } from '../types/designServiceRowProps.ts'
export function DesignServiceRow({
  name,
  selected,
  setSelected,
  t,
  index,
}: DesignServiceRowProps) {
  const { handleChange } = useDesignServiceRowHandlers({
    setSelected,
    selected,
    name,
  })
  return (
    <label key={name} className="preview-service">
      <input
        type="checkbox"
        aria-label={t('Select {{name}}', { name: name })}
        checked={selected.includes(name)}
        onChange={handleChange}
      />
      <span className="preview-service-icon">
        <Box size={19} />
      </span>
      <span>
        <strong>{name}</strong>
        <small>{t('Paper blueprint · v1.2')}</small>
      </span>
      <span className="preview-running">{t('Running')}</span>
      <span className="preview-port">:{[25565, 25566, 25565][index]}</span>
    </label>
  )
}
