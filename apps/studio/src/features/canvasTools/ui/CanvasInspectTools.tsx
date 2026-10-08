import { useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Scan, CodeXml, Download } from 'lucide-react'
import { StudioActionButton } from '@/shared/ui/index.tsx'
import { StudioModal } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useCanvasTools } from '../model/useCanvasTools.ts'
import { downloadCanvasData } from '../utils/downloadCanvasData.ts'
export function CanvasInspectTools({
  data,
  inspect,
}: {
  data: unknown
  inspect: () => void
}) {
  const { t } = useTranslation()
  const { dataOpen, patch } = useCanvasTools()
  const close = useCallback(() => patch({ dataOpen: false }), [patch])
  const download = useCallback(() => downloadCanvasData(data), [data])
  return (
    <>
      <StudioActionButton
        title={t('Inspect')}
        aria-label={t('Inspect')}
        onClick={inspect}
      >
        <Scan size={18} />
      </StudioActionButton>
      <StudioActionButton
        title={t('View canvas data')}
        aria-label={t('View canvas data')}
        onClick={() => patch({ dataOpen: true })}
      >
        <CodeXml size={18} />
      </StudioActionButton>
      <StudioActionButton
        title={t('Export canvas JSON')}
        aria-label={t('Export canvas JSON')}
        onClick={download}
      >
        <Download size={18} />
      </StudioActionButton>
      {dataOpen &&
        createPortal(
          <StudioModal title={t('View canvas data')} close={close}>
            <h2 id="modal-title">{t('View canvas data')}</h2>
            <pre className="canvas-inspect-data">
              {JSON.stringify(data, null, 2)}
            </pre>
          </StudioModal>,
          document.fullscreenElement || document.body,
        )}
    </>
  )
}
