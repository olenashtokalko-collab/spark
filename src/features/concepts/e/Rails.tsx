import Logo from '../shared/Logo'
import Mascot, { type MascotState } from '../shared/Mascot'
import { user, notifications, drai } from '../shared/data'
import { useRequests } from '../shared/requests'
import r from './rails.module.css'

/*
 * Variant E's sidebar — "Glow" (picked by the designer, 12 Nov, without the workspace switcher):
 * light glass, the glass Spark app icon + wordmark, counts instead of dots, and Dr.AI living at the
 * bottom of the rail on the one spectral glow. 4px grid, brand fonts. Phones use the compact top bar in Home.tsx.
 */


type Props = { collapsed: boolean; onToggle: () => void; onAsk: () => void; mascot: MascotState }

/** Figma's 18px icon drawn as a mask, so it takes the text colour (the active one turns Ember). */
const Ico = ({ src }: { src: string }) => (
  <span className={r.ico} aria-hidden>
    <span className={r.icoGlyph} style={{ WebkitMaskImage: `url(${src})`, maskImage: `url(${src})` }} />
  </span>
)

function Toggle({ collapsed, onToggle }: Pick<Props, 'collapsed' | 'onToggle'>) {
  return (
    <button className={r.toggle} onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
      <span className={`${r.toggleGlyph} ${collapsed ? r.flip : ''}`}>
        <img src="concepts/ve/toggle-a.svg" alt="" className={r.tA} />
        <img src="concepts/ve/toggle-b.svg" alt="" className={r.tB} />
        <img src="concepts/ve/toggle-c.svg" alt="" className={r.tC} />
      </span>
    </button>
  )
}

/** Requests that wait on the user (proposal ready or in discussion). */
function useNeedsYou() {
  const list = useRequests()
  return list.filter(x => x.state !== 'sent').length
}

function NavItems({ cls }: { cls: Record<string, string> }) {
  const needs = useNeedsYou()
  return (
    <div className={cls.nav}>
      <a href="#e" className={`${cls.item} ${cls.itemOn}`} aria-current="page">
        <Ico src="concepts/ve/i-home.svg" /><span className={cls.text}>Home</span>
      </a>
      <a href="#e" className={cls.item}>
        <Ico src="concepts/ve/i-requests.svg" /><span className={cls.text}>Requests</span>
        {needs > 0 && <b className={cls.count}>{needs}</b>}
      </a>
      <a href="#e" className={cls.item}>
        <Ico src="concepts/ve/i-docs.svg" /><span className={cls.text}>Documents</span>
        <i className={cls.new} aria-label="new" />
      </a>
    </div>
  )
}

/* ───────────── Glow ───────────── */
export function RailGlow({ collapsed, onToggle, onAsk, mascot }: Props) {
  return (
    <nav className={`${r.glow} ${collapsed ? r.collapsed : ''}`} aria-label="Main">
      <span className={r.glowLight} aria-hidden />

      <div className={r.head}>
        <a href="#e" className={r.brand} aria-label="Spark Studios home">
          {/* collapsed only */}
          <img src="concepts/img/spark-icon.webp" width={40} height={40} alt="" className={r.appIcon} />
          {/* expanded only; a little larger now that it stands alone */}
          <Logo height={24} className={r.text} />
        </a>
        <Toggle collapsed={collapsed} onToggle={onToggle} />
      </div>

      <span className={`${r.section} ${r.text}`}>Menu</span>
      <NavItems cls={r} />

      <div className={r.spacer} />

      <div className={r.drai}>
        <button className={r.draiFig} onClick={onAsk} aria-label="Ask Dr.AI">
          <Mascot state={mascot} talk="short" size={collapsed ? 56 : 128} />
        </button>
        <div className={`${r.draiText} ${r.text}`}>
          <span className={r.draiName}>{drai.name}</span>
          <span className={r.draiLine}>Knows your reports and your brand.</span>
        </div>
        <button className={`${r.draiBtn} ${r.text}`} onClick={onAsk}>Ask Dr.AI</button>
      </div>

      <div className={r.foot}>
        <span className={r.avatar}>{user.initials}</span>
        <span className={`${r.footText} ${r.text}`}>
          <span className={r.footName}>{user.name}</span>
          <span className={r.footSub}>{user.role}</span>
        </span>
        <button className={`${r.bell} ${r.text}`} aria-label={`Notifications, ${notifications} unread`}>
          <Ico src="concepts/ve/i-bell.svg" />
          <b className={r.bellCount}>{notifications}</b>
        </button>
      </div>
    </nav>
  )
}
