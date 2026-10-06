import {
  Activity,
  Box,
  Check,
  ChevronRight,
  Palette,
  Search,
  ShieldCheck,
  Terminal,
} from 'lucide-react'
import { type CSSProperties } from 'react'
import { createDesignBoardState } from '../model/createDesignBoardState.ts'
import { useDesignBoardModel } from '../model/useDesignBoardModel.ts'
import type { DesignBoardProps } from '../types/designBoardProps.ts'

export function DesignBoard({ design, update }: DesignBoardProps) {
  const { tab, setTab, selected, setSelected } = useDesignBoardModel(() =>
    createDesignBoardState(),
  )

  const colors = ['#b34568', '#7955ad', '#386a92', '#307568', '#9c603a']
  return (
    <div className="content-page design-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">An early direction</div>
          <h1>Calm by design.</h1>
          <p>A space to explore how Pomegranate should feel.</p>
        </div>
        <span className="concept-badge">
          <Palette size={14} />
          Design study
        </span>
      </div>
      <div className="design-intro">
        <h2>
          Comfortable enough for every day.
          <br />
          Capable enough for your whole fleet.
        </h2>
        <p>
          Clear hierarchy. Useful density. Small moments of character.
          <br />
          Inspired by your preference for Juxtopposed’s work.
        </p>
      </div>
      <div className="design-grid">
        <div className="design-settings">
          <section>
            <h3>
              01 <span>Color direction</span>
            </h3>
            <p>See the accent on a real working screen.</p>
            <div className="swatches">
              {colors.map((c) => (
                <button
                  key={c}
                  style={{ background: c }}
                  aria-label={`Use accent ${c}`}
                  onClick={() => update({ ...design, accent: c })}
                >
                  {design.accent === c && <Check size={18} color="white" />}
                </button>
              ))}
            </div>
            <label className="color-picker">
              Custom accent
              <input
                type="color"
                aria-label="Custom accent"
                value={design.accent}
                onChange={(e) => update({ ...design, accent: e.target.value })}
              />
              <code>{design.accent}</code>
            </label>
          </section>
          <section>
            <h3>
              02 <span>Room to breathe</span>
            </h3>
            <div className="segmented">
              {(['Comfortable', 'Compact'] as const).map((d) => (
                <button
                  key={d}
                  className={design.density === d ? 'active' : ''}
                  onClick={() => update({ ...design, density: d })}
                >
                  {d}
                </button>
              ))}
            </div>
            <p>
              Keep dense lists useful without making every screen feel crowded.
            </p>
          </section>
          <section>
            <h3>
              03 <span>Type with purpose</span>
            </h3>
            <div className="type-sample">
              Aa{' '}
              <span>
                Manrope
                <br />
                <small>Headlines & structure</small>
              </span>
            </div>
            <div className="body-sample">
              A familiar place for complex systems.
              <small>DM Sans · Interface & body</small>
            </div>
          </section>
          <label>
            Direction notes
            <textarea
              rows={5}
              value={design.direction}
              maxLength={12000}
              onChange={(e) => update({ ...design, direction: e.target.value })}
            />
          </label>
        </div>
        <div className="preview-area">
          <div className="preview-label">
            <span className="small-dot" />
            Interactive UI study<span>Sample data</span>
          </div>
          <div
            className={`product-preview ${design.density.toLowerCase()}`}
            style={{ '--preview-accent': design.accent } as CSSProperties}
          >
            <div className="preview-top">
              <span className="preview-brand">
                <img src="/mark.svg" alt="" />
                pomegranate
              </span>
              <span className="avatar">JD</span>
            </div>
            <div className="preview-nav">
              My workspace
              <ChevronRight size={12} />
              Weekend servers
            </div>
            <div className="preview-title">
              <div>
                <h2>Weekend servers</h2>
                <p>A little world of your own.</p>
              </div>
              <span className="preview-health">
                <span />
                All systems healthy
              </span>
            </div>
            <div className="preview-tabs">
              {['Services', 'Activity', 'Access'].map((x) => (
                <button
                  key={x}
                  className={tab === x ? 'active' : ''}
                  onClick={() => setTab(x)}
                >
                  {x}
                </button>
              ))}
            </div>
            {tab === 'Services' ? (
              <>
                <div className="preview-list-toolbar">
                  <span>
                    <Search size={14} />
                    Your services
                  </span>
                  <span>
                    {selected.length
                      ? `${selected.length} selected`
                      : '3 services'}
                  </span>
                </div>
                {['Survival · EU', 'Creative · EU', 'Survival · US'].map(
                  (name, index) => (
                    <label key={name} className="preview-service">
                      <input
                        type="checkbox"
                        aria-label={`Select ${name}`}
                        checked={selected.includes(name)}
                        onChange={(e) =>
                          setSelected(
                            e.target.checked
                              ? [...selected, name]
                              : selected.filter((n) => n !== name),
                          )
                        }
                      />
                      <span className="preview-service-icon">
                        <Box size={19} />
                      </span>
                      <span>
                        <strong>{name}</strong>
                        <small>Paper blueprint · v1.2</small>
                      </span>
                      <span className="preview-running">Running</span>
                      <span className="preview-port">
                        :{[25565, 25566, 25565][index]}
                      </span>
                    </label>
                  ),
                )}
                {selected.length > 0 && (
                  <div className="preview-selection">
                    {selected.length} services selected. In the product, batch
                    actions would appear here.
                  </div>
                )}
                <div className="preview-footnote">
                  <Box size={15} />
                  One blueprint. Three places to play.
                </div>
              </>
            ) : tab === 'Activity' ? (
              <div className="preview-events">
                <h3>
                  <Activity size={17} />A history you can rely on
                </h3>
                {[
                  'All 3 instances passed health checks',
                  'Deployment batch completed · 3/3',
                  'Game layer reused from cache',
                  'Blueprint v1.2 published',
                ].map((x, i) => (
                  <div key={x}>
                    <span className="event-bullet" />
                    <span>
                      {x}
                      <small>
                        {i + 1} {i === 0 ? 'minute' : 'minutes'} ago · sample
                        event
                      </small>
                    </span>
                  </div>
                ))}
                <p>
                  <Terminal size={14} />
                  Logs stay here, even after you close the tab.
                </p>
              </div>
            ) : (
              <div className="preview-events">
                <h3>
                  <ShieldCheck size={17} />
                  Access that makes sense
                </h3>
                {[
                  'Alex · Project owner',
                  'Sam · Server operator',
                  'Taylor · Read-only observer',
                ].map((x) => (
                  <div key={x}>
                    <span className="avatar">{x[0]}</span>
                    <span>
                      {x}
                      <small>Access inherited from Weekend servers</small>
                    </span>
                  </div>
                ))}
                <p>This is a visual study, not an active permissions system.</p>
              </div>
            )}
          </div>
          <div className="design-principles">
            <div>
              <span>Legible</span>
              <p>Let structure do the work.</p>
            </div>
            <div>
              <span>Reassuring</span>
              <p>Show outcomes, not mystery.</p>
            </div>
            <div>
              <span>Personal</span>
              <p>Character without the noise.</p>
            </div>
          </div>
          <p className="study-note">
            This board explores the future deployment UI. Nothing here launches
            or changes infrastructure.
          </p>
        </div>
      </div>
    </div>
  )
}
