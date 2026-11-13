type P = { size?: number; grad?: boolean }
const base = (size: number) => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true,
})

/* Rail icons, redrawn (designer, 12 Nov: "they look rough and too small"): 24px instead of 20, a finer 1.5 stroke,
   rounder geometry — every corner is an arc, nothing is a hard mitre */
/* `grad`: the selected item is drawn in the blue gradient (defined once in the rail as #c2-rail-active) */
const rail = (size: number, grad?: boolean) => ({ ...base(size), strokeWidth: 1.5, stroke: grad ? 'url(#c2-rail-active)' : 'currentColor' })

export const IHome = ({ size = 24, grad }: P) => (
  <svg {...rail(size, grad)}>
    <path d="M4 10.4 10.5 4.6a2.2 2.2 0 0 1 3 0L20 10.4V18a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18z" />
    <path d="M9.5 20.5V16a2.5 2.5 0 0 1 5 0v4.5" />
  </svg>
)
export const IRequests = ({ size = 24, grad }: P) => (
  <svg {...rail(size, grad)}>
    <path d="M4 13.5 6.2 6.3a2.5 2.5 0 0 1 2.4-1.8h6.8a2.5 2.5 0 0 1 2.4 1.8L20 13.5V17a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17z" />
    <path d="M4 13.5h3.9a1 1 0 0 1 .9.6 3.5 3.5 0 0 0 6.4 0 1 1 0 0 1 .9-.6H20" />
  </svg>
)
export const IDocs = ({ size = 24, grad }: P) => (
  <svg {...rail(size, grad)}>
    <path d="M7.5 3.5h5.4a2.5 2.5 0 0 1 1.8.7l3.6 3.6a2.5 2.5 0 0 1 .7 1.8V18a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 18V6a2.5 2.5 0 0 1 2.5-2.5z" />
    <path d="M13.5 3.8V7.5A1.5 1.5 0 0 0 15 9h3.7" />
    <path d="M8.8 13.5h6.4M8.8 17h3.7" />
  </svg>
)
export const IBell = ({ size = 24, grad }: P) => (
  <svg {...rail(size, grad)}>
    <path d="M12 3.5a6 6 0 0 0-6 6v3.9a3 3 0 0 1-.7 1.9l-.9 1.1a.9.9 0 0 0 .7 1.6h13.8a.9.9 0 0 0 .7-1.6l-.9-1.1a3 3 0 0 1-.7-1.9V9.5a6 6 0 0 0-6-6z" />
    <path d="M9.9 20.5a2.3 2.3 0 0 0 4.2 0" />
  </svg>
)
export const IArrow = ({ size = 16 }: P) => (
  <svg {...base(size)}><path d="M5 12h13M13 7l5 5-5 5" /></svg>
)
export const IReturn = ({ size = 16 }: P) => (
  <svg {...base(size)}><path d="M19 6v5a3 3 0 0 1-3 3H6" /><path d="m10 10-4 4 4 4" /></svg>
)
/** Collapse / expand the rail: a panel with its edge, the chevron pointing the way it will go. */
export const IFold = ({ size = 20 }: P) => (
  <svg {...rail(size, false)}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="3.5" />
    <path d="M9.5 4.5v15" />
  </svg>
)
