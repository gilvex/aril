import { useDesignUsageDetails } from '../model/useDesignUsageDetails.ts'
import { Button } from 'vagabond-ui/button'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function DesignUsageDetails({ model }: DesignEditorProps) {
  const {
    t,
    readOnly,
    kind,
    asset,
    uses,
    dependencies,
    library,
    patch,
    navigate,
    edit,
    insert,
  } = useDesignUsageDetails(model)
  if (!asset)
    return (
      <p className="library-usage-hint">
        {t('Select an asset to see where it is used.')}
      </p>
    )
  return (
    <section className="library-usage-details">
      <h3>{asset.name}</h3>
      <div className="design-library-buttons">
        <Button className="button" size="sm" variant="outline" onClick={edit}>
          {t('Open asset')}
        </Button>
        {kind === 'component' && (
          <Button
            className="button"
            size="sm"
            disabled={readOnly}
            onClick={insert}
          >
            {t('Insert instance')}
          </Button>
        )}
      </div>
      <h4>
        {t('Used in')} · {uses.length}
      </h4>
      {!uses.length && <p>{t('No direct usages')}</p>}
      <ul>
        {uses.map((use, index) => (
          <li key={index}>
            <button onClick={() => navigate(use)}>
              <strong>{use.ownerName}</strong>
              <span>
                {[
                  use.variantId &&
                    library.components[use.ownerId]?.variants[use.variantId]
                      ?.name,
                  use.nodeName,
                  use.stateId,
                  use.transitionId,
                  use.property,
                ]
                  .filter(Boolean)
                  .join(' / ')}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {!!dependencies.length && (
        <>
          <h4>{t('Uses assets')}</h4>
          <ul>
            {[
              ...new Set(
                dependencies.map((u) => `${u.assetKind}:${u.assetId}`),
              ),
            ].map((key) => {
              const use = dependencies.find(
                (u) => `${u.assetKind}:${u.assetId}` === key,
              )!
              const name =
                use.assetKind === 'component'
                  ? library.components[use.assetId]?.name
                  : library.variables[use.assetId]?.name
              return (
                <li key={key}>
                  <button onClick={() => patch({ libraryAsset: key })}>
                    {name || use.assetId}
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </section>
  )
}
