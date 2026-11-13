/** Spark Studios wordmark. Colour follows `color` (Ink on Sand by default, Sand on Ink when needed).
 *  Brand book: never filled with the spectrum. */
export default function Logo({ height = 28, color = 'currentColor', className }: { height?: number; color?: string; className?: string }) {
  const w = Math.round((height * 615.56) / 176.07)
  return (
    <span
      role="img"
      aria-label="Spark Studios"
      className={className}
      style={{
        display: 'inline-block',
        width: w,
        height,
        backgroundColor: color,
        WebkitMask: 'url(concepts/img/logo-ink.svg) center / contain no-repeat',
        mask: 'url(concepts/img/logo-ink.svg) center / contain no-repeat',
      }}
    />
  )
}
