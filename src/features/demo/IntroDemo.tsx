// Prototype-only page (#/demo/intro): the introduction page before sign-in (feedback of 21 Oct, point 2).
// Agreed with the client: new companies can sign up themselves ("Get started"), the mascot is a still
// picture, sign-in by password or by an email link, English only. Three layouts share one form.
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowRight, CheckCircle2, Lock, Mail, MessageSquare, Send, Building2, UserRound, MailCheck, Eye, EyeOff, X } from 'lucide-react';
import { AvatarStack, Button, Checkbox, Field, Input, PageHeader, cx } from '../../components/ui/primitives';
import { useStore } from '../../state/store';
import { useRoute } from '../../lib/router';

type Variant = 'split' | 'centred' | 'example' | 'panel' | 'night' | 'photo' | 'glass' | 'ember' | 'soft' | 'smart' | 'hero' | 'ember-ex' | 'ember-c' | 'haze' | 'typing';
type Mode = 'signin' | 'signup' | 'sent';

const VARIANTS: { v: Variant; label: string; note: string }[] = [
  { v: 'split', label: 'A · Split', note: 'Left: the mascot, one headline and three things the agent does. Right: the form. The plainest version of the brief.' },
  { v: 'centred', label: 'B · Centred', note: 'One column: the mascot greets you above the form; the three points sit in a quiet row underneath. Feels lightest for people who come back to sign in.' },
  { v: 'example', label: 'C · With an example', note: 'Shows the product instead of describing it: a question, Spark’s answer with sources and the step to the Spark team. Form on the right.' },
  { v: 'panel', label: 'D · Form and picture', note: 'After the reference: the form alone in the middle of the white side, a large title and fields without labels; a picture from the brand book fills the panel on the right until the mascot is ready (pick one below). Terms at the foot.' },
  { v: 'typing', label: 'O · Agent typing', note: 'After the reference: on a colourful panel the agent “types” what it does in the portal, one line at a time, with the mascot’s place above it; the form on white on the right. Pick the panel’s colour below.' },
  { v: 'haze', label: 'N · D on Noor haze', note: 'D on the brand book’s Noor haze (the grainy Cobalt-to-Ember ground behind the glass hood, p. 34): the form on a frosted card, the visor portrait (p. 40) on the right.' },
  { v: 'night', label: 'E · Night', note: 'After the dark reference: Sand on Ink (the brand’s night version). Log in / Sign up as a switch; on the right the glass robot from the brand book (p. 8) with the brand line on a frosted caption.' },
  { v: 'photo', label: 'F · Photo', note: 'Light, on Sand: the form on the left with the Log in / Sign up switch; on the right the Cybernoor hand from the brand book (p. 25), the idea of the brand in one picture, with its line on frosted glass.' },
  { v: 'glass', label: 'G · Glass', note: 'The brand’s material, frosted light (p. 33), fills the page; the form sits on a frosted glass card.' },
  { v: 'ember', label: 'H · Ember', note: 'After the dark red reference: the visor portrait from the Campaign page (p. 40) with the line on top and the Spark team at the foot; the form over soft Ember rings, the spark in a glowing orb. Ember carries the action.' },
  { v: 'ember-ex', label: 'L · H + C', note: 'H’s night and the visor portrait; on the portrait, C’s example of the agent at work: a question, the answer with sources and the step to the Spark team. Form over Ember rings on the right.' },
  { v: 'ember-c', label: 'M · H + B', note: 'B’s single column at night: the visor portrait in place of the mascot, Ember rings around it, the form on a dark glass card and the three points in a row underneath.' },
  { v: 'soft', label: 'I · Soft card', note: 'After the soft-card reference: a Noor haze behind one white card. A pale left pane with the line and a faded spark; Get started open on the right.' },
  { v: 'smart', label: 'J · Picture and team', note: 'After the “Smart AI” reference: one frosted frame over a Noor haze. Left, the helmet from the Campaign page (p. 40) and the line on frosted glass, second line in Cobalt as in the brand book; right, the form card on white fields and, under it, the Spark team who answer every request.' },
  { v: 'hero', label: 'K · Product hero', note: 'After the hero reference: the page opens like a product page, a headline with a Noor underline and a framed preview of the agent at work. Get started and Sign in open the form on a glass card.' },
];

const HEADLINE = 'Your brand’s AI agent, backed by the Spark team';
const SUB = 'Ask about your market and audience, turn answers into work, and approve it all in one place.';
const POINTS = [
  { icon: MessageSquare, title: 'Ask about your brand', body: 'Market, audience and what people say, with sources.' },
  { icon: Send, title: 'Turn an answer into work', body: 'One click sends it to the Spark team for a proposal.' },
  { icon: CheckCircle2, title: 'Approve in one place', body: 'Proposals, files and guidelines in your workspace.' },
];

/** The mascot is a still picture; until Spark shares the art, a placeholder of the same size. */
function Mascot({ size = 120 }: { size?: number }) {
  return (
    <div className="itd-mascot" style={{ width: size, height: size }}>
      <span>Mascot</span>
    </div>
  );
}

function Points({ row, compact }: { row?: boolean; compact?: boolean }) {
  return (
    <ul className={cx('itd-points', row && 'itd-points--row', compact && 'itd-points--compact')}>
      {POINTS.map(({ icon: I, title, body }) => (
        <li key={title}>
          <span className="itd-points__icon">
            <I size={16} strokeWidth={1.8} />
          </span>
          <span>
            <b>{title}</b>
            <span>{body}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** The three things the agent does as one quiet row of chips, under the form's line. */
function Chips() {
  return (
    <div className="itd-chips">
      {POINTS.map(({ icon: I, title }, n) => (
        <span key={title} className={`itd-chips__c${n + 1}`}>
          <I size={15} strokeWidth={2} /> {title}
        </span>
      ))}
    </div>
  );
}

/** Password with a show/hide eye, as in the reference. */
function PasswordInput({ id, bare }: { id: string; bare?: boolean }) {
  const [shown, setShown] = useState(false);
  return (
    <span className="itd-pw">
      <Input id={id} type={shown ? 'text' : 'password'} icon={bare ? undefined : Lock} placeholder={bare ? 'Password' : undefined} aria-label={bare ? 'Password' : undefined} />
      <button type="button" className="itd-pw__eye" onClick={() => setShown((v) => !v)} aria-label={shown ? 'Hide password' : 'Show password'}>
        {shown ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </span>
  );
}

/** A labelled field; in the bare form (D) the label moves into the placeholder. */
function F({ bare, label, id, hint, children }: { bare?: boolean; label: string; id: string; hint?: string; children: ReactNode }) {
  if (bare) return <>{children}</>;
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      {children}
    </Field>
  );
}

/** Sign in (password, or a sign-in link by email) and Get started (new company), one card.
 *  `bare`: the reference's look (D): centred titles, no labels, placeholders only.
 *  `tabs`: a Log in / Sign up switch under the title instead of the link at the foot (E–G). */
function AuthForm({ bare, tabs, initial = 'signin', remember, welcome, lean, chips, greeting }: { bare?: boolean; tabs?: boolean; initial?: Mode; remember?: boolean; welcome?: boolean; lean?: boolean; chips?: boolean; greeting?: string }) {
  // The friendlier titles of the bare form, also wanted with labelled fields (H, J).
  const warm = bare || welcome;
  const [mode, setMode] = useState<Mode>(initial);
  const [email, setEmail] = useState('');
  const [keep, setKeep] = useState(true);
  const stop = (e: FormEvent) => e.preventDefault();
  const ph = (label: string, plain: string) => (bare ? { placeholder: label, 'aria-label': label } : { placeholder: plain });
  const icon = <T,>(i: T) => (bare ? undefined : i);
  const switcher = tabs && (
    <div className="itd-tabs" role="tablist" aria-label="Sign in or sign up">
      {(
        [
          ['signin', 'Log in'],
          ['signup', 'Sign up'],
        ] as const
      ).map(([m, label]) => (
        <button key={m} type="button" role="tab" aria-selected={mode === m} className={cx(mode === m && 'is-on')} onClick={() => setMode(m)}>
          {label}
        </button>
      ))}
    </div>
  );

  if (mode === 'sent')
    return (
      <div className={cx('itd-form', 'itd-form--sent', bare && 'itd-form--bare')}>
        <span className="itd-sent__icon">
          <MailCheck size={20} />
        </span>
        <h2 className="itd-form__title">Check your email</h2>
        <p className="itd-form__sub">We sent a sign-in link to {email || 'your work email'}. It works for 15 minutes.</p>
        <button className="link-btn" onClick={() => setMode('signin')}>
          Use a password instead
        </button>
      </div>
    );

  if (mode === 'signup')
    return (
      <form className={cx('itd-form', bare && 'itd-form--bare', welcome && 'itd-form--welcome', lean && 'itd-form--lean', chips && 'itd-form--chips')} onSubmit={stop} noValidate>
        <h2 className="itd-form__title">{warm ? 'Meet your brand’s AI agent' : 'Get started'}</h2>
        <p className="itd-form__sub">{bare ? 'Set up a workspace for your company. New companies start with USD 100 in credits.' : 'Set up a workspace for your company. New companies start with USD 100 in credits.'}</p>
        {chips && <Chips />}
        {switcher}
        <F bare={bare} label="Full name" id="itd-name">
          <Input id="itd-name" icon={icon(UserRound)} {...ph('Full name', 'Layla Haddad')} />
        </F>
        <F bare={bare} label="Work email" id="itd-su-email">
          <Input id="itd-su-email" type="email" icon={icon(Mail)} {...ph('Work email', 'name@company.com')} value={email} onChange={(e) => setEmail(e.target.value)} />
        </F>
        <F bare={bare} label="Company" id="itd-co">
          <Input id="itd-co" icon={icon(Building2)} {...ph('Company', 'Brand Co.')} />
        </F>
        <F bare={bare} label="Password" id="itd-su-pw" hint="At least 8 characters.">
          <PasswordInput id="itd-su-pw" bare={bare} />
        </F>
        <Button type="submit" variant="primary" iconRight={bare ? undefined : ArrowRight}>
          Create workspace
        </Button>
        <p className="itd-form__switch" hidden={tabs}>
          Already have an account?{' '}
          <button type="button" className="link-btn" onClick={() => setMode('signin')}>
            Sign in
          </button>
        </p>
      </form>
    );

  return (
    <form className={cx('itd-form', bare && 'itd-form--bare', welcome && 'itd-form--welcome', lean && 'itd-form--lean', chips && 'itd-form--chips')} onSubmit={stop} noValidate>
      <h2 className="itd-form__title">{greeting ?? (bare ? 'Welcome back to Spark' : welcome ? 'Welcome back' : 'Sign in')}</h2>
      <p className="itd-form__sub">{warm ? 'Sign in to your brand’s AI agent.' : 'Welcome back. Sign in to your workspace.'}</p>
      {chips && <Chips />}
      {switcher}
      <F bare={bare} label="Work email" id="itd-email">
        <Input id="itd-email" type="email" icon={icon(Mail)} {...ph('Work email', 'name@company.com')} value={email} onChange={(e) => setEmail(e.target.value)} />
      </F>
      <F bare={bare} label="Password" id="itd-pw">
        <PasswordInput id="itd-pw" bare={bare} />
      </F>
      {remember ? (
        <div className="itd-form__row">
          <Checkbox checked={keep} onChange={setKeep}>
            Remember me for 30 days
          </Checkbox>
          <button type="button" className="link-btn">
            Forgot password?
          </button>
        </div>
      ) : (
        !lean && (
          <button type="button" className="link-btn itd-form__forgot">
            Forgot password?
          </button>
        )
      )}
      <Button type="submit" variant="primary">
        Sign in
      </Button>
      {/* The lean form (D, glass hood): just email, password and Sign in. */}
      {!lean && (
        <>
          <div className="itd-or">
            <span>or</span>
          </div>
          <Button type="button" variant="secondary" icon={Mail} onClick={() => setMode('sent')}>
            Email me a sign-in link
          </Button>
        </>
      )}
      <p className="itd-form__switch" hidden={tabs || lean}>
        New to Spark?{' '}
        <button type="button" className="link-btn" onClick={() => setMode('signup')}>
          Get started
        </button>
      </p>
    </form>
  );
}

function Logo() {
  return (
    <div className="itd-logo">
      <img src="/brand/spark-app-icon.jpg" alt="" width={28} height={28} />
      Spark
    </div>
  );
}

function Split() {
  return (
    <div className="itd itd--split">
      <section className="itd__intro">
        <Logo />
        <div className="itd__intro-body">
          <Mascot />
          <h1 className="itd__h">{HEADLINE}</h1>
          <p className="itd__sub">{SUB}</p>
          <Points />
        </div>
      </section>
      <section className="itd__auth">
        <AuthForm />
      </section>
    </div>
  );
}

function Centred() {
  return (
    <div className="itd itd--centred">
      <Logo />
      <div className="itd__col">
        <Mascot size={96} />
        <h1 className="itd__h">{HEADLINE}</h1>
        <div className="itd__card">
          <AuthForm />
        </div>
        <Points row />
      </div>
    </div>
  );
}

/** The example from C: a question, Spark's answer with sources and the step to the Spark team. */
function ChatThread() {
  return (
    <div className="itd-chat__thread">
      <div className="itd-chat__q">How is our Riyadh launch being talked about?</div>
      <div className="itd-chat__a">
        Mostly positive: people like the store design and the opening offer <sup>1</sup>. The main complaint is delivery times outside the city <sup>2</sup>.
        <div className="itd-chat__src">
          <span>1 · instagram.com</span>
          <span>2 · Brand audit, Sep</span>
        </div>
      </div>
      <div className="itd-chat__cta">
        <Send size={13} /> Request a proposal from Spark
      </div>
    </div>
  );
}

function Example() {
  return (
    <div className="itd itd--split itd--example">
      <section className="itd__intro">
        <Logo />
        <div className="itd__intro-body">
          <h1 className="itd__h">{HEADLINE}</h1>
          <div className="itd-chat">
            <Mascot size={56} />
            <ChatThread />
          </div>
          <p className="itd__sub">{SUB}</p>
        </div>
      </section>
      <section className="itd__auth">
        <AuthForm />
      </section>
    </div>
  );
}

// D's picture, until Spark shares the mascot: any of these from the brand book.
const PANEL_PICS = [
  { key: 'robot', src: '/brand/intro/robot.jpg', label: 'Robot with a flower (p. 8)', pos: '40% 30%' },
  { key: 'hijab', src: '/brand/intro/hijab.jpg', label: 'Woman in the light (p. 34)', pos: '55% 40%' },
  { key: 'emirati', src: '/brand/intro/emirati.jpg', label: 'Man in the light (p. 34)', pos: '50% 40%' },
  { key: 'goggles', src: '/brand/intro/goggles.jpg', label: 'Goggles (p. 34)', pos: '50% 30%' },
  { key: 'glasshead', src: '/brand/intro/glasshead.jpg', label: 'Glass hood (p. 34)', pos: '55% 40%', points: true },
  { key: 'cables', src: '/brand/intro/cables.jpg', label: 'Halo and cables (p. 34)', pos: '50% 30%' },
  { key: 'heart', src: '/brand/intro/heart.jpg', label: 'Glass heart (p. 34)', pos: '50% 50%' },
  { key: 'glasshelmet', src: '/brand/intro/glasshelmet.jpg', label: 'Glass helmet (p. 34)', pos: '60% 40%' },
  { key: 'hooded', src: '/brand/intro/hooded.jpg', label: 'Hooded figure (p. 34)', pos: '50% 20%' },
  { key: 'hand', src: '/brand/intro/hand.jpg', label: 'Cybernoor hand (p. 25)', pos: '50% 40%' },
  { key: 'helmet', src: '/brand/intro/helmet.jpg', label: 'Orange jacket (p. 5)', pos: '50% 20%' },
  { key: 'visor', src: '/brand/intro/visor.jpg', label: 'Visor (p. 40)', pos: '50% 20%' },
  { key: 'glass', src: '/brand/intro/glass.jpg', label: 'Frosted glass (p. 33)', pos: '60% 40%' },
] as const;
type PanelPic = (typeof PANEL_PICS)[number]['key'];

/** D · after the reference: the form centred on white, a picture on the panel on the right. */
type PointsAt = 'picture' | 'steps' | 'tags' | 'headline' | 'editorial' | 'carousel' | 'chips' | 'foot';
const POINTS_AT: { v: PointsAt; label: string }[] = [
  { v: 'picture', label: 'On the picture' },
  { v: 'steps', label: 'Numbered steps' },
  { v: 'tags', label: 'Floating tags' },
  { v: 'headline', label: 'One headline' },
  { v: 'editorial', label: 'Editorial list' },
  { v: 'carousel', label: 'One at a time' },
  { v: 'chips', label: 'Chips under the line' },
  { v: 'foot', label: 'Row under the form' },
];

/** The three points one at a time on the picture, changing every few seconds, with dots to pick one. */
function PointsCarousel() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % POINTS.length), 3200);
    return () => clearInterval(t);
  }, []);
  const { icon: I, title, body } = POINTS[i];
  return (
    <div className="itd-on itd-on--carousel">
      <span className="itd-points__icon">
        <I size={16} strokeWidth={1.8} />
      </span>
      <div key={i} className="itd-on__slide">
        <b>{title}</b>
        <span>{body}</span>
      </div>
      <div className="itd-on__dots">
        {POINTS.map((p, n) => (
          <button key={p.title} className={cx(n === i && 'is-on')} onClick={() => setI(n)} aria-label={p.title} />
        ))}
      </div>
    </div>
  );
}

/** Every other way to put the three points on the picture. */
function PointsOnPicture({ at }: { at: PointsAt }) {
  if (at === 'picture')
    return (
      <div className="itd-panel__points">
        <span className="itd-panel__label">What the agent does</span>
        <Points />
      </div>
    );
  if (at === 'steps')
    // After the brand book's "Three steps. Every time." (p. 10): Ember numbers in mono, the titles in Bold.
    return (
      <ol className="itd-on itd-on--steps">
        {POINTS.map(({ title, body }, n) => (
          <li key={title}>
            <span className="itd-on__n">0{n + 1}</span>
            <span>
              <b>{title}</b>
              <span>{body}</span>
            </span>
          </li>
        ))}
      </ol>
    );
  if (at === 'tags')
    return (
      <>
        {POINTS.map(({ icon: I, title }, n) => (
          <span key={title} className={`itd-tag itd-tag--${n + 1}`}>
            <I size={14} strokeWidth={1.9} /> {title}
          </span>
        ))}
      </>
    );
  if (at === 'headline')
    return (
      <div className="itd-on itd-on--headline">
        <b>
          Ask. <span>Turn it into work.</span> Approve.
        </b>
        <span>Your brand’s AI agent researches, the Spark team delivers, you decide in one place.</span>
      </div>
    );
  if (at === 'editorial')
    return (
      <ul className="itd-on itd-on--editorial">
        {POINTS.map(({ title }) => (
          <li key={title}>{title}</li>
        ))}
      </ul>
    );
  if (at === 'carousel') return <PointsCarousel />;
  return null;
}

function Panel({ pic, pointsAt }: { pic: PanelPic; pointsAt: PointsAt }) {
  const p: { src: string; pos: string; points?: boolean } = PANEL_PICS.find((x) => x.key === pic)!;
  const at = p.points ? pointsAt : null;
  return (
    <div className="itd itd--panel">
      <section className="itd-panel__main">
        <Logo />
        <div className="itd-panel__form">
          {/* With the glass hood the form stays lean; the three things the agent does sit apart from it. */}
          <AuthForm bare lean={!!p.points} chips={at === 'chips'} />
        </div>
        {at === 'foot' && <Points row compact />}
        <p className="itd-panel__terms">
          By continuing, you agree to Spark’s <a href="#/demo/intro">Terms of Service</a> and <a href="#/demo/intro">Privacy Policy</a>.
        </p>
      </section>
      {/* Until Spark shares the mascot: the glass robot with the flower from the brand book (p. 8). */}
      <aside className="itd-panel__art">
        <img src={p.src} alt="" style={{ objectPosition: p.pos }} />
        {at && <PointsOnPicture at={at} />}
      </aside>
    </div>
  );
}

/** N · D on the brand book's Noor haze (the ground behind the glass hood, p. 34): the form on a
 *  frosted card, the visor portrait (p. 40) on the right. */
function Haze() {
  return (
    <div className="itd itd--panel itd--haze">
      <section className="itd-panel__main">
        <Logo />
        <div className="itd-panel__form">
          <div className="itd-haze__card">
            <AuthForm bare />
          </div>
        </div>
        <p className="itd-panel__terms">
          By continuing, you agree to Spark’s <a href="#/demo/intro">Terms of Service</a> and <a href="#/demo/intro">Privacy Policy</a>.
        </p>
      </section>
      <aside className="itd-panel__art">
        <img src="/brand/intro/visor.jpg" alt="" style={{ objectPosition: '50% 20%' }} />
      </aside>
    </div>
  );
}

// O · what the agent "types" while you sign in: real things it does in the portal.
const TYPING = [
  'Reading what people say about your Riyadh launch…',
  'Comparing your audience with competitors A and B…',
  'Turning the answer into a request for the Spark team…',
  'Checking the proposal against your brand guidelines…',
];
// The caption that comes out of the blur once a line is written (after the reference's author line).
const TYPING_CAPTION = ['Research · with sources', 'Audience · side by side', 'Requests · to the Spark team', 'Approvals · against your guidelines'];

type TypeAnim = 'inplace' | 'type-left' | 'type-centre' | 'wipe' | 'words' | 'shimmer' | 'feed';
const TYPE_ANIMS: { v: TypeAnim; label: string }[] = [
  { v: 'inplace', label: 'Written in place' },
  { v: 'type-left', label: 'Typing, left to right' },
  { v: 'type-centre', label: 'Typing, centred' },
  { v: 'wipe', label: 'Light wipe' },
  { v: 'words', label: 'Word by word' },
  { v: 'shimmer', label: 'Thinking shimmer' },
  { v: 'feed', label: 'Running line, centred' },
];

/** Types a line letter by letter, holds it, clears it, moves on. */
function useTyped(enabled: boolean) {
  const [line, setLine] = useState(0);
  const [n, setN] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    const full = TYPING[line].length;
    const t = setTimeout(
      () => {
        if (!del && n < full) setN(n + 1);
        else if (!del) setDel(true);
        else if (n > 0) setN(Math.max(0, n - 3));
        else {
          setDel(false);
          setLine((l) => (l + 1) % TYPING.length);
        }
      },
      !del && n < full ? 38 : !del ? 1700 : 18,
    );
    return () => clearTimeout(t);
  }, [n, del, line, enabled]);
  return { line, text: TYPING[line].slice(0, n) };
}

/** Whole lines that change every few seconds (the non-typing animations). */
function useCycled(enabled: boolean, ms = 3400) {
  const [line, setLine] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const t = setInterval(() => setLine((l) => (l + 1) % TYPING.length), ms);
    return () => clearInterval(t);
  }, [enabled, ms]);
  return line;
}

/** Written in place (after the reference): the line keeps its final, centred layout and its letters
 *  appear left to right, line by line; then the caption comes out of a blur; then it all fades. */
function useInPlace(enabled: boolean) {
  const [line, setLine] = useState(0);
  const [n, setN] = useState(0);
  const [phase, setPhase] = useState<'write' | 'hold' | 'out'>('write');
  useEffect(() => {
    if (!enabled) return;
    const full = TYPING[line].length;
    const t = setTimeout(
      () => {
        if (phase === 'write') n < full ? setN(n + 1) : setPhase('hold');
        else if (phase === 'hold') setPhase('out');
        else {
          setN(0);
          setPhase('write');
          setLine((l) => (l + 1) % TYPING.length);
        }
      },
      phase === 'write' ? 34 : phase === 'hold' ? 2600 : 450,
    );
    return () => clearTimeout(t);
  }, [n, phase, line, enabled]);
  return { line, n, phase };
}

/** What the agent "does", in one of several animations. Reduced motion: whole lines, no effects. */
function TypingLine({ anim }: { anim: TypeAnim }) {
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const typing = !reduce && (anim === 'type-left' || anim === 'type-centre' || anim === 'feed');
  const inPlace = !reduce && anim === 'inplace';
  const typed = useTyped(typing);
  const placed = useInPlace(inPlace);
  const cycled = useCycled(!typing && !inPlace);
  const line = typing ? typed.line : inPlace ? placed.line : cycled;

  let body: ReactNode;
  if (reduce) body = <p className="itd-type__line">{TYPING[line]}</p>;
  else if (anim === 'inplace')
    body = (
      <div className={cx('itd-type__placed', placed.phase === 'out' && 'is-out')}>
        <p className="itd-type__line" aria-label={TYPING[line]}>
          {TYPING[line].slice(0, placed.n)}
          {/* The rest of the line is already laid out, just not shown: nothing moves while it writes. */}
          <span className="itd-type__ghost" aria-hidden>
            {TYPING[line].slice(placed.n)}
          </span>
        </p>
        <p className={cx('itd-type__caption', placed.phase !== 'write' && 'is-on')}>{TYPING_CAPTION[line]}</p>
      </div>
    );
  else if (anim === 'type-left' || anim === 'type-centre')
    body = (
      <p className="itd-type__line">
        {typed.text}
        <span className="itd-type__caret" aria-hidden />
      </p>
    );
  else if (anim === 'wipe')
    body = (
      <p key={line} className="itd-type__line itd-type__line--wipe">
        {TYPING[line]}
      </p>
    );
  else if (anim === 'words')
    body = (
      <p key={line} className="itd-type__line itd-type__line--words">
        {TYPING[line].split(' ').map((w, i) => (
          <span key={i} style={{ animationDelay: `${i * 90}ms` }}>
            {w}{' '}
          </span>
        ))}
      </p>
    );
  else if (anim === 'shimmer')
    body = (
      <p key={line} className="itd-type__line itd-type__line--shimmer">
        {TYPING[line]}
      </p>
    );
  else
    body = (
      <div className="itd-type__feed">
        {/* Centred, written in place: the rest of the line is laid out but not shown, so it grows left to right. */}
        <p className="itd-type__line" aria-label={TYPING[line]}>
          {typed.text}
          <span className="itd-type__ghost" aria-hidden>
            {TYPING[line].slice(typed.text.length)}
          </span>
        </p>
      </div>
    );

  return (
    <div className={cx('itd-type', `itd-type--${anim}`)} aria-live="polite">
      {body}
      <div className="itd-type__dots" aria-hidden>
        {TYPING.map((t, i) => (
          <span key={t} className={cx(i === line && 'is-on')} />
        ))}
      </div>
    </div>
  );
}

type TypeBg = 'chat' | 'noor' | 'haze';
const TYPE_BGS: { v: TypeBg; label: string }[] = [
  { v: 'chat', label: 'Like the chat page' },
  { v: 'noor', label: 'Noor glow (cover)' },
  { v: 'haze', label: 'Cobalt to Ember haze' },
];

/** O · after the reference: the agent "types" what it does on a colourful panel, the mascot's place
 *  above it; the form on white on the right. */
type TypeMotion = 'still' | 'drift' | 'flow';
const TYPE_MOTIONS: { v: TypeMotion; label: string }[] = [
  { v: 'still', label: 'Still' },
  { v: 'drift', label: 'Slow drift' },
  { v: 'flow', label: 'Livelier flow' },
];

/** The haze as four soft spots (Cobalt, violet, pink, Ember) that float about on their own paths. */
function MovingSpots() {
  return (
    <div className="itd-spots" aria-hidden>
      <span className="itd-spots__s itd-spots__s--cobalt" />
      <span className="itd-spots__s itd-spots__s--violet" />
      <span className="itd-spots__s itd-spots__s--pink" />
      <span className="itd-spots__s itd-spots__s--ember" />
    </div>
  );
}

function Typing({ bg, anim, motion = 'still' }: { bg: TypeBg; anim: TypeAnim; motion?: TypeMotion }) {
  const moving = motion !== 'still' && bg === 'haze';
  return (
    <div className="itd itd--type">
      <section className={cx('itd-type__panel', moving ? `itd-type__panel--spots is-${motion}` : `itd-type__panel--${bg}`)}>
        {moving && <MovingSpots />}
        <div className="itd-type__mascot">
          <span>Mascot</span>
        </div>
        <span className="itd-type__label">Your brand’s AI agent</span>
        <TypingLine key={anim} anim={anim} />
      </section>
      <section className="itd-type__main">
        <div className="itd-type__form">
          <div className="itd-type__logo">
            <img src="/brand/spark-app-icon.jpg" alt="" width={24} height={24} />
            Spark
          </div>
          <AuthForm welcome lean greeting="Welcome" />
        </div>
        <p className="itd-panel__terms">
          By continuing, you agree to Spark’s <a href="#/demo/intro">Terms of Service</a> and <a href="#/demo/intro">Privacy Policy</a>.
        </p>
      </section>
    </div>
  );
}

// Pictures from the brand book (Oct 2026), cropped clear of the page furniture.
const PICS = {
  robot: { src: '/brand/intro/robot.jpg', label: 'Glass robot (p. 8)', title: 'We bring sparks to light.', line: 'Every brand has a spark. Spark finds it, powers it up with AI and brings it to light.' },
  hand: { src: '/brand/intro/hand.jpg', label: 'Cybernoor hand (p. 25)', title: 'Human mind. AI power.', line: 'A human idea enters as clear light. AI is the prism. It leaves as a spectrum.' },
  helmet: { src: '/brand/intro/helmet.jpg', label: 'Portrait (p. 5)', title: 'AI explores. People decide.', line: 'Your brand’s AI agent, with the Spark team at its side.' },
} as const;
type Pic = keyof typeof PICS;

/** A picture from the brand book with its line on a frosted caption. */
function Photo({ pic }: { pic: Pic }) {
  const p = PICS[pic];
  return (
    <figure className="itd-photo">
      <img src={p.src} alt="" />
      <figcaption className="itd-photo__cap">
        <b>{p.title}</b>
        <span>{p.line}</span>
      </figcaption>
    </figure>
  );
}

/** E · night: Sand on Ink, the form on the left, a brand picture on the right. */
function Night({ pic }: { pic: Pic }) {
  return (
    <div className="itd itd--two itd--night">
      <section className="itd-two__main">
        <div className="itd-two__form">
          <img className="itd-two__icon" src="/brand/spark-app-icon.jpg" alt="" />
          <AuthForm bare tabs />
        </div>
      </section>
      <Photo pic={pic} />
    </div>
  );
}

/** F · photo: the same on Sand. */
function PhotoVariant({ pic }: { pic: Pic }) {
  return (
    <div className="itd itd--two itd--photo">
      <section className="itd-two__main">
        <Logo />
        <div className="itd-two__form">
          <AuthForm bare tabs />
        </div>
        <p className="itd-panel__terms">
          By continuing, you agree to Spark’s <a href="#/demo/intro">Terms of Service</a> and <a href="#/demo/intro">Privacy Policy</a>.
        </p>
      </section>
      <Photo pic={pic} />
    </div>
  );
}

/** G · glass: frosted light fills the page, the form on a glass card. */
function Glass() {
  return (
    <div className="itd itd--glass">
      <img className="itd-glass__bg" src="/brand/intro/glass.jpg" alt="" />
      <div className="itd-glass__veil" />
      <div className="itd-glass__head">
        <Logo />
      </div>
      <div className="itd-glass__card">
        <AuthForm bare tabs />
      </div>
    </div>
  );
}

/** H · after the dark red reference: the visor portrait on the left, the form on the right over
 *  Ember rings, the spark in a glowing orb. Ember carries the action here ("Ember for AI"). */
function Ember() {
  const { state } = useStore();
  const spark = state.people.filter((p) => p.org === 'spark');
  return (
    <div className="itd itd--two itd--night itd--ember">
      <figure className="itd-photo itd-ember__photo">
        <img src="/brand/intro/visor.jpg" alt="" />
        <figcaption className="itd-ember__top">
          <b>Your brand’s AI agent</b>
          <span>Backed by the Spark team</span>
        </figcaption>
        <figcaption className="itd-ember__team">
          <AvatarStack people={spark} size={30} max={3} />
          <span>
            <b>Dana, Youssef and Mira</b>
            <span>pick up every request you send</span>
          </span>
        </figcaption>
      </figure>
      <EmberForm />
    </div>
  );
}

/** I · after the soft-card reference: a Noor haze behind one white card; the line on a pale left pane. */
function Soft() {
  return (
    <div className="itd itd--soft">
      <div className="itd-soft__card">
        <section className="itd-soft__side">
          <Logo />
          <img className="itd-soft__mark" src="/brand/spark-app-icon.jpg" alt="" />
          <div>
            <h1 className="itd-soft__h">Your brand’s AI agent</h1>
            <p className="itd-soft__line">Backed by the Spark team.</p>
          </div>
        </section>
        <section className="itd-soft__form">
          <AuthForm initial="signup" />
        </section>
      </div>
    </div>
  );
}

/** J · after the "Smart AI" reference: everything sits in one frosted frame over a Noor haze.
 *  Left, the helmet from the Campaign page (p. 40) and the line on frosted glass; right, the form
 *  card and, under it, the Spark team who answer every request. */
function Smart() {
  const { state } = useStore();
  const spark = state.people.filter((p) => p.org === 'spark');
  return (
    <div className="itd itd--smart">
      <div className="itd-smart__frame">
        <figure className="itd-smart__pic">
          <img src="/brand/intro/helmet3.jpg" alt="" />
          <span className="itd-smart__label">Spark Studios · Abu Dhabi</span>
          <figcaption>
            <b>
              Your brand’s AI agent.
              <span>Backed by people.</span>
            </b>
            <span className="itd-smart__body">Ask about your market and audience, turn answers into work, and approve it all in one place.</span>
            <span className="itd-smart__chips">
              {POINTS.map(({ icon: I, title }) => (
                <span key={title}>
                  <I size={13} strokeWidth={1.9} /> {title}
                </span>
              ))}
            </span>
          </figcaption>
        </figure>
        <div className="itd-smart__col">
          <section className="itd-smart__form">
            <span className="itd-smart__tile">
              <img src="/brand/spark-app-icon.jpg" alt="" />
            </span>
            <AuthForm welcome remember />
          </section>
          <section className="itd-smart__team">
            <AvatarStack people={spark} size={36} max={3} />
            <span>
              <b>Dana, Youssef and Mira</b>
              <span>Your Spark team picks up every request</span>
            </span>
          </section>
        </div>
      </div>
    </div>
  );
}

/** K · after the hero reference: the page opens like a product page; Get started and Sign in open the
 *  form on a glass card over it. */
function Hero() {
  const [open, setOpen] = useState<Mode | null>(null);
  const { state } = useStore();
  const spark = state.people.filter((p) => p.org === 'spark');
  return (
    <div className="itd itd--hero itd--night">
      <div className="itd-hero__top">
        <Logo />
        <button className="link-btn" onClick={() => setOpen('signin')}>
          Sign in
        </button>
      </div>
      <h1 className="itd-hero__h">
        Your brand’s AI agent, backed by <span className="itd-hero__mark">the Spark team</span>
      </h1>
      <p className="itd-hero__sub">{SUB}</p>
      <div className="itd-hero__acts">
        <Button variant="primary" onClick={() => setOpen('signup')}>
          Get started
        </Button>
        <Button variant="secondary" onClick={() => setOpen('signin')}>
          Sign in
        </Button>
      </div>
      <div className="itd-hero__stage">
        <img src="/brand/intro/robot.jpg" alt="" />
        <div className="itd-hero__rail" aria-hidden>
          <MessageSquare size={16} />
          <Send size={16} />
          <CheckCircle2 size={16} />
        </div>
        <div className="itd-hero__card" aria-hidden>
          <AvatarStack people={spark} size={20} max={3} />
          <span>
            <b>Request sent to Spark</b>
            <span>Proposal in 2 days</span>
          </span>
        </div>
        <div className="itd-hero__composer" aria-hidden>
          <span className="itd-hero__spin" />
          Researching how Riyadh talks about your launch…
        </div>
      </div>
      {open && (
        <div className="itd-hero__overlay" onClick={() => setOpen(null)}>
          <div className="itd-hero__dialog" onClick={(e) => e.stopPropagation()}>
            <button className="itd-hero__close" onClick={() => setOpen(null)} aria-label="Close">
              <X size={16} />
            </button>
            <AuthForm key={open} initial={open} bare tabs />
          </div>
        </div>
      )}
    </div>
  );
}

/** The right side of H: the form over Ember rings, the spark in a glowing orb. */
function EmberForm() {
  return (
    <section className="itd-ember__main">
      <div className="itd-ember__orb">
        <img src="/brand/spark-app-icon.jpg" alt="" />
      </div>
      <AuthForm welcome remember />
    </section>
  );
}

/** L · H + C: H's night and portrait; on the portrait, C's example of the agent at work. */
function EmberExample() {
  return (
    <div className="itd itd--two itd--night itd--ember">
      <figure className="itd-photo itd-ember__photo itd-ex__photo">
        <img src="/brand/intro/visor.jpg" alt="" />
        <figcaption className="itd-ember__top">
          <b>Your brand’s AI agent</b>
          <span>Backed by the Spark team</span>
        </figcaption>
        <figcaption className="itd-ex__chat">
          <ChatThread />
        </figcaption>
      </figure>
      <EmberForm />
    </div>
  );
}

/** M · H + B: one column at night; the portrait in place of the mascot with Ember rings around it,
 *  the form on a dark glass card, the three points in a row underneath. */
function EmberCentred() {
  return (
    <div className="itd itd--night itd--ember itd--ec">
      <Logo />
      <div className="itd__col">
        <div className="itd-ec__portrait">
          <img src="/brand/intro/visor.jpg" alt="" />
        </div>
        <h1 className="itd__h">{HEADLINE}</h1>
        <div className="itd__card itd-ec__card">
          <AuthForm welcome remember />
        </div>
        <Points row />
      </div>
    </div>
  );
}

export function IntroDemo() {
  // #/demo/intro?v=typing opens a variant directly.
  const { query } = useRoute();
  const [v, setV] = useState<Variant>(() => (VARIANTS.some((x) => x.v === query.get('v')) ? (query.get('v') as Variant) : 'split'));
  const [pic, setPic] = useState<Pic>('robot');
  const [panelPic, setPanelPic] = useState<PanelPic>('robot');
  const [pointsAt, setPointsAt] = useState<PointsAt>('picture');
  const [typeBg, setTypeBg] = useState<TypeBg>('haze');
  const [typeAnim, setTypeAnim] = useState<TypeAnim>('feed');
  const [typeMotion, setTypeMotion] = useState<TypeMotion>('drift');
  const cur = VARIANTS.find((x) => x.v === v)!;
  return (
    <div className="cdemo">
      <PageHeader title="Introduction page · options" sub="Before sign-in: a short introduction to the agent, sign in by password or email link, and Get started for new companies. The mascot is a placeholder until Spark shares the art." />
      <div className="fdm-switch">
        {VARIANTS.map((x) => (
          <button key={x.v} className={cx(v === x.v && 'is-on')} onClick={() => setV(x.v)}>
            {x.label}
          </button>
        ))}
      </div>
      <p className="fdm-about">{cur.note}</p>
      {v === 'panel' && (
        <div className="fdm-switch itd-pics">
          <span className="faint">Picture</span>
          {PANEL_PICS.map((x) => (
            <button key={x.key} className={cx(panelPic === x.key && 'is-on')} onClick={() => setPanelPic(x.key)}>
              {x.label}
            </button>
          ))}
        </div>
      )}
      {v === 'panel' && panelPic === 'glasshead' && (
        <div className="fdm-switch itd-pics">
          <span className="faint">What the agent does</span>
          {POINTS_AT.map((x) => (
            <button key={x.v} className={cx(pointsAt === x.v && 'is-on')} onClick={() => setPointsAt(x.v)}>
              {x.label}
            </button>
          ))}
        </div>
      )}
      {v === 'typing' && (
        <div className="fdm-switch itd-pics">
          <span className="faint">Panel</span>
          {TYPE_BGS.map((x) => (
            <button key={x.v} className={cx(typeBg === x.v && 'is-on')} onClick={() => setTypeBg(x.v)}>
              {x.label}
            </button>
          ))}
        </div>
      )}
      {v === 'typing' && (
        <div className="fdm-switch itd-pics">
          <span className="faint">Text</span>
          {TYPE_ANIMS.map((x) => (
            <button key={x.v} className={cx(typeAnim === x.v && 'is-on')} onClick={() => setTypeAnim(x.v)}>
              {x.label}
            </button>
          ))}
        </div>
      )}
      {v === 'typing' && typeBg === 'haze' && (
        <div className="fdm-switch itd-pics">
          <span className="faint">Spots</span>
          {TYPE_MOTIONS.map((x) => (
            <button key={x.v} className={cx(typeMotion === x.v && 'is-on')} onClick={() => setTypeMotion(x.v)}>
              {x.label}
            </button>
          ))}
        </div>
      )}
      {(v === 'night' || v === 'photo') && (
        <div className="fdm-switch itd-pics">
          <span className="faint">Picture</span>
          {(Object.keys(PICS) as Pic[]).map((k) => (
            <button key={k} className={cx(pic === k && 'is-on')} onClick={() => setPic(k)}>
              {PICS[k].label}
            </button>
          ))}
        </div>
      )}
      <div className="itd-frame">
        {v === 'split' && <Split />}
        {v === 'centred' && <Centred />}
        {v === 'example' && <Example />}
        {v === 'panel' && <Panel pic={panelPic} pointsAt={pointsAt} />}
        {v === 'haze' && <Haze />}
        {v === 'typing' && <Typing bg={typeBg} anim={typeAnim} motion={typeMotion} />}
        {v === 'night' && <Night pic={pic} />}
        {v === 'photo' && <PhotoVariant pic={pic} />}
        {v === 'glass' && <Glass />}
        {v === 'ember' && <Ember />}
        {v === 'soft' && <Soft />}
        {v === 'smart' && <Smart />}
        {v === 'hero' && <Hero />}
        {v === 'ember-ex' && <EmberExample />}
        {v === 'ember-c' && <EmberCentred />}
      </div>
    </div>
  );
}
