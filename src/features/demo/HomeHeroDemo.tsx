// Prototype-only page (#/demo/home-hero?v=…): Home's header with the client's team under the description
// (their faces and how many work here besides you) and in one card with a stroke, after the client's
// references. The page is the real Home otherwise.
import { useState } from 'react';
import { useRoute, navigate } from '../../lib/router';
import { analyses as seedAnalyses } from '../../data/mock';
import { PageHeader, cx } from '../../components/ui/primitives';
import { MainSide, useModel, type ReqIcons, type ReqLook, type IssueActions, type OverviewLook } from '../home/HomeLayouts';

const VARIANTS = [
  { v: 'now', label: 'Before', team: false, framed: false, note: 'The header before: no team, no card.' },
  { v: 'team', label: 'A · Team', team: true, framed: false, note: 'The client’s team under the description: their faces and “Brand Co. team · you and 2 colleagues”; it opens Team. Only the client’s people: Spark stays one team.' },
  { v: 'frame', label: 'B · Card', team: false, framed: true, note: 'The header, from the cover to the requests, in one card with a hairline stroke, no fill; the tabs stay under it.' },
  { v: 'both', label: 'C · Team + card', team: true, framed: true, note: 'Both: the team line inside the card.' },
  { v: 'divider', label: 'D · Divider', team: true, framed: 'divider', note: 'One card; the requests under a hairline across it, so the company and its requests read as two parts of one header.' },
  { v: 'split', label: 'E · Two cards (on Home)', team: true, framed: 'split', note: 'Two cards: the company (cover, name, description, team, credits, Ask Spark), then the requests in a card of their own.' },
] as const;

export function HomeHeroDemo() {
  const { query } = useRoute();
  const cur = VARIANTS.find((x) => x.v === query.get('v')) ?? VARIANTS[5];
  const icons: ReqIcons = query.get('icons') === 'line' ? 'line' : 'emoji';
  const look: ReqLook = query.get('reqs') === 'tiles' ? 'tiles' : 'cols';
  const iss = (['inside', 'hover', 'always', 'menu', 'hybrid'] as const).find((x) => x === query.get('issues')) ?? 'none';
  const ov = (['cols', 'pager', 'impact', 'tabs'] as const).find((x) => x === query.get('overview')) ?? 'stack';
  // The company's avatar, quieter: white, greys (grey on Home), Haze, no fill, or Ink as before.
  const AVATARS = [
    ['white', 'White'],
    ['grey', 'Light grey'],
    ['grey2', 'Grey (on Home)'],
    ['haze', 'Haze'],
    ['outline', 'No fill'],
    ['ink', 'Ink (before)'],
  ] as const;
  const [avatar, setAvatar] = useState<(typeof AVATARS)[number][0]>('grey2');
  // The cover, after the brand book's covers: the light on Sand, no grey at the foot.
  const COVERS = [
    ['now', 'Before'],
    ['noor', 'A · Noor field'],
    ['halo', 'B · Light in the middle'],
    ['cluster', 'C · One cluster'],
    ['wash', 'D · Chapter wash'],
    ['frost', 'E · Frosted'],
    ['ink', 'F · Ink + light'],
    ['chapter', 'G · Chapter cover (on Home)'],
  ] as const;
  const [cover, setCover] = useState<(typeof COVERS)[number][0]>('chapter');
  const PROFILES = [
    ['rows', 'Now · rows'],
    ['groups', 'A · Three groups'],
    ['plain', 'B · Rows, no lines'],
  ] as const;
  const BTNS = [
    ['now', 'Now · stroke'],
    ['soft', 'A · Soft, as the chat box’s +'],
  ] as const;
  const [btns, setBtns] = useState<(typeof BTNS)[number][0]>('soft');
  const [profile, setProfile] = useState<(typeof PROFILES)[number][0]>('plain');
  const go = (v: string, i: ReqIcons, l: ReqLook = look, a: IssueActions = iss, o: OverviewLook = ov) =>
    navigate(`/demo/home-hero?v=${v}&icons=${i}&reqs=${l}&issues=${a}&overview=${o}`, { replace: true });
  const m = useModel(seedAnalyses);
  return (
    <div className="cdemo">
      <PageHeader title="Home · team and card" sub="The client’s team in the header, and the header in one card. Prototype only: this page isn’t in the portal’s navigation." />
      <div className="fdm-switch">
        {VARIANTS.map((x) => (
          <button key={x.v} className={cx(cur.v === x.v && 'is-on')} onClick={() => go(x.v, icons)}>
            {x.label}
          </button>
        ))}
      </div>
      <p className="fdm-about">{cur.note}</p>
      <div className="fdm-switch hd-looks">
        <span className="faint">Request icons</span>
        {(
          [
            ['emoji', 'Emoji (on Home)'],
            ['line', 'Icons'],
          ] as const
        ).map(([i, label]) => (
          <button key={i} className={cx(icons === i && 'is-on')} onClick={() => go(cur.v, i)}>
            {label}
          </button>
        ))}
      </div>
      {/* Requests as tiles, after the client's reference: each stage a raised card in a tray with what's next
          under it. Shown with Two cards. */}
      <div className="fdm-switch hd-looks">
        <span className="faint">Requests</span>
        {(
          [
            ['cols', 'Columns (on Home)'],
            ['tiles', 'Tiles'],
          ] as const
        ).map(([l, label]) => (
          <button key={l} className={cx(look === l && 'is-on')} onClick={() => go(cur.v, icons, l)}>
            {label}
          </button>
        ))}
      </div>
      {/* Make it a request and Ask Spark on each issue: inside "What we'd do", or on hover at the top right. */}
      <div className="fdm-switch hd-looks">
        <span className="faint">Issue actions</span>
        {(
          [
            ['none', 'None (on Home)'],
            ['inside', '1 · In “What we’d do”'],
            ['hover', '2 · On hover'],
            ['always', '3 · Always'],
            ['menu', '4 · All in ⋯'],
            ['hybrid', '5 · Two + ⋯'],
          ] as const
        ).map(([a, label]) => (
          <button key={a} className={cx(iss === a && 'is-on')} onClick={() => go(cur.v, icons, look, a)}>
            {label}
          </button>
        ))}
      </div>
      {/* The overview as a dashboard of stroked cards, after the client's reference. */}
      <div className="fdm-switch hd-looks">
        <span className="faint">Overview</span>
        {(
          [
            ['stack', 'Sections (on Home)'],
            ['cols', 'A · Two columns'],
            ['pager', 'B · One issue at a time'],
            ['impact', 'C · By impact'],
            ['tabs', 'D · By impact, as tabs'],
          ] as const
        ).map(([o, label]) => (
          <button key={o} className={cx(ov === o && 'is-on')} onClick={() => go(cur.v, icons, look, iss, o)}>
            {label}
          </button>
        ))}
      </div>
      <div className="fdm-switch hd-looks">
        <span className="faint">Avatar</span>
        {AVATARS.map(([v, label]) => (
          <button key={v} className={cx(avatar === v && 'is-on')} onClick={() => setAvatar(v)}>
            {label}
          </button>
        ))}
      </div>
      <div className="fdm-switch hd-looks">
        <span className="faint">Cover</span>
        {COVERS.map(([v, label]) => (
          <button key={v} className={cx(cover === v && 'is-on')} onClick={() => setCover(v)}>
            {label}
          </button>
        ))}
      </div>
      <div className="fdm-switch hd-looks">
        <span className="faint">Buttons</span>
        {BTNS.map(([v, label]) => (
          <button key={v} className={cx(btns === v && 'is-on')} onClick={() => setBtns(v)}>
            {label}
          </button>
        ))}
      </div>
      <p className="fdm-about">
        {btns === 'soft'
          ? 'The secondary buttons (Request proposal, Ask Spark on the issue, the menu and the arrows, Your requests) as the + in the chat box: a breath of white, a faint white edge, a soft shadow, no grey stroke.'
          : 'As now: a grey stroke, no fill.'}
      </p>
      <div className="fdm-switch hd-looks">
        <span className="faint">Company profile</span>
        {PROFILES.map(([v, label]) => (
          <button key={v} className={cx(profile === v && 'is-on')} onClick={() => setProfile(v)}>
            {label}
          </button>
        ))}
      </div>
      <p className="fdm-about">
        {profile === 'groups'
          ? 'No second title (the tab says it); who keeps it, small on the right of the tabs. The facts as a grid across the width, the audiences and the voice in columns, small mono labels, a line between groups only.'
          : profile === 'plain'
            ? 'A row per fact as now, but no title and no lines: the label on the left, the value beside it, air between the rows; who keeps it on the right of the tabs.'
            : 'As on Home now: a title, then a row per fact, a line under each.'}{' '}
        On the Company profile tab.
      </p>
      <div className="hd-frame hl-frame" data-avatar={avatar} data-cover={cover} data-btns={btns}>
        <MainSide key={profile} m={m} reqs="summary" team={cur.team} framed={cur.framed} reqIcons={icons} reqLook={look} issueActions={iss} overviewLook={ov} profileLook={profile} startTab="overview" />
      </div>
    </div>
  );
}
