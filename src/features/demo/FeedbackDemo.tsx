// Prototype-only page (#/demo/feedback): the client's feedback of 21 Oct, point by point, with what the
// portal does now and what it will do. Mock-ups only; the real screens change once each point is agreed.
import { useState, type ReactNode } from 'react';
import {
  ArrowRight,
  Bell,
  ChevronDown,
  Coins,
  ExternalLink,
  FileText,
  Folder,
  Globe,
  History,
  Inbox,
  Instagram,
  Linkedin,
  Lock,
  Mail,
  PanelLeftClose,
  PenSquare,
  Settings,
  Upload,
  Users,
} from 'lucide-react';
import { Button, PageHeader, Tabs, cx } from '../../components/ui/primitives';
import { FluidOrb } from '../../components/ui/FluidOrb';

function Item({ n, title, ask, now, next, notes }: { n: number; title: string; ask: string; now: ReactNode; next: ReactNode; notes?: string[] }) {
  return (
    <section className="fbd-item">
      <header className="fbd-item__head">
        <span className="fbd-item__n">{n}</span>
        <div>
          <h2>{title}</h2>
          <p className="fbd-item__ask">{ask}</p>
        </div>
      </header>
      <div className="fbd-item__cols">
        <div>
          <div className="fbd-label">Now</div>
          <div className="fbd-stage">{now}</div>
        </div>
        <div>
          <div className="fbd-label fbd-label--next">Will be</div>
          <div className="fbd-stage">{next}</div>
        </div>
      </div>
      {notes && (
        <ul className="fbd-notes">
          {notes.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ---- 1 · sidebar ------------------------------------------------------------------------------

const NAV = [
  { icon: PenSquare, label: 'New chat' },
  { icon: History, label: 'Chats' },
  { icon: Inbox, label: 'Requests', dot: true },
  { icon: Folder, label: 'Documents' },
];
function Rail({ open }: { open: boolean }) {
  return (
    <div className={cx('fbd-rail', open && 'is-open')}>
      <div className="fbd-rail__logo">
        <span className="fbd-logo" />
        {open && <b>Spark AI</b>}
        {open && <PanelLeftClose size={16} className="fbd-rail__collapse" />}
      </div>
      {NAV.map((x, i) => (
        <div key={x.label} className={cx('fbd-rail__btn', i === 0 && 'is-on')}>
          <span className="fbd-rail__icon">
            <x.icon size={18} />
            {x.dot && <i className="fbd-dot" />}
          </span>
          {open ? <span>{x.label}</span> : i === 0 && <span className="fbd-tip">New chat</span>}
        </div>
      ))}
      <div className="fbd-rail__end">
        <div className="fbd-rail__btn">
          <span className="fbd-rail__icon">
            <Bell size={18} />
          </span>
          {open && <span>Notifications</span>}
        </div>
        <div className="fbd-rail__btn">
          <span className="fbd-rail__icon">
            <Settings size={18} />
          </span>
          {open && <span>Settings</span>}
        </div>
      </div>
    </div>
  );
}

// ---- 2 · intro page ---------------------------------------------------------------------------

function SignInNow() {
  return (
    <div className="fbd-signin">
      <div className="fbd-signin__card">
        <FluidOrb size={40} />
        <b>Sign in</b>
        <span className="faint">to the Brand Co. workspace by Spark</span>
        <div className="fbd-input">
          <Mail size={14} /> layla@brandco.ae
        </div>
        <div className="fbd-btn">Continue</div>
      </div>
    </div>
  );
}
function IntroNext() {
  return (
    <div className="fbd-intro">
      <div className="fbd-intro__left">
        <div className="fbd-mascot">
          <span>Spark mascot</span>
          <small>Final design from Spark this week</small>
        </div>
        <b className="fbd-intro__h">Your marketing team’s AI agent</b>
        <ul>
          <li>Ask anything about your brand, market and audience</li>
          <li>Turn an idea into a request for the Spark team</li>
          <li>All your guidelines and reports in one place</li>
        </ul>
      </div>
      <div className="fbd-intro__right">
        <b>Sign in</b>
        <div className="fbd-input">
          <Mail size={14} /> Work email
        </div>
        <div className="fbd-btn">
          Continue <ArrowRight size={12} />
        </div>
        <small className="faint">We’ll send a sign-in link to your email.</small>
      </div>
    </div>
  );
}

// ---- 3 · credits ------------------------------------------------------------------------------

type Credit = 'plenty' | 'low' | 'out';
const CREDIT: Record<Credit, { amount: string; tone: string; line: string }> = {
  plenty: { amount: 'USD 100.00', tone: 'ok', line: 'Free credits for new companies' },
  low: { amount: 'USD 8.40', tone: 'low', line: 'Running low' },
  out: { amount: 'USD 0.00', tone: 'out', line: 'No credits left' },
};
function TopBarNow() {
  return (
    <div className="fbd-top">
      <span className="fbd-top__team">
        Brand Co. · My team <ChevronDown size={12} />
      </span>
      <span className="fbd-av">LH</span>
    </div>
  );
}
function TopBarNext({ c }: { c: Credit }) {
  const x = CREDIT[c];
  return (
    <div className="fbd-credits">
      <div className="fbd-top">
        <span className={cx('fbd-pill', `fbd-pill--${x.tone}`)}>
          <Coins size={13} /> {x.amount}
        </span>
        <span className="fbd-top__team">
          Brand Co. · My team <ChevronDown size={12} />
        </span>
        <span className="fbd-av">LH</span>
      </div>
      {/* What opens from the credit pill. */}
      <div className="fbd-pop">
        <div className="fbd-pop__head">
          <span className="faint">Company credits</span>
          <b className={cx(`fbd-amount--${x.tone}`)}>{x.amount}</b>
          <span className="faint">{x.line}</span>
        </div>
        <div className="fbd-btn fbd-btn--wide">Request more credits</div>
        <small className="faint">Spark tops up your balance. Or email credits@spark.ae.</small>
      </div>
    </div>
  );
}

// ---- 4 · documents upload ---------------------------------------------------------------------

const FOLDERS = ['Brand guidelines', 'Strategy', 'Proposals', 'Creative', 'Research reports', 'From your team'];
function DocsNow() {
  return (
    <div className="fbd-docs">
      <div className="fbd-docs__head">
        <b>Documents</b>
        <span className="fbd-btn">
          <Upload size={12} /> Upload
        </span>
      </div>
      <div className="fbd-folders">
        {FOLDERS.map((f) => (
          <span key={f} className="fbd-folder">
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}
function DocsNext() {
  return (
    <div className="fbd-docs">
      <div className="fbd-docs__head">
        <b>Documents</b>
      </div>
      <div className="fbd-folders">
        {FOLDERS.map((f) => (
          <span key={f} className={cx('fbd-folder', f === 'From your team' && 'is-team')}>
            {f}
            {f === 'From your team' ? (
              <small>
                <Upload size={10} /> Upload here
              </small>
            ) : (
              <small>
                <Lock size={10} /> From Spark
              </small>
            )}
          </span>
        ))}
      </div>
      <div className="fbd-chatnote">
        <FileText size={13} /> brief.pdf, added in a chat, saved to <b>From your team</b>
      </div>
    </div>
  );
}

// ---- 5 · company profile ----------------------------------------------------------------------

function CompanyNow() {
  return (
    <div className="fbd-empty">
      <Globe size={20} />
      <span>Nowhere to see the company’s basics: website, social accounts, competitors.</span>
    </div>
  );
}
function CompanyNext() {
  return (
    <div className="fbd-company">
      <div className="fbd-company__head">
        <b>Company profile</b>
        <span className="fbd-tag">
          <Lock size={10} /> Kept up to date by Spark
        </span>
      </div>
      <div className="fbd-company__row">
        <Globe size={14} /> brandco.ae <ExternalLink size={11} className="faint" />
      </div>
      <div className="fbd-company__row">
        <Instagram size={14} /> @brandco · <Linkedin size={14} /> Brand Co.
      </div>
      <div className="fbd-company__label">Competitors</div>
      <div className="fbd-chips">
        <span>Home Centre</span>
        <span>Pottery Barn</span>
        <span>Zara Home</span>
      </div>
      <div className="fbd-company__label">Where</div>
      <span className="faint">A card at the top of Documents (and in Settings → Company). Edited by Spark in the Spark portal.</span>
    </div>
  );
}

export function FeedbackDemo() {
  const [credit, setCredit] = useState<Credit>('plenty');
  return (
    <div className="cdemo fbd">
      <PageHeader title="Feedback · 21 Oct" sub="What the client asked for, point by point: what the portal does now and what it will do. Mock-ups to agree on before the screens change." />

      <Item
        n={1}
        title="Sidebar with icons and names"
        ask="Show the icon and the name by default, so people learn what each icon does."
        now={<Rail open={false} />}
        next={<Rail open />}
        notes={['The sidebar opens with labels by default; a button collapses it to icons (remembered per person).', 'Same items and order as today: New chat, Chats, Requests, Documents; Notifications and Settings at the foot.']}
      />

      <Item
        n={2}
        title="Introduction page before sign-in"
        ask="A short introduction to the AI agent and a sign-in form; the Spark mascot joins once its design is ready."
        now={<SignInNow />}
        next={<IntroNext />}
        notes={['Left: the mascot (placeholder until Spark shares the design), one headline, three things the agent does.', 'Right: the same sign-in by email link as today.']}
      />

      <Item
        n={3}
        title="Credit balance and top-ups"
        ask="Show the company’s credits (top right). New companies get USD 100 free. When they run out, they ask Spark for more, in the portal or by email."
        now={<TopBarNow />}
        next={
          <>
            <Tabs
              className="tabs--underline fbd-tabs"
              value={credit}
              onChange={setCredit}
              items={[
                { value: 'plenty', label: 'New company' },
                { value: 'low', label: 'Running low' },
                { value: 'out', label: 'Used up' },
              ]}
            />
            <TopBarNext c={credit} />
          </>
        }
        notes={[
          'The balance sits left of “Brand Co. · My team”; it turns amber when low and red when used up.',
          '“Request more credits” sends a request to Spark (a short form: how much, a note); email works too.',
          'Later, not for launch: credit packages and paying online.',
          'To agree: what counts as “low”, and whether chats stop at zero or only warn.',
        ]}
      />

      <Item
        n={4}
        title="Upload only in “From your team”"
        ask="Uploading only in the From your team folder; files added in a chat are saved there. Other folders are Spark’s, to view only."
        now={<DocsNow />}
        next={<DocsNext />}
        notes={['The Upload button moves from the Documents page into the From your team folder.', 'Spark’s folders show who manages them and have no upload.', 'Files attached in a chat appear in From your team, marked with the chat they came from.']}
      />

      <Item
        n={5}
        title="Company basics"
        ask="A place for the company’s basic information (website, social media, competitors), managed by Spark and visible to the client."
        now={<CompanyNow />}
        next={<CompanyNext />}
        notes={['Read only for the client; Spark edits it in the Spark portal.', 'To agree: anything else to keep there (markets, products, tone of voice)?']}
      />

      <div className="fbd-foot">
        <Button variant="primary" iconRight={ArrowRight}>
          Agree and start
        </Button>
        <span className="faint">
          <Users size={13} /> Mascot: waiting for Spark’s design (this week).
        </span>
      </div>
    </div>
  );
}
