import { useId } from 'react'

export function LandingWaveField() {
  const id = useId()
  return (
    <svg viewBox="0 0 1600 1100" fill="none" focusable="false">
      <defs>
        <pattern
          id={`${id}-pixels`}
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
        >
          <path fill="#cd6682" d="M0 0h4v4H0z" />
        </pattern>
        <pattern
          id={`${id}-dust`}
          width="16"
          height="16"
          patternUnits="userSpaceOnUse"
        >
          <path fill="#b34568" d="M0 0h2v2H0z" />
        </pattern>
        <radialGradient id={`${id}-fade`}>
          <stop stopColor="white" />
          <stop offset="1" stopColor="black" />
        </radialGradient>
        <mask id={`${id}-edges`}>
          <ellipse
            cx="70"
            cy="430"
            rx="550"
            ry="690"
            fill={`url(#${id}-fade)`}
          />
          <ellipse
            cx="1550"
            cy="400"
            rx="530"
            ry="680"
            fill={`url(#${id}-fade)`}
          />
        </mask>
        <mask
          id={`${id}-ribbons`}
          maskUnits="userSpaceOnUse"
          x="-400"
          y="-400"
          width="2400"
          height="1900"
        >
          <g stroke="white">
            <path
              className="landing-wave landing-wave-left"
              strokeWidth="135"
              d="M-290 810C650 340-320 20 50-140C400-280 620 40 230 200C-160 360 30 540-180 690"
            />
            <path
              className="landing-wave landing-wave-left-trail"
              strokeWidth="18"
              d="M-300 890C820 350-190-50 160-180"
            />
            <path
              className="landing-wave landing-wave-right"
              strokeWidth="160"
              d="M1840-110C1120 0 1660 360 1310 490C1000 610 1300 930 1710 660C2070 420 1610 230 1740 90"
            />
            <path
              className="landing-wave landing-wave-right-trail"
              strokeWidth="22"
              d="M1800-210C960 0 1490 330 1190 470C940 590 1050 980 1670 840"
            />
          </g>
        </mask>
      </defs>
      <g mask={`url(#${id}-edges)`}>
        <path fill={`url(#${id}-dust)`} d="M0 0h1600v1100H0z" />
        <path
          fill={`url(#${id}-pixels)`}
          mask={`url(#${id}-ribbons)`}
          d="M0 0h1600v1100H0z"
        />
      </g>
    </svg>
  )
}
