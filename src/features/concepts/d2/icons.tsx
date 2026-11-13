// Small line icons for the glass dock and controls. 20px, stroke follows currentColor.
type P = { size?: number }
const base = (size = 20) => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true,
})

export const IconHome = ({ size }: P) => (
  <svg {...base(size)}><path d="M4 11.5 12 5l8 6.5" /><path d="M6.5 10v8.5h11V10" /><path d="M10 18.5v-4h4v4" /></svg>
)
export const IconRequests = ({ size }: P) => (
  <svg {...base(size)}><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M12 8v8M8 12h8" /></svg>
)
export const IconDocs = ({ size }: P) => (
  <svg {...base(size)}><path d="M7 3.5h6.5L18 8v12.5H7z" /><path d="M13 3.5V8h5" /><path d="M10 13h5M10 16.5h5" /></svg>
)
export const IconBell = ({ size }: P) => (
  <svg {...base(size)}><path d="M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 1.5H5z" /><path d="M10 20.5h4" /></svg>
)
export const IconStar = ({ size }: P) => (
  <svg {...base(size)} fill="currentColor" stroke="none"><path d="M12 2.5c.5 4.9 4.6 9 9.5 9.5-4.9.5-9 4.6-9.5 9.5-.5-4.9-4.6-9-9.5-9.5 4.9-.5 9-4.6 9.5-9.5z" /></svg>
)
export const IconLeft = ({ size }: P) => (
  <svg {...base(size)}><path d="M14.5 6 8.5 12l6 6" /></svg>
)
export const IconRight = ({ size }: P) => (
  <svg {...base(size)}><path d="m9.5 6 6 6-6 6" /></svg>
)
export const IconDown = ({ size }: P) => (
  <svg {...base(size)}><path d="m6 9.5 6 6 6-6" /></svg>
)
export const IconSend = ({ size }: P) => (
  <svg {...base(size)}><path d="M5 12h13M13 7l5 5-5 5" /></svg>
)
export const IconClose = ({ size }: P) => (
  <svg {...base(size)}><path d="M7 7l10 10M17 7 7 17" /></svg>
)
export const IconCheck = ({ size }: P) => (
  <svg {...base(size)}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
)
export const IconReports = ({ size }: P) => (
  <svg {...base(size)}><path d="M5 19.5h14" /><path d="M8 16v-4M12 16V7M16 16v-6" /></svg>
)
export const IconPlus = ({ size }: P) => (
  <svg {...base(size)}><path d="M12 6v12M6 12h12" /></svg>
)
