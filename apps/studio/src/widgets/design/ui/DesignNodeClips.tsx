import type { DesignFlowNode } from '../types/designFlowNode.ts'
export function DesignNodeClips({ data }: { data: DesignFlowNode['data'] }) {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      className="design-clip-definitions"
    >
      <defs>
        {data.clips.map((shape, index) => (
          <clipPath
            key={index}
            id={`${data.clipId}-${index}`}
            clipPathUnits="userSpaceOnUse"
          >
            {shape.kind === 'ellipse' ? (
              <ellipse
                clipPath={
                  index ? `url(#${data.clipId}-${index - 1})` : undefined
                }
                cx={shape.x + shape.width / 2}
                cy={shape.y + shape.height / 2}
                rx={shape.width / 2}
                ry={shape.height / 2}
              />
            ) : (
              <rect
                clipPath={
                  index ? `url(#${data.clipId}-${index - 1})` : undefined
                }
                x={shape.x}
                y={shape.y}
                width={shape.width}
                height={shape.height}
                rx={shape.radius}
              />
            )}
          </clipPath>
        ))}
      </defs>
    </svg>
  )
}
