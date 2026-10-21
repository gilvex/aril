import { Text } from '@/shared/ui/Text.tsx'
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
        <Text as="label">
          <Search size={16} />
          <input
            aria-label={t('Search sample servers')}
            placeholder={t('Search servers…')}
            value={query}
            onChange={(e) => patch({ query: e.target.value })}
          />
        </Text>
        <Text as="span">
          {t('{{count}} selected', { count: selected.length })}
        </Text>
      </div>
      <div className="design-sample-table">
        <div className="design-sample-table-head">
          <Text as="span">{t('Server')}</Text>
          <Text as="span">{t('Status')}</Text>
          <Text as="span">CPU</Text>
          <Text as="span">{t('Memory')}</Text>
        </div>
        {visible.map((server) => (
          <Text
            as="label"
            key={server.name}
            className={
              'design-sample-row ' +
              (selected.includes(server.name) ? 'selected' : '')
            }
          >
            <Text as="span" className="design-sample-server">
              <input
                type="checkbox"
                aria-label={server.name}
                checked={selected.includes(server.name)}
                onChange={() => toggle(server.name)}
              />
              <Box size={19} />
              <Text as="span">
                <Text as="strong">{server.name}</Text>
                <Text as="small">Paper 1.21 · :{server.port}</Text>
              </Text>
            </Text>
            <Text
              as="span"
              className={'design-sample-status ' + server.status.toLowerCase()}
            >
              {t(server.status)}
            </Text>
            <Text as="span" className="design-sample-metric">
              {server.cpu}
            </Text>
            <Text as="span" className="design-sample-metric">
              {server.memory}
            </Text>
          </Text>
        ))}
        {!visible.length && <Text as="p">{t('No matching servers')}</Text>}
      </div>
      {!!selected.length && (
        <div className="design-sample-batch">
          <Text as="span">
            {t('{{count}} selected', { count: selected.length })}
          </Text>
          <button onClick={restart}>
            <RotateCw size={14} />
            <Text>{t('Restart sample')}</Text>
          </button>
          <button onClick={() => setSelected([])}>
            <Text>{t('Clear selection')}</Text>
          </button>
        </div>
      )}
      {notice && (
        <Text as="p" role="status" className="design-sample-notice">
          {notice}
        </Text>
      )}
      <div className="design-sample-recipe">
        <Box size={17} />
        <Text as="span">
          <Text as="strong">{t('Server blueprint')} v1.2</Text>
          <Text as="small">
            {t('Versioned game layer')} → {t('3 instances')}
          </Text>
        </Text>
      </div>
    </>
  )
}
