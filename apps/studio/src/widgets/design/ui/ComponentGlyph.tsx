import type { ComponentGlyphProps } from '../types/componentGlyphProps.ts'
export function ComponentGlyph({ glyph, icon }: ComponentGlyphProps) {
  if (icon?.trim())
    return (
      <span className="component-custom-icon" aria-hidden="true">
        {icon}
      </span>
    )
  return (
    <svg
      className="component-glyph"
      viewBox="0 0 32 32"
      width="28"
      height="28"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      {glyph?.map((shape, i) =>
        shape.kind === 'ellipse' ? (
          <ellipse
            key={i}
            cx={shape.x + shape.width / 2}
            cy={shape.y + shape.height / 2}
            rx={shape.width / 2}
            ry={shape.height / 2}
          />
        ) : shape.kind === 'text' ? (
          <path
            key={i}
            d={`M${shape.x} ${shape.y + shape.height / 2}h${shape.width}`}
            strokeLinecap="round"
          />
        ) : (
          <rect
            key={i}
            x={shape.x}
            y={shape.y}
            width={shape.width}
            height={shape.height}
            rx={shape.radius}
          />
        ),
      )}
    </svg>
  )
}
