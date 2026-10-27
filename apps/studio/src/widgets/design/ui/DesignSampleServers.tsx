import { useTranslation } from '@/shared/i18n/index.ts'
import { Search, Box, RotateCw } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import type { DesignPreviewProps } from '../types/designPreviewProps.ts'
const servers = [
  {
    name: 'Survival · EU',
    port: 25565,
    cpu: '24%',
    memory: '2.1 / 4 GB',
    status: 'Running',
  },
  {
    name: 'Creative · EU',
    port: 25566,
    cpu: '12%',
    memory: '1.3 / 4 GB',
    status: 'Running',
  },
  {
    name: 'Survival · US',
    port: 25567,
    cpu: '—',
    memory: '0 / 4 GB',
    status: 'Stopped',
  },
]
export function DesignSampleServers({
  selected,
  setSelected,
  query,
  patch,
  notice,
}: DesignPreviewProps) {
  const { t } = useTranslation()
  const visible = useMemo(
    () =>
      servers.filter((server) =>
        server.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  )
  const toggle = useCallback(
    (name: string) =>
      setSelected((values) =>
        values.includes(name)
          ? values.filter((value) => value !== name)
          : [...values, name],
      ),
    [setSelected],
  )
  const restart = useCallback(
    () =>
      patch({
        notice: t('Sample restart completed for {{count}} servers.', {
          count: selected.length,
        }),
      }),
    [patch, selected.length, t],
  )
  return (
    <>
      <div className="design-sample-tools">
        <label>
          <Search size={16} />
          <input
            aria-label={t('Search sample servers')}
            placeholder={t('Search servers…')}
            value={query}
            onChange={(e) => patch({ query: e.target.value })}
          />
        </label>
        <span>{t('{{count}} selected', { count: selected.length })}</span>
      </div>
      <div className="design-sample-table">
        <div className="design-sample-table-head">
          <span>{t('Server')}</span>
          <span>{t('Status')}</span>
          <span>CPU</span>
          <span>{t('Memory')}</span>
        </div>
        {visible.map((server) => (
          <label
            key={server.name}
            className={
              'design-sample-row ' +
              (selected.includes(server.name) ? 'selected' : '')
            }
          >
            <span className="design-sample-server">
              <input
                type="checkbox"
                aria-label={server.name}
                checked={selected.includes(server.name)}
                onChange={() => toggle(server.name)}
              />
              <Box size={19} />
              <span>
                <strong>{server.name}</strong>
                <small>Paper 1.21 · :{server.port}</small>
              </span>
            </span>
            <span
              className={'design-sample-status ' + server.status.toLowerCase()}
            >
              {t(server.status)}
            </span>
            <span className="design-sample-metric">{server.cpu}</span>
            <span className="design-sample-metric">{server.memory}</span>
          </label>
        ))}
        {!visible.length && <p>{t('No matching servers')}</p>}
      </div>
      {!!selected.length && (
        <div className="design-sample-batch">
          <span>{t('{{count}} selected', { count: selected.length })}</span>
          <button onClick={restart}>
            <RotateCw size={14} />
            {t('Restart sample')}
          </button>
          <button onClick={() => setSelected([])}>
            {t('Clear selection')}
          </button>
        </div>
      )}
      {notice && (
        <p role="status" className="design-sample-notice">
          {notice}
        </p>
      )}
      <div className="design-sample-recipe">
        <Box size={17} />
        <span>
          <strong>{t('Server blueprint')} v1.2</strong>
          <small>
            {t('Versioned game layer')} → {t('3 instances')}
          </small>
        </span>
      </div>
    </>
  )
}
